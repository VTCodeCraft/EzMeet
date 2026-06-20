import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.middleware";
import { checkIntegrationController, connectAppController, getUserIntegrationsController, googleOAuthCallbackController } from "../controllers/integration.controller";


const integrationRoutes = Router();

integrationRoutes.get(
  "/all",
  requireAuth,
  getUserIntegrationsController
);

integrationRoutes.get(
  "/check/:appType",
  requireAuth,
  checkIntegrationController
);

integrationRoutes.get(
  "/connect/:appType",
  requireAuth,
  connectAppController
);

integrationRoutes.get("/google/callback", googleOAuthCallbackController);



export default integrationRoutes;