import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.middleware";
import { getCurrentUserController } from "../controllers/auth.controller";

const authRoutes = Router();

// Returns (and lazily provisions) the local user for the current Clerk session.
authRoutes.get("/me", requireAuth, getCurrentUserController);

export default authRoutes;