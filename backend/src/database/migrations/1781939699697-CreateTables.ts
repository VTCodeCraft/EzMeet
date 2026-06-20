import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1781939699697 implements MigrationInterface {
    name = 'CreateTables1781939699697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "password" TO "clerkId"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_b0e4d1eb939d0387788678c4f8e" UNIQUE ("clerkId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_b0e4d1eb939d0387788678c4f8e"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "clerkId" TO "password"`);
    }

}
