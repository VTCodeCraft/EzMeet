import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMeetingEventRelation1749908940847 implements MigrationInterface {
    name = 'UpdateMeetingEventRelation1749908940847'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meetings" DROP CONSTRAINT "FK_2e6f88379a7a198af6c0ba2ca02"`);
        await queryRunner.query(`ALTER TABLE "meetings" ADD CONSTRAINT "FK_2e6f88379a7a198af6c0ba2ca02" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meetings" DROP CONSTRAINT "FK_2e6f88379a7a198af6c0ba2ca02"`);
        await queryRunner.query(`ALTER TABLE "meetings" ADD CONSTRAINT "FK_2e6f88379a7a198af6c0ba2ca02" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
