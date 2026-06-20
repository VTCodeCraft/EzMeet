import { HTTPSTATUS } from "../config/http.config";
import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/AsyncHandler.middleware";
import { NotFoundException } from "../utils/app-error";
import { findByIDuserService } from "../services/user.service";

/**
 * Returns the local user backing the authenticated Clerk session. The user row
 * is guaranteed to exist by `requireAuth` (lazy find-or-create).
 */
export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id as string;

    const user = await findByIDuserService(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "User fetched successfully",
      user,
    });
  }
);