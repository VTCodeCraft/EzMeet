import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import { getAvailabilityForPublicEventController, getUserAvailabilityController, updateAvailabilityController } from "../controllers/availability.controller";

const availabilityRoutes = Router();

availabilityRoutes.get(
  "/me",
  passportAuthenticateJwt,
  getUserAvailabilityController
);


availabilityRoutes.put(
  "/update",
  passportAuthenticateJwt,
  updateAvailabilityController
);

availabilityRoutes.get(
  "/public/:eventId",
  getAvailabilityForPublicEventController
);

export default availabilityRoutes;