import { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { UnauthorizedException } from "../utils/app-error";
import { findOrCreateUserByClerkId } from "../services/auth.service";

/**
 * Replaces the old passport-jwt guard. Reads the Clerk auth state attached by
 * `clerkMiddleware()`, lazily syncs the local user row, and exposes its id on
 * `req.user` so existing controllers (`req.user?.id`) keep working unchanged.
 */
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      throw new UnauthorizedException("Unauthorized");
    }

    const user = await findOrCreateUserByClerkId(clerkId);
    req.user = { id: user.id };

    next();
  } catch (error) {
    next(error);
  }
};