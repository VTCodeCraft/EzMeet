import "dotenv/config";
import path from "path";
import { DataSource } from "typeorm";

import { User } from "../database/entities/user.entity";
import { Integration } from "../database/entities/integration.entity";
import { Event } from "../database/entities/event.entity";
import { Availability } from "../database/entities/availability.entities";
import { Meeting } from "../database/entities/meeting.entity";
import { DayAvailability } from "../database/entities/day-availability";

export const getdatabaseConfig = () => {
         const isProduction = process.env.NODE_ENV === "production";
         const databseUrl = process.env.DATABASE_URL;

         return new DataSource({
                  type: "postgres",
                  url: databseUrl,
                  
                  // Explicit entity array (most reliable)
                  entities: [User, Integration, Event, Availability, Meeting, DayAvailability],
                  
                  migrations: [path.join(__dirname, "../database/migrations/**/*.{ts,js}")],
                  synchronize: false,
                  logging: !isProduction ? ["query", "error", "schema"] : ["error"],
                  // Hosted Postgres providers (Render/Neon/etc.) use certs Node's CA
                  // store doesn't trust; keep TLS on but skip chain verification.
                  ssl: {
                           rejectUnauthorized: false,
                  }
         });
};

export const AppDataSource = getdatabaseConfig();