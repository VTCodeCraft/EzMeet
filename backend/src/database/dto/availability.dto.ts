import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";
import { DayOfWeekEnum } from "../entities/day-availability";
import { Type } from "class-transformer";

export class DayAvailabilityDto {
  @IsEnum(DayOfWeekEnum)
  @IsNotEmpty()
  day: DayOfWeekEnum;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsBoolean()
  @IsNotEmpty()
  isAvailable: boolean;
}
export class UpdateAvailabilityDto {
  timeGap: number;
  days: {
    day: string;
    isAvailable: boolean;
    timeSlots: { startTime: string; endTime: string }[];
    breaks: { start: string; end: string }[];
  }[];
  timezone: any;
}