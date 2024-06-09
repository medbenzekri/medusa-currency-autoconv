import { MigrationInterface, QueryRunner } from "typeorm";

export class ManualCurrency1715594625422 implements MigrationInterface {
    name = 'ManualCurrency1715594625422'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "manual_rate" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "code" character varying NOT NULL, "rate" double precision NOT NULL, "expires_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_530a761c945bd034c3721aca02" UNIQUE ("code"), CONSTRAINT "PK_efbb844fc086e3ae3f917de7197" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "manual_rate" ADD CONSTRAINT "FK_530a761c945bd034c3721aca02b" FOREIGN KEY ("code") REFERENCES "currency"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "manual_rate" DROP CONSTRAINT "FK_530a761c945bd034c3721aca02b"`);
        await queryRunner.query(`DROP TABLE "manual_rate"`);
    }

}
