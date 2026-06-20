import { AvailabilityResponseType } from "../@types/availability.type";
import { AppDataSource } from "../config/database.config";
import { UpdateAvailabilityDto } from "../database/dto/availability.dto";
import { Availability } from "../database/entities/availability.entities";
import { DayAvailability, DayOfWeekEnum } from "../database/entities/day-availability";
import { User } from "../database/entities/user.entity";
import { Event } from "../database/entities/event.entity";
import { NotFoundException } from "../utils/app-error";
import { addDays, addMinutes, format, getDay, parseISO } from "date-fns";
import { Meeting } from "../database/entities/meeting.entity";
import { toZonedTime, format as formatTz } from "date-fns-tz";


// Weekdays that are available by default when a day has no stored config yet.
const DEFAULT_AVAILABLE_DAYS = new Set<DayOfWeekEnum>([
  DayOfWeekEnum.MONDAY,
  DayOfWeekEnum.TUESDAY,
  DayOfWeekEnum.WEDNESDAY,
  DayOfWeekEnum.THURSDAY,
  DayOfWeekEnum.FRIDAY,
]);

export const getUserAvailabilityService = async (userId: string) => {
  const user = await AppDataSource.getRepository(User).findOne({
    where: { id: userId },
    relations: ["availability", "availability.days"],
  });

  if (!user || !user.availability) {
    throw new NotFoundException("User not found or availability missing");
  }

  const storedDays = new Map(
    user.availability.days.map((day) => [day.day, day])
  );

  // Always return all 7 days (flat startTime/endTime) so the editor stays usable
  // even if the stored data is partial or empty.
  const days = Object.values(DayOfWeekEnum).map((dayName) => {
    const stored = storedDays.get(dayName);
    const slot = stored?.timeSlots?.[0];
    return {
      day: dayName,
      startTime: slot?.startTime || "09:00",
      endTime: slot?.endTime || "17:00",
      isAvailable: stored
        ? stored.isAvailable
        : DEFAULT_AVAILABLE_DAYS.has(dayName),
    };
  });

  const availabilityData: AvailabilityResponseType = {
    timeGap: user.availability.timeGap,
    timezone: user.availability.timezone,
    days,
  };

  return availabilityData;
};

export const updateAvailabilityService = async (
  userId: string,
  data: UpdateAvailabilityDto
) => {
  const userRepository = AppDataSource.getRepository(User);
  const availabilityRepository = AppDataSource.getRepository(Availability);
  const dayAvailabilityRepository =
    AppDataSource.getRepository(DayAvailability);

  const user = await userRepository.findOne({
    where: { id: userId },
    relations: ["availability", "availability.days"],
  });

  if (!user) throw new NotFoundException("User not found");
  if (!user.availability)
    throw new NotFoundException("Availability not found for user");

  const availabilityId = user.availability.id;

  // The frontend sends a flat shape per day: { day, startTime, endTime, isAvailable }.
  // Persist it as a single HH:mm timeSlot (the format the booking + meeting services expect).
  const dayAvailabilityData = data.days.map(
    ({ day, isAvailable, startTime, endTime }) => ({
      day: day.toUpperCase() as DayOfWeekEnum,
      isAvailable,
      timeSlots:
        startTime && endTime ? [{ startTime, endTime }] : [],
      breaks: [] as { start: string; end: string }[],
      availability: { id: availabilityId },
    })
  );

  // Remove existing day rows to avoid stale/duplicate entries, then save fresh ones.
  await dayAvailabilityRepository.delete({
    availability: { id: availabilityId },
  });

  await availabilityRepository.save({
    id: availabilityId,
    timeGap: data.timeGap,
    timezone: data.timezone || "UTC",
    days: dayAvailabilityData,
  });

  return { success: true };
};


export const getAvailabilityForPublicEventService = async (eventId: string, timezone: string = "UTC") => {
  const event = await AppDataSource.getRepository(Event).findOne({
    where: { id: eventId, isPrivate: false },
    relations: ["user", "user.availability", "user.availability.days", "user.meetings"],
  });

  if (!event || !event.user.availability) return [];

  const { availability, meetings } = event.user;
  const daysOfWeek = Object.values(DayOfWeekEnum);
  const availableDays = [];

  for (const day of daysOfWeek) {
    const date = getNextDateForDay(day);
    const dayAvailability = availability.days.find((d) => d.day === day);

    if (dayAvailability) {
      const slots = dayAvailability.isAvailable
        ? (dayAvailability.timeSlots || []).flatMap(({ startTime, endTime }) =>
            generateAvailableTimeSlots(
              parseISO(`${format(date, "yyyy-MM-dd")}T${startTime}`),
              parseISO(`${format(date, "yyyy-MM-dd")}T${endTime}`),
              event.duration,
              meetings,
              format(date, "yyyy-MM-dd"),
              availability.timeGap,
              dayAvailability.breaks || [],
              timezone // ⬅️ PASS timezone
            )
          )
        : [];

      availableDays.push({
        day,
        slots,
        isAvailable: dayAvailability.isAvailable,
      });
    }
  }

  return availableDays;
};

function getNextDateForDay(dayOfWeek: string): Date {
  const days = [
    "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY",
    "THURSDAY", "FRIDAY", "SATURDAY"
  ];
  const today = new Date();
  const todayDay = today.getDay();
  const targetDay = days.indexOf(dayOfWeek);
  const daysUntilTarget = (targetDay - todayDay + 7) % 7;
  return addDays(today, daysUntilTarget);
}

function generateAvailableTimeSlots(
  startTime: Date,
  endTime: Date,
  duration: number,
  meetings: { startTime: Date; endTime: Date }[],
  dateStr: string,
  timeGap: number,
  breaks: { start: string; end: string }[],
  timezone: string // ⬅️ New param
) {
  const slots = [];
  let slotStart = startTime;
  const now = new Date();
  const isToday = format(now, "yyyy-MM-dd") === dateStr;

  while (slotStart < endTime) {
    const slotEnd = addMinutes(slotStart, duration);
    if (
      (!isToday || slotStart >= now) &&
      isSlotAvailable(slotStart, slotEnd, meetings) &&
      !isSlotInBreak(slotStart, slotEnd, breaks, dateStr)
    ) {
      const zoned = toZonedTime(slotStart, timezone);
      slots.push(formatTz(zoned, "HH:mm", { timeZone: timezone }));
    }
    slotStart = addMinutes(slotStart, timeGap);
  }

  return slots;
}

function isSlotAvailable(
  slotStart: Date,
  slotEnd: Date,
  meetings: { startTime: Date; endTime: Date }[]
) {
  return !meetings.some(m => slotStart < m.endTime && slotEnd > m.startTime);
}

function isSlotInBreak(
  slotStart: Date,
  slotEnd: Date,
  breaks: { start: string; end: string }[],
  dateStr: string
) {
  return breaks.some(b => {
    const breakStart = parseISO(`${dateStr}T${b.start}`);
    const breakEnd = parseISO(`${dateStr}T${b.end}`);
    return slotStart < breakEnd && slotEnd > breakStart;
  });
}