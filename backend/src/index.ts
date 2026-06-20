import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { config } from "./config/app.config";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middlewares";
import { asyncHandler } from "./middlewares/AsyncHandler.middleware";
import { BadRequestException } from "./utils/app-error";
import { initializeDatabase } from "./database/database";
import { auth } from "googleapis/build/src/apis/abusiveexperiencereport";
import authRoutes from "./routes/auth.route";
import eventRoutes from "./routes/event.route";
import availabilityRoutes from "./routes/availability.route"; 
import integrationRoutes from "./routes/integration.route";
import meetingRoutes from "./routes/meeting.route";


const app = express();

const BASE_PATH = config.BASE_PATH || "/api";

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: allow one or more comma-separated frontend origins (e.g.
// "http://localhost:5173,https://app.example.com"). Requests without an Origin
// header (curl, server-to-server, Google OAuth redirects) are allowed through.
const allowedOrigins = config.FRONTEND_ORIGIN.split(",")
         .map((origin) => origin.trim())
         .filter(Boolean);

app.use(
         cors({
                  origin: (origin, callback) => {
                           if (!origin || allowedOrigins.includes(origin)) {
                                    return callback(null, true);
                           }
                           return callback(new Error(`Not allowed by CORS: ${origin}`));
                  },
                  credentials: true,
                  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                  allowedHeaders: ["Content-Type", "Authorization"],
         })
);

// Attaches Clerk auth state to every request; `requireAuth` consumes it per-route.
app.use(clerkMiddleware());

// Base Route
app.get("/", asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
                  throw new BadRequestException("Throwing async error");
                  res.status(HTTPSTATUS.OK).json({
                           message: "Welcome to the API",
                  });
         })
);

app.use(`${BASE_PATH}/auth`,authRoutes);
app.use(`${BASE_PATH}/event`,eventRoutes);
app.use(`${BASE_PATH}/availability`,availabilityRoutes);
app.use(`${BASE_PATH}/integration`,integrationRoutes);
app.use(`${BASE_PATH}/meeting`, meetingRoutes);


// Error Handler Middleware (must be last)
app.use(errorHandler);

// Start Server
app.listen(config.PORT, async() => {
         await initializeDatabase();
         console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
});
