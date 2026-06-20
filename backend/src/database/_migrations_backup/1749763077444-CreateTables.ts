import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1749763077444 implements MigrationInterface {
    name = 'CreateTables1749763077444'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meetings" DROP COLUMN "calendarAppType"`);
        await queryRunner.query(`DROP TYPE "public"."meetings_calendarapptype_enum"`);
        await queryRunner.query(`ALTER TABLE "meetings" ADD "calendarAppType" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "meetings" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meetings" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "meetings" DROP COLUMN "calendarAppType"`);
        await queryRunner.query(`CREATE TYPE "public"."meetings_calendarapptype_enum" AS ENUM('GOOGLE_MEET_AND_CALENDAR', 'ZOOM_MEETING', 'OUTLOOK_CALENDAR')`);
        await queryRunner.query(`ALTER TABLE "meetings" ADD "calendarAppType" "public"."meetings_calendarapptype_enum" NOT NULL`);
    }

}
