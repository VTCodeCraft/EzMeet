import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Event } from "./event.entity";
import { IntegrationAppTypeEnum } from "./integration.entity";

export enum MeetingStatus {
  SCHEDULED = "SCHEDULED",
  CANCELLED = "CANCELLED",
}

@Entity({ name: "meetings" })
export class Meeting {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.meetings)
  user: User;

@ManyToOne(() => Event, (event) => event.meetings, {
  onDelete: "CASCADE",
})
event: Event;

  @Column()
  guestName: string;

  @Column()
  guestEmail: string;

  @Column({ nullable: true })
  additionalInfo: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column()
  meetLink: string;

  @Column()
  calendarEventId: string;

  // FIXED: Use enum type to match database schema
  @Column({
    type: "enum",
    enum: IntegrationAppTypeEnum,
    // Optional: add default value if needed
    // default: IntegrationAppTypeEnum.GOOGLE
  })
  calendarAppType: IntegrationAppTypeEnum;

  @Column({
    type: "enum",
    enum: MeetingStatus,
    default: MeetingStatus.SCHEDULED,
  })
  status: MeetingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}