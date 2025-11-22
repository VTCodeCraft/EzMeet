import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { EventLocationEnumType } from "../entities/event.entity";


export class CreateEventDto {
         @IsString()
         @IsNotEmpty()
         title: string;

         @IsString()
         @IsOptional()
         description: string;

         @IsNumber()
         @IsNotEmpty()
         duration: number;

         @IsNotEmpty()
         @IsEnum(EventLocationEnumType)
         locationType: EventLocationEnumType;

}

export class EventIdDto{
         @IsUUID(4,{message : "Invalid uuid"})
         @IsNotEmpty()
         eventId:string;
}

export class UserNameDTO {
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class UserNameAndSlugDTO {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  slug: string;
}