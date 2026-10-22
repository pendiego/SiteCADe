import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "inicio_quem_somos" ADD COLUMN "contagem_rotulo" varchar;
  ALTER TABLE "inicio_quem_somos" ADD COLUMN "link_sobre_rotulo" varchar;
  ALTER TABLE "inicio_quem_somos" ADD COLUMN "equipe_coordenacao_titulo" varchar;
  ALTER TABLE "inicio_quem_somos" ADD COLUMN "equipe_membros_titulo" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "inicio_quem_somos" DROP COLUMN "contagem_rotulo";
  ALTER TABLE "inicio_quem_somos" DROP COLUMN "link_sobre_rotulo";
  ALTER TABLE "inicio_quem_somos" DROP COLUMN "equipe_coordenacao_titulo";
  ALTER TABLE "inicio_quem_somos" DROP COLUMN "equipe_membros_titulo";`)
}
