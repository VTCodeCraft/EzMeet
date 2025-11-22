import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/AsyncHandler.middleware";
import { Request, Response } from "express";
import { getAvailabilityForPublicEventService, getUserAvailabilityService, updateAvailabilityService } from "../services/availability.service";
import { UpdateAvailabilityDto } from "../database/dto/availability.dto";
import { asyncHandleAndValidate } from "../middlewares/withValidation.middleware";
import { EventIdDto } from "../database/dto/event.dto";

export const getUserAvailabilityController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id as string;

    const availability = await getUserAvailabilityService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Fetched availability successfully",
      availability,
    });
  }
);

export const updateAvailabilityController = asyncHandleAndValidate(
         UpdateAvailabilityDto,
         "body",
         async (req: Request, res: Response, updateAvailabilityDto) => {
         const userId = req.user?.id as string;

         await updateAvailabilityService(userId, updateAvailabilityDto);

         return res.status(HTTPSTATUS.OK).json({
         message: "Availability updated successfully",
    });
  }
);

// For Public Event
export const getAvailabilityForPublicEventController = asyncHandleAndValidate(
  EventIdDto,
  "params",
  async (req: Request, res: Response, eventIdDto) => {
    const timezone = (req.query.timezone as string) || "UTC";

    const availability = await getAvailabilityForPublicEventService(
      eventIdDto.eventId,
      timezone
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Event availability fetched successfully",
      data: availability,
    });
  }
);
  
