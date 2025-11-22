import {
         BeforeInsert,
         BeforeUpdate,
         Column,
         CreateDateColumn,
         Entity,
         JoinColumn,
         OneToMany,
         OneToOne,
         PrimaryGeneratedColumn,
         UpdateDateColumn,
} from "typeorm";
import * as bcrypt from "bcrypt";
import { Integration } from "./integration.entity";
import { Event } from "./event.entity";
import { Availability } from "./availability.entities";
import { Meeting } from "./meeting.entity";

@Entity({ name: "users" })
export class User {
         @PrimaryGeneratedColumn("uuid")
         id: string;

         @Column({ nullable: false })
         name: string;

         @Column({ nullable: false, unique: true })
         username: string;

         @Column({ unique: true, nullable: false })
         email: string;

         @Column({ nullable: false })
         password: string;

         @Column({ nullable: true })
         imageUrl: string;

         @OneToMany(() => Event, (event) => event.user, {
                  cascade: true,
         })
         events: Event[];

         @OneToMany(() => Integration, (integration) => integration.user, {
                  cascade: true,
         })
         integrations: Integration[];

         @OneToOne(() => Availability, (availability: Availability) => availability.user, {
                  cascade: true,
         })
         @JoinColumn()
         availability: Availability;

         @OneToMany(() => Meeting, (meeting) => meeting.user, {
                  cascade: true,
         })
         meetings: Meeting[];

         @CreateDateColumn()
         createdAt: Date;

         @UpdateDateColumn()
         updatedAt: Date;

         @Column({ default: false })
         isVerified: boolean;


         @BeforeInsert()
         @BeforeUpdate()
         async hashPassword() {
                  if (this.password) {
                           this.password = await bcrypt.hash(this.password, 10);
                  }
         }

         async comparePassword(candidatePassword: string): Promise<boolean> {
                  return bcrypt.compare(candidatePassword, this.password);
         }

         omitPassword(): Omit<User, "password"> {
                  const { password, ...userWithoutPassword } = this;
                  return userWithoutPassword as Omit<User, "password">;
         }
}