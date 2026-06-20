import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1749915333213 implements MigrationInterface {
    name = 'CreateTables1749915333213'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "day_availability" DROP COLUMN "startTime"`);
        await queryRunner.query(`ALTER TABLE "day_availability" DROP COLUMN "endTime"`);
        await queryRunner.query(`ALTER TABLE "day_availability" ADD "timeSlots" jsonb NOT NULL DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "day_availability" ADD "breaks" jsonb NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "day_availability" DROP COLUMN "breaks"`);
        await queryRunner.query(`ALTER TABLE "day_availability" DROP COLUMN "timeSlots"`);
        await queryRunner.query(`ALTER TABLE "day_availability" ADD "endTime" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "day_availability" ADD "startTime" TIMESTAMP NOT NULL`);
    }

}
