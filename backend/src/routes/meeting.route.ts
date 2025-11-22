import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import { createMeetBookingForGuestController, getUserMeetingsController, cancelMeetingController } from "../controllers/meeting.controller";

export const meetingRoutes = Router();

meetingRoutes.get(
  "/user/all",
  passportAuthenticateJwt,
  getUserMeetingsController
);

meetingRoutes.post("/public/create", createMeetBookingForGuestController);

meetingRoutes.put(
  "/cancel/:meetingId",
  passportAuthenticateJwt,
  cancelMeetingController
);

export default meetingRoutes;