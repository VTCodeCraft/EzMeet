import { LessThan, MoreThan } from "typeorm";
import { AppDataSource } from "../config/database.config";
import { Meeting, MeetingStatus } from "../database/entities/meeting.entity";
import { MeetingFilterEnum, MeetingFilterEnumType } from "../enums/meeting.enum";
import { CreateMeetingDto } from "../database/dto/meeting.dto";
import { Integration, IntegrationAppTypeEnum } from "../database/entities/integration.entity";
import {
         Event,
         EventLocationEnumType,
} from "../database/entities/event.entity";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { googleOAuth2Client } from "../config/oauth.config";
import { validateGoogleToken } from "./integration.service";
import { google } from "googleapis";
import { DayAvailability, DayOfWeekEnum } from "../database/entities/day-availability";
import { Availability } from "../database/entities/availability.entities";

export const getUserMeetingsService = async (
         userId: string,
         filter: MeetingFilterEnumType
) => {
         const meetingRepository = AppDataSource.getRepository(Meeting);

         const where: any = { user: { id: userId } };

         if (filter === MeetingFilterEnum.UPCOMING) {
                  where.status = MeetingStatus.SCHEDULED;
                  where.startTime = MoreThan(new Date());
         } else if (filter === MeetingFilterEnum.PAST) {
                  where.status = MeetingStatus.SCHEDULED;
                  where.startTime = LessThan(new Date());
         } else if (filter === MeetingFilterEnum.CANCELLED) {
                  where.status = MeetingStatus.CANCELLED;
         } else {
                  where.status = MeetingStatus.SCHEDULED;
                  where.startTime = MoreThan(new Date());
         }

         const meetings = await meetingRepository.find({
                  where,
                  relations: ["event"],
                  order: { startTime: "ASC" },
         });

         return meetings || [];
};


