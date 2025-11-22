import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../config/database.config";
import { LoginDto, RegisterDto } from "../database/dto/auth.dto";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/app-error";
import { User } from "../database/entities/user.entity";
import { Availability } from "../database/entities/availability.entities";
import {
  DayAvailability,
  DayOfWeekEnum,
} from "../database/entities/day-availability";
import { signJwtToken } from "../utils/jwt";

export const registerService = async (registerDto: RegisterDto) => {
  const userRepository = AppDataSource.getRepository(User);
  const availabilityRepository = AppDataSource.getRepository(Availability);
  const dayAvailabilityRepository = AppDataSource.getRepository(DayAvailability);

  const existingUser = await userRepository.findOne({
    where: { email: registerDto.email },
  });

  if (existingUser) {
    throw new BadRequestException("User already exists");
  }

  const username = await generateUsername(registerDto.name);

  const user = userRepository.create({
    ...registerDto,
    username,
  });

  const day = dayAvailabilityRepository.create({
  day: DayOfWeekEnum.MONDAY,
  timeSlots: [
    { startTime: "2025-06-01T09:00:00Z", endTime: "2025-06-01T17:00:00Z" }
  ],
  breaks: [
    { start: "2025-06-01T13:00:00Z", end: "2025-06-01T14:00:00Z" }
  ],
  isAvailable: true
});

const availability = availabilityRepository.create({
  timeGap: 30,
  days: [day]
});

await availabilityRepository.save(availability);

  return { user: user.omitPassword() };
};

export const loginService = async (loginDto: LoginDto) => {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: { email: loginDto.email },
  });

  if (!user) {
    throw new NotFoundException("User not found");
  }

  const isPasswordValid = await user.comparePassword(loginDto.password);
  if (!isPasswordValid) {
    throw new UnauthorizedException("Invalid email or password");
  }

  const { token, expiresAt } = signJwtToken({ userID: user.id });

  return {
    user: user.omitPassword(),
    accessToken: token,
    expiresAt,
  };
};

async function generateUsername(name: string): Promise<string> {
  const cleanName = name.replace(/\s+/g, "").toLowerCase();
  const baseUsername = cleanName;
  const uuidSuffix = uuidv4().slice(0, 4);
  const userRepository = AppDataSource.getRepository(User);

  let username = `${baseUsername}${uuidSuffix}`;
  let existingUser = await userRepository.findOne({ where: { username } });

  while (existingUser) {
    username = `${baseUsername}${uuidv4().slice(0, 4)}`;
    existingUser = await userRepository.findOne({ where: { username } });
  }

  return username;
}
