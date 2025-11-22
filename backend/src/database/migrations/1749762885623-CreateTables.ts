import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1749762885623 implements MigrationInterface {
    name = 'CreateTables1749762885623'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meetings" ALTER COLUMN "status" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meetings" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED'`);
    }
    

}