export const createMeetBookingForGuestService = async (
         createMeetingDto: CreateMeetingDto
) => {
         const { eventId, guestEmail, guestName, additionalInfo } = createMeetingDto;
         const startTime = new Date(createMeetingDto.startTime);
         const endTime = new Date(createMeetingDto.endTime);

         const eventRepository = AppDataSource.getRepository(Event);
         const integrationRepository = AppDataSource.getRepository(Integration);
         const meetingRepository = AppDataSource.getRepository(Meeting);
         const dayAvailabilityRepository = AppDataSource.getRepository(DayAvailability);
         const availabilityRepository = AppDataSource.getRepository(Availability);

         const event = await eventRepository.findOne({
                  where: { id: eventId, isPrivate: false },
                  relations: ["user"],
         });

         if (!event) throw new NotFoundException("Event not found");

         if (!Object.values(EventLocationEnumType).includes(event.locationType)) {
                  throw new BadRequestException("Invalid location type");
         }

         const meetIntegration = await integrationRepository.findOne({
                  where: {
                           user: { id: event.user.id },
                           app_type: IntegrationAppTypeEnum[event.locationType],
                  },
         });

         if (!meetIntegration)
                  throw new BadRequestException("No video conferencing integration found");

         let meetLink: string = "";
         let calendarEventId: string = "";
         let calendarAppType: IntegrationAppTypeEnum;

         if (event.locationType === EventLocationEnumType.GOOGLE_MEET_AND_CALENDAR) {
                  const { calendarType, calendar } = await getCalendarClient(
                           meetIntegration.app_type,
                           meetIntegration.access_token,
                           meetIntegration.refresh_token,
                           meetIntegration.expiry_date
                  );
                  const response = await calendar.events.insert({
                           calendarId: "primary",
                           conferenceDataVersion: 1,
                           sendUpdates: "all",
                           requestBody: {
                                    summary: `${guestName} - ${event.title}`,
                                    description: additionalInfo,
                                    start: { dateTime: startTime.toISOString() },
                                    end: { dateTime: endTime.toISOString() },
                                    attendees: [{ email: guestEmail }, { email: event.user.email }],
                                    conferenceData: {
                                             createRequest: {
                                                      requestId: `${event.id}-${Date.now()}`,
                                             },
                                    },
                           },
                  });
                  meetLink = response.data.hangoutLink!;
                  calendarEventId = response.data.id!;
                  calendarAppType = calendarType;
         } else {
                  calendarAppType = meetIntegration.app_type;
         }

         const meeting = meetingRepository.create({
                  event: { id: event.id },
                  user: event.user,
                  guestName,
                  guestEmail,
                  additionalInfo,
                  startTime,
                  endTime,
                  meetLink: meetLink,
                  calendarEventId: calendarEventId,
                  calendarAppType: calendarAppType,
         });

         await meetingRepository.save(meeting);

         const availability = await availabilityRepository.findOne({
                  where: { user: { id: event.user.id } },
                  relations: ["days"],
         });

         if (availability) {
                  const weekday = startTime.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase() as DayOfWeekEnum;

                  const dayAvailability = availability.days.find(
                           (day) => day.day === weekday
                  );

                  if (dayAvailability) {
                           const updatedSlots = [];
                           for (const slot of dayAvailability.timeSlots) {
                                    const slotStart = new Date(`1970-01-01T${slot.startTime}:00`);
                                    const slotEnd = new Date(`1970-01-01T${slot.endTime}:00`);

                                    const bookedStart = new Date(`1970-01-01T${startTime.toTimeString().slice(0, 5)}:00`);
                                    const bookedEnd = new Date(`1970-01-01T${endTime.toTimeString().slice(0, 5)}:00`);

                                    // Check if booking overlaps with slot
                                    if (bookedStart <= slotEnd && bookedEnd >= slotStart) {
                                             // Split the slot if needed
                                             if (bookedStart > slotStart) {
                                                      updatedSlots.push({
                                                               startTime: slot.startTime,
                                                               endTime: bookedStart.toTimeString().slice(0, 5),
                                                      });
                                             }
                                             if (bookedEnd < slotEnd) {
                                                      updatedSlots.push({
                                                               startTime: bookedEnd.toTimeString().slice(0, 5),
                                                               endTime: slot.endTime,
                                                      });
                                             }
                                    } else {
                                             // No overlap, keep the slot
                                             updatedSlots.push(slot);
                                    }
                           }

                           dayAvailability.timeSlots = updatedSlots;
                           await dayAvailabilityRepository.save(dayAvailability);
                  }
         }

         return {
                  meetLink,
                  meeting,
         };
};
export const cancelMeetingService = async (meetingId: string) => {
         const meetingRepository = AppDataSource.getRepository(Meeting);
         const integrationRepository = AppDataSource.getRepository(Integration);

         const meeting = await meetingRepository.findOne({
                  where: { id: meetingId },
                  relations: ["event", "event.user"],
         });

         if (!meeting) throw new NotFoundException("Meeting not found");
         try {
                  const calendarIntegration = await integrationRepository.findOne({
                           where: {
                                    app_type:
                                             IntegrationAppTypeEnum[
                                             meeting.calendarAppType as keyof typeof IntegrationAppTypeEnum
                                             ],
                           },
                  });

                  // const calendarIntegration = await integrationRepository.findOne({
                  //   where: [
                  //     {
                  //       user: { id: meeting.event.user.id },
                  //       category: IntegrationCategoryEnum.CALENDAR_AND_VIDEO_CONFERENCING,
                  //     },
                  //     {
                  //       user: { id: meeting.event.user.id },
                  //       category: IntegrationCategoryEnum.CALENDAR,
                  //     },
                  //   ],
                  // });

                  if (calendarIntegration) {
                           const { calendar, calendarType } = await getCalendarClient(
                                    calendarIntegration.app_type,
                                    calendarIntegration.access_token,
                                    calendarIntegration.refresh_token,
                                    calendarIntegration.expiry_date
                           );
                           switch (calendarType) {
                                    case IntegrationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR:
                                             await calendar.events.delete({
                                                      calendarId: "primary",
                                                      eventId: meeting.calendarEventId,
                                                      sendUpdates: "all",
                                             });
                                             break;
                                    default:
                                             throw new BadRequestException(
                                                      `Unsupported calendar provider: ${calendarType}`
                                             );
                           }
                  }
         } catch (error) {
                  throw new BadRequestException("Failed to delete event from calendar");
         }

         meeting.status = MeetingStatus.CANCELLED;
         await meetingRepository.save(meeting);
         return { success: true };
};

/**
 * Guest-initiated cancellation. Unlike the organizer flow (which deletes the
 * event for everyone), this only removes the guest from the calendar event's
 * attendee list, so the event disappears from the guest's calendar but stays on
 * the organizer's. The meeting row is marked CANCELLED.
 *
 * `guestEmail` must match the meeting's guest — this is the only authorization
 * for this otherwise-public action, so the meeting id alone isn't enough.
 */
