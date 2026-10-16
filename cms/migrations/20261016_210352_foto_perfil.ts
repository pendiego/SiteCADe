import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "usuarios" ADD COLUMN "foto_id" integer;
  ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_foto_id_midia_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "usuarios_foto_idx" ON "usuarios" USING btree ("foto_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_foto_id_midia_id_fk";
  
  DROP INDEX "usuarios_foto_idx";
  ALTER TABLE "usuarios" DROP COLUMN "foto_id";`)
}
