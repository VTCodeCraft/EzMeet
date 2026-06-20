import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimezoneToAvailability1750079384623 implements MigrationInterface {
    name = 'AddTimezoneToAvailability1750079384623'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "availability" ADD "timezone" character varying NOT NULL DEFAULT 'UTC'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "availability" DROP COLUMN "timezone"`);
    }

}
