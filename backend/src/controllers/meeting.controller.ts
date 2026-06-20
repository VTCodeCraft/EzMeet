import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import {
  MeetingFilterEnum,
  MeetingFilterEnumType,
} from "../enums/meeting.enum";
import {
  createMeetBookingForGuestService,
  getUserMeetingsService,
  cancelMeetingService,
  cancelMeetingByGuestService,
} from "../services/meeting.service";
import { asyncHandleAndValidate } from "../middlewares/withValidation.middleware";
import { CreateMeetingDto, MeetingIdDTO } from "../database/dto/meeting.dto";
import { asyncHandler } from "../middlewares/AsyncHandler.middleware";

export const getUserMeetingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id as string;

    const filter =
      (req.query.filter as MeetingFilterEnumType) || MeetingFilterEnum.UPCOMING;

    const meetings = await getUserMeetingsService(userId, filter);

    return res.status(HTTPSTATUS.OK).json({
      message: "Meetings fetched successfully",
      meetings,
    });
  }
);

// For Public
export const createMeetBookingForGuestController = asyncHandleAndValidate(
  CreateMeetingDto,
  "body",
  async (req: Request, res: Response, createMeetingDto) => {
    const { meetLink, meeting } = await createMeetBookingForGuestService(
      createMeetingDto
    );
    return res.status(HTTPSTATUS.CREATED).json({
      message: "Meeting scheduled successfully",
      data: {
        meetLink,
        meeting,
      },
    });
  }
);


export const cancelMeetingController = asyncHandleAndValidate(
  MeetingIdDTO,
  "params",
  async (req: Request, res: Response, meetingIdDto) => {
    await cancelMeetingService(meetingIdDto.meetingId);
    return res.status(HTTPSTATUS.OK).json({
      messsage: "Meeting cancelled successfully",
    });
  }
);

// For Public (guest-initiated). Removes the meeting only from the guest's
// calendar; requires the guest's email to match the booking.
export const cancelMeetingByGuestController = asyncHandleAndValidate(
  MeetingIdDTO,
  "params",
  async (req: Request, res: Response, meetingIdDto) => {
    const guestEmail = (req.body?.guestEmail as string) || "";

    await cancelMeetingByGuestService(meetingIdDto.meetingId, guestEmail);

    return res.status(HTTPSTATUS.OK).json({
      message: "Meeting cancelled successfully",
    });
  }
);