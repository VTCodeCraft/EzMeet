import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.middleware";
import { createEventController, deleteEventController, getPublicEventByUsernameAndSlugController, getPublicEventsByUsernameController, getUserEventsController, toggleEventPrivacyController } from "../controllers/event.controller";


const eventRoutes = Router();

eventRoutes.post("/create",requireAuth, createEventController);
eventRoutes.get("/all",requireAuth, getUserEventsController);

eventRoutes.put("/toggle-privacy",requireAuth,toggleEventPrivacyController)

// for public without token
eventRoutes.get("/public/:username", getPublicEventsByUsernameController);

eventRoutes.get(
  "/public/:username/:slug",
  getPublicEventByUsernameAndSlugController
);

eventRoutes.delete("/:eventId", requireAuth, deleteEventController);

export default eventRoutes;