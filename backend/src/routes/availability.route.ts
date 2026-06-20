import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.middleware";
import { getAvailabilityForPublicEventController, getUserAvailabilityController, updateAvailabilityController } from "../controllers/availability.controller";

const availabilityRoutes = Router();

availabilityRoutes.get(
  "/me",
  requireAuth,
  getUserAvailabilityController
);


availabilityRoutes.put(
  "/update",
  requireAuth,
  updateAvailabilityController
);

availabilityRoutes.get(
  "/public/:eventId",
  getAvailabilityForPublicEventController
);

export default availabilityRoutes;