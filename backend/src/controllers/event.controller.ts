import { HTTPSTATUS } from "../config/http.config";
import e, { Request, Response } from "express";
import { asyncHandleAndValidate } from "../middlewares/withValidation.middleware";
import { CreateEventDto, EventIdDto, UserNameAndSlugDTO, UserNameDTO } from "../database/dto/event.dto";
import { createEventService, deleteEventService, getPublicEventByUsernameAndSlugService, getPublicEventsByUsernameService, getUserEventsService ,toggleEventPrivacyService } from "../services/event.service";
import { asyncHandler } from "../middlewares/AsyncHandler.middleware";

export const createEventController = asyncHandleAndValidate(
         CreateEventDto , 
         "body",
         async(req:Request , res:Response, createEventDto)=>{
                  const userId = req.user?.id as string;

                  const event = await createEventService(userId,createEventDto);
                  return res.status(HTTPSTATUS.CREATED).json({
                           message: "Event created succesfully",
                           event,

                  });
         }
);

export const getUserEventsController = asyncHandler(
         async(req: Request, res: Response)=>{
                  const userId = req.user?.id as string;
                  const {events , username} = await getUserEventsService(userId);
                  
                  return res.status(HTTPSTATUS.CREATED).json({
                           message: "User event fetched succesfully",
                           data:{
                                    events,
                                    username,
                           }
                  });

         }
)

export const toggleEventPrivacyController = asyncHandleAndValidate(
  EventIdDto,
  "body",
  async (req: Request, res: Response, eventIdDto) => {
    const userId = req.user?.id as string;

    const event = await toggleEventPrivacyService(userId, eventIdDto.eventId);

    return res.status(HTTPSTATUS.OK).json({
      message: `Event set to ${
        event.isPrivate ? "private" : "public"
      } successfully`,
    });
  }
);

//Public Events
export const getPublicEventsByUsernameController = asyncHandleAndValidate(
  UserNameDTO,
  "params",

  async (req: Request, res: Response, userNameDto) => {
    const { user, events } = await getPublicEventsByUsernameService(
      userNameDto.username
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Public events fetched successfully",
      user,
      events,
    });
  }
);

export const getPublicEventByUsernameAndSlugController =
  asyncHandleAndValidate(
    UserNameAndSlugDTO,
    "params",
    async (req: Request, res: Response, userNameAndSlugDto) => {
      const event = await getPublicEventByUsernameAndSlugService(
        userNameAndSlugDto
      );

      return res.status(HTTPSTATUS.OK).json({
        message: "Event details fetched successfully",
        event,
      });
    }
  );

  export const deleteEventController = asyncHandleAndValidate(
  EventIdDto,
  "params",
  async (req: Request, res: Response, eventIdDto) => {
    const userId = req.user?.id as string;

    await deleteEventService(userId, eventIdDto.eventId);
    return res.status(HTTPSTATUS.OK).json({
      message: "Event deleted successfully",
    });
  }
);