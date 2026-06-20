import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.middleware";
import { createMeetBookingForGuestController, getUserMeetingsController, cancelMeetingController, cancelMeetingByGuestController } from "../controllers/meeting.controller";

export const meetingRoutes = Router();

meetingRoutes.get(
  "/user/all",
  requireAuth,
  getUserMeetingsController
);

meetingRoutes.post("/public/create", createMeetBookingForGuestController);

// Guest-initiated cancellation (public). Authorized by matching guestEmail in body.
meetingRoutes.put(
  "/public/cancel/:meetingId",
  cancelMeetingByGuestController
);

meetingRoutes.put(
  "/cancel/:meetingId",
  requireAuth,
  cancelMeetingController
);

export default meetingRoutes;