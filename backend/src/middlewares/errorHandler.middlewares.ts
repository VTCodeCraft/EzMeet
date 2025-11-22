import { ErrorRequestHandler } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { AppError } from "../utils/app-error";

export const errorHandler: ErrorRequestHandler = (error, req, res, next):any => {
  console.error(`Error occurred on Path: ${req.path}`, error);

  if (error instanceof SyntaxError) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: "Invalid JSON format",
    });
  }
  if (error instanceof AppError) {
    return res.status(error.statuscode).json({
      message: error.message,
      errorCode: error.errorCode,
    }); 
  }

  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    error: error?.message || "An unexpected error occurred",
  });
};
