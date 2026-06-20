import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.middleware";
import { createMeetBookingForGuestController, getUserMeetingsController, cancelMeetingController } from "../controllers/meeting.controller";

export const meetingRoutes = Router();

meetingRoutes.get(
  "/user/all",
  requireAuth,
  getUserMeetingsController
);

meetingRoutes.post("/public/create", createMeetBookingForGuestController);

meetingRoutes.put(
  "/cancel/:meetingId",
  requireAuth,
  cancelMeetingController
);

export default meetingRoutes;