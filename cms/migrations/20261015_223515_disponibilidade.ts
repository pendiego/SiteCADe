import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // A global já tem uma linha em produção: adiciona nulável, preenche com o texto padrão e só então
  // exige NOT NULL (em instalação nova a tabela está vazia e o UPDATE não altera nada).
  await db.execute(sql`
   ALTER TABLE "inicio_formularios" ADD COLUMN "participar_disponibilidade_rotulo" varchar;
  ALTER TABLE "inicio_formularios" ADD COLUMN "participar_disponibilidade_ajuda" varchar;
  ALTER TABLE "inicio_formularios" ADD COLUMN "participar_disponibilidade_erro" varchar;
  UPDATE "inicio_formularios" SET
    "participar_disponibilidade_rotulo" = 'Disponibilidade para reunião',
    "participar_disponibilidade_ajuda" = 'Marque os horários em que você pode, de segunda a sexta, das 09:00 às 17:30.',
    "participar_disponibilidade_erro" = 'Marque ao menos um horário de disponibilidade.';
  ALTER TABLE "inicio_formularios" ALTER COLUMN "participar_disponibilidade_rotulo" SET NOT NULL;
  ALTER TABLE "inicio_formularios" ALTER COLUMN "participar_disponibilidade_ajuda" SET NOT NULL;
  ALTER TABLE "inicio_formularios" ALTER COLUMN "participar_disponibilidade_erro" SET NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "inicio_formularios" DROP COLUMN "participar_disponibilidade_rotulo";
  ALTER TABLE "inicio_formularios" DROP COLUMN "participar_disponibilidade_ajuda";
  ALTER TABLE "inicio_formularios" DROP COLUMN "participar_disponibilidade_erro";`)
}
