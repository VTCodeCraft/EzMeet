import { v4 as uuidv4 } from "uuid";
import { clerkClient } from "@clerk/express";
import { AppDataSource } from "../config/database.config";
import { User } from "../database/entities/user.entity";
import { Availability } from "../database/entities/availability.entities";
import {
  DayAvailability,
  DayOfWeekEnum,
} from "../database/entities/day-availability";

/**
 * Look up the local user that backs a Clerk identity, creating it (and its
 * default availability) on first sight. This is the lazy-sync entrypoint used
 * by the auth middleware on every authenticated request.
 */
export const findOrCreateUserByClerkId = async (clerkId: string) => {
  const userRepository = AppDataSource.getRepository(User);

  const existingUser = await userRepository.findOne({ where: { clerkId } });
  if (existingUser) {
    return existingUser;
  }

  // First time we see this Clerk user: pull their profile and provision a local row.
  const clerkUser = await clerkClient.users.getUser(clerkId);

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ||
    clerkUser.emailAddresses[0]?.emailAddress ||
    `${clerkId}@no-email.local`;

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    email.split("@")[0];

  const username = await generateUsername(name);

  const user = userRepository.create({
    clerkId,
    name,
    email,
    username,
    imageUrl: clerkUser.imageUrl,
    isVerified: true,
  });
  await userRepository.save(user);

  await createDefaultAvailability(user);

  return user;
};

const createDefaultAvailability = async (user: User) => {
  const availabilityRepository = AppDataSource.getRepository(Availability);
  const dayAvailabilityRepository = AppDataSource.getRepository(DayAvailability);

  // Mon–Fri available 09:00–17:00, weekends off. Times are stored as "HH:mm"
  // (the format the booking + meeting services expect).
  const defaultAvailableDays = new Set<DayOfWeekEnum>([
    DayOfWeekEnum.MONDAY,
    DayOfWeekEnum.TUESDAY,
    DayOfWeekEnum.WEDNESDAY,
    DayOfWeekEnum.THURSDAY,
    DayOfWeekEnum.FRIDAY,
  ]);

  const days = Object.values(DayOfWeekEnum).map((dayName) => {
    const isAvailable = defaultAvailableDays.has(dayName);
    return dayAvailabilityRepository.create({
      day: dayName,
      timeSlots: isAvailable
        ? [{ startTime: "09:00", endTime: "17:00" }]
        : [],
      breaks: [],
      isAvailable,
    });
  });

  const availability = availabilityRepository.create({
    timeGap: 30,
    days,
    user,
  });

  await availabilityRepository.save(availability);
};

async function generateUsername(name: string): Promise<string> {
  const cleanName = name.replace(/\s+/g, "").toLowerCase();
  const baseUsername = cleanName || "user";
  const userRepository = AppDataSource.getRepository(User);

  let username = `${baseUsername}${uuidv4().slice(0, 4)}`;
  let existingUser = await userRepository.findOne({ where: { username } });

  while (existingUser) {
    username = `${baseUsername}${uuidv4().slice(0, 4)}`;
    existingUser = await userRepository.findOne({ where: { username } });
  }

  return username;
}