export const cancelMeetingByGuestService = async (
         meetingId: string,
         guestEmail: string
) => {
         const meetingRepository = AppDataSource.getRepository(Meeting);
         const integrationRepository = AppDataSource.getRepository(Integration);

         const meeting = await meetingRepository.findOne({
                  where: { id: meetingId },
                  relations: ["event", "event.user"],
         });

         if (!meeting) throw new NotFoundException("Meeting not found");

         if (
                  !guestEmail ||
                  meeting.guestEmail.toLowerCase() !== guestEmail.toLowerCase()
         ) {
                  throw new BadRequestException(
                           "Guest email does not match this meeting"
                  );
         }

         if (meeting.status === MeetingStatus.CANCELLED) {
                  return { success: true };
         }

         try {
                  const calendarIntegration = await integrationRepository.findOne({
                           where: {
                                    user: { id: meeting.event.user.id },
                                    app_type: meeting.calendarAppType,
                           },
                  });

                  if (calendarIntegration && meeting.calendarEventId) {
                           const { calendar, calendarType } = await getCalendarClient(
                                    calendarIntegration.app_type,
                                    calendarIntegration.access_token,
                                    calendarIntegration.refresh_token,
                                    calendarIntegration.expiry_date
                           );

                           switch (calendarType) {
                                    case IntegrationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR:
                                             // Remove the guest from the attendee list. This drops the event
                                             // from the guest's calendar while keeping it on the organizer's.
                                             await calendar.events.patch({
                                                      calendarId: "primary",
                                                      eventId: meeting.calendarEventId,
                                                      sendUpdates: "all",
                                                      requestBody: {
                                                               attendees: [{ email: meeting.event.user.email }],
                                                      },
                                             });
                                             break;
                                    default:
                                             throw new BadRequestException(
                                                      `Unsupported calendar provider: ${calendarType}`
                                             );
                           }
                  }
         } catch (error) {
                  throw new BadRequestException(
                           "Failed to remove guest from calendar event"
                  );
         }

         meeting.status = MeetingStatus.CANCELLED;
         await meetingRepository.save(meeting);
         return { success: true };
};

/**
 * Deletes the calendar event backing a meeting from the organizer's connected
 * calendar provider. Safe to call when there is no calendar event or no
 * matching integration (it just no-ops). Scoped to the meeting's own user.
 */
export const deleteMeetingFromCalendar = async (meeting: {
         calendarEventId?: string | null;
         calendarAppType?: IntegrationAppTypeEnum | null;
         user?: { id: string } | null;
}) => {
         if (!meeting.calendarEventId || !meeting.calendarAppType) return;

         const integrationRepository = AppDataSource.getRepository(Integration);

         const integration = await integrationRepository.findOne({
                  where: {
                           ...(meeting.user?.id ? { user: { id: meeting.user.id } } : {}),
                           app_type: meeting.calendarAppType,
                  },
         });

         if (!integration) return;

         const { calendar, calendarType } = await getCalendarClient(
                  integration.app_type,
                  integration.access_token,
                  integration.refresh_token,
                  integration.expiry_date
         );

         switch (calendarType) {
                  case IntegrationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR:
                           await calendar.events.delete({
                                    calendarId: "primary",
                                    eventId: meeting.calendarEventId,
                                    sendUpdates: "all",
                           });
                           break;
                  default:
                           throw new BadRequestException(
                                    `Unsupported calendar provider: ${calendarType}`
                           );
         }
};

async function getCalendarClient(
         appType: IntegrationAppTypeEnum,
         access_token: string,
         refresh_token: string,
         expiry_date: number | null
) {
         switch (appType) {
                  case IntegrationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR:
                           const validToken = await validateGoogleToken(
                                    access_token,
                                    refresh_token,
                                    expiry_date
                           );
                           googleOAuth2Client.setCredentials({ access_token: validToken });
                           const calendar = google.calendar({
                                    version: "v3",
                                    auth: googleOAuth2Client,
                           });
                           return {
                                    calendar,
                                    calendarType: IntegrationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR,
                           };
                  default:
                           throw new BadRequestException(
                                    `Unsupported Calendar provider: ${appType}`
                           );
         }
}