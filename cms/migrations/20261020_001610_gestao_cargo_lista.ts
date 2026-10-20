import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pagina_sobre_secoes_estilo" ADD VALUE 'gestao';
  ALTER TYPE "public"."enum_pagina_sobre_secoes_estilo" ADD VALUE 'lista';
  ALTER TYPE "public"."enum_pagina_contato_secoes_estilo" ADD VALUE 'gestao';
  ALTER TYPE "public"."enum_pagina_contato_secoes_estilo" ADD VALUE 'lista';
  ALTER TYPE "public"."enum_pagina_privacidade_secoes_estilo" ADD VALUE 'gestao';
  ALTER TYPE "public"."enum_pagina_privacidade_secoes_estilo" ADD VALUE 'lista';
  ALTER TABLE "inicio_quem_somos_membros" ADD COLUMN "cargo" varchar;
  ALTER TABLE "inicio_quem_somos_membros" ADD COLUMN "coordenacao" boolean DEFAULT false NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pagina_sobre_secoes" ALTER COLUMN "estilo" SET DATA TYPE text;
  UPDATE "pagina_sobre_secoes" SET "estilo" = 'texto' WHERE "estilo" IN ('gestao', 'lista');
  DROP TYPE "public"."enum_pagina_sobre_secoes_estilo";
  CREATE TYPE "public"."enum_pagina_sobre_secoes_estilo" AS ENUM('texto', 'canais');
  ALTER TABLE "pagina_sobre_secoes" ALTER COLUMN "estilo" SET DATA TYPE "public"."enum_pagina_sobre_secoes_estilo" USING "estilo"::"public"."enum_pagina_sobre_secoes_estilo";
  ALTER TABLE "pagina_contato_secoes" ALTER COLUMN "estilo" SET DATA TYPE text;
  UPDATE "pagina_contato_secoes" SET "estilo" = 'texto' WHERE "estilo" IN ('gestao', 'lista');
  DROP TYPE "public"."enum_pagina_contato_secoes_estilo";
  CREATE TYPE "public"."enum_pagina_contato_secoes_estilo" AS ENUM('texto', 'canais');
  ALTER TABLE "pagina_contato_secoes" ALTER COLUMN "estilo" SET DATA TYPE "public"."enum_pagina_contato_secoes_estilo" USING "estilo"::"public"."enum_pagina_contato_secoes_estilo";
  ALTER TABLE "pagina_privacidade_secoes" ALTER COLUMN "estilo" SET DATA TYPE text;
  UPDATE "pagina_privacidade_secoes" SET "estilo" = 'texto' WHERE "estilo" IN ('gestao', 'lista');
  DROP TYPE "public"."enum_pagina_privacidade_secoes_estilo";
  CREATE TYPE "public"."enum_pagina_privacidade_secoes_estilo" AS ENUM('texto', 'canais');
  ALTER TABLE "pagina_privacidade_secoes" ALTER COLUMN "estilo" SET DATA TYPE "public"."enum_pagina_privacidade_secoes_estilo" USING "estilo"::"public"."enum_pagina_privacidade_secoes_estilo";
  ALTER TABLE "inicio_quem_somos_membros" DROP COLUMN "cargo";
  ALTER TABLE "inicio_quem_somos_membros" DROP COLUMN "coordenacao";`)
}
