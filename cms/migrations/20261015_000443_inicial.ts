import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_usuarios_papel" AS ENUM('administrador', 'editor');
  CREATE TYPE "public"."enum_oportunidades_dados_itens_cor" AS ENUM('verde', 'amarelo', 'ciano');
  CREATE TYPE "public"."enum_inicio_hero_slides_acento" AS ENUM('navy', 'ciano', 'amarelo', 'verde');
  CREATE TYPE "public"."enum_inicio_guia_cards_tipo" AS ENUM('link', 'materiais');
  CREATE TYPE "public"."enum_pagina_sobre_secoes_estilo" AS ENUM('texto', 'canais');
  CREATE TYPE "public"."enum_pagina_contato_secoes_estilo" AS ENUM('texto', 'canais');
  CREATE TYPE "public"."enum_pagina_privacidade_secoes_estilo" AS ENUM('texto', 'canais');
  CREATE TABLE "usuarios_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "usuarios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"papel" "enum_usuarios_papel" DEFAULT 'editor' NOT NULL,
  	"ativo" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "midia" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"usuarios_id" integer,
  	"midia_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"usuarios_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "configuracao_site_nomes_alternativos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"valor" varchar NOT NULL
  );
  
  CREATE TABLE "configuracao_site" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"nome" varchar NOT NULL,
  	"nome_completo" varchar NOT NULL,
  	"descricao" varchar NOT NULL,
  	"descricao_organizacao" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"instagram_url" varchar NOT NULL,
  	"instagram_usuario" varchar NOT NULL,
  	"github_url" varchar NOT NULL,
  	"endereco_rua" varchar NOT NULL,
  	"endereco_cidade" varchar NOT NULL,
  	"endereco_uf" varchar NOT NULL,
  	"endereco_pais" varchar NOT NULL,
  	"endereco_regiao" varchar NOT NULL,
  	"endereco_texto" varchar NOT NULL,
  	"universidade_nome" varchar NOT NULL,
  	"universidade_sigla" varchar NOT NULL,
  	"universidade_url" varchar NOT NULL,
  	"og_imagem_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "configuracao_navegacao_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rotulo" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "configuracao_navegacao" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_rotulo" varchar NOT NULL,
  	"cta_href" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "configuracao_rodape_colunas_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rotulo" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "configuracao_rodape_colunas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL
  );
  
  CREATE TABLE "configuracao_rodape" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tagline" varchar NOT NULL,
  	"contato_titulo" varchar NOT NULL,
  	"copyright" varchar NOT NULL,
  	"nota_privacidade" varchar NOT NULL,
  	"github_rotulo" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "configuracao_integracoes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"google_calendar_id" varchar NOT NULL,
  	"calendario_assinar_url" varchar NOT NULL,
  	"drive_pasta_galeria" varchar NOT NULL,
  	"drive_pasta_materiais" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "configuracao_llms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "oportunidades_dados_itens" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"publicado" boolean DEFAULT true NOT NULL,
  	"titulo" varchar NOT NULL,
  	"tag" varchar NOT NULL,
  	"cor" "enum_oportunidades_dados_itens_cor" DEFAULT 'verde' NOT NULL,
  	"resumo" varchar,
  	"texto" varchar,
  	"cta" varchar,
  	"link" varchar,
  	"expira" timestamp(3) with time zone
  );
  
  CREATE TABLE "oportunidades_dados" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "inicio_seo" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_titulo" varchar NOT NULL,
  	"seo_titulo_social" varchar NOT NULL,
  	"seo_descricao" varchar NOT NULL,
  	"agentes_titulo" varchar NOT NULL,
  	"agentes_resumo" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "inicio_hero_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"od_id" varchar NOT NULL,
  	"acento" "enum_inicio_hero_slides_acento" NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"subtitulo" varchar NOT NULL,
  	"cta_rotulo" varchar NOT NULL,
  	"cta_href" varchar NOT NULL,
  	"mascote_id" integer NOT NULL,
  	"mascote_alt" varchar,
  	"mascote_largura" numeric NOT NULL,
  	"mascote_altura" numeric NOT NULL
  );
  
  CREATE TABLE "inicio_hero" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "inicio_agenda" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"cta_rotulo" varchar NOT NULL,
  	"rotulo_detalhe" varchar NOT NULL,
  	"carregando" varchar NOT NULL,
  	"noscript" varchar NOT NULL,
  	"mensagens_sem_titulo" varchar NOT NULL,
  	"mensagens_sem_descricao" varchar NOT NULL,
  	"mensagens_nenhum_futuro" varchar NOT NULL,
  	"mensagens_proximo_evento" varchar NOT NULL,
  	"mensagens_ultimo_evento" varchar NOT NULL,
  	"mensagens_sem_eventos_data" varchar NOT NULL,
  	"mensagens_sem_eventos_titulo" varchar NOT NULL,
  	"mensagens_sem_eventos_desc" varchar NOT NULL,
  	"mensagens_dia_sem_evento_titulo" varchar NOT NULL,
  	"mensagens_dia_sem_evento_desc" varchar NOT NULL,
  	"mensagens_indisponivel_titulo" varchar NOT NULL,
  	"mensagens_indisponivel_desc" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "inicio_quem_somos_membros" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"foto_id" integer NOT NULL,
  	"enquadramento" varchar NOT NULL
  );
  
  CREATE TABLE "inicio_quem_somos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"texto" varchar NOT NULL,
  	"gestao_titulo" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "inicio_historico" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"lead" varchar NOT NULL,
  	"nota" varchar NOT NULL,
  	"noscript" varchar NOT NULL,
  	"ver_tudo_rotulo" varchar NOT NULL,
  	"mensagens_carregando" varchar NOT NULL,
  	"mensagens_vazio" varchar NOT NULL,
  	"mensagens_erro" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "inicio_lojinha_produtos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"od_id" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"subtitulo" varchar NOT NULL,
  	"imagem_id" integer NOT NULL,
  	"alt" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "inicio_lojinha" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"lead" varchar NOT NULL,
  	"badge_rotulo" varchar NOT NULL,
  	"badge_href" varchar NOT NULL,
  	"hover_rotulo" varchar NOT NULL,
  	"cta_titulo" varchar NOT NULL,
  	"cta_subtitulo" varchar NOT NULL,
  	"cta_href" varchar NOT NULL,
  	"nota" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "inicio_guia_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"od_id" varchar NOT NULL,
  	"tipo" "enum_inicio_guia_cards_tipo" NOT NULL,
  	"titulo" varchar NOT NULL,
  	"texto" varchar NOT NULL,
  	"href" varchar
  );
  
  CREATE TABLE "inicio_guia" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"lead" varchar NOT NULL,
  	"foto_id" integer NOT NULL,
  	"foto_legenda" varchar NOT NULL,
  	"materiais_titulo" varchar NOT NULL,
  	"materiais_carregando" varchar NOT NULL,
  	"materiais_vazio" varchar NOT NULL,
  	"materiais_erro" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "inicio_oportunidades" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"lead" varchar NOT NULL,
  	"cta_rotulo" varchar NOT NULL,
  	"cta_href" varchar NOT NULL,
  	"vazio" varchar NOT NULL,
  	"ver_detalhes" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "inicio_faq_itens" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"od_id" varchar NOT NULL,
  	"pergunta" varchar NOT NULL,
  	"resposta" varchar NOT NULL,
  	"aberto" boolean DEFAULT false NOT NULL
  );
  
  CREATE TABLE "inicio_faq" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"texto" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "inicio_atalhos_itens" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"od_id" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"subtitulo" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"nova_aba" boolean DEFAULT false NOT NULL
  );
  
  CREATE TABLE "inicio_atalhos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "inicio_formularios_participar_semestres" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"valor" varchar NOT NULL
  );
  
  CREATE TABLE "inicio_formularios_participar_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"valor" varchar NOT NULL
  );
  
  CREATE TABLE "inicio_formularios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"participar_titulo" varchar NOT NULL,
  	"participar_texto" varchar NOT NULL,
  	"participar_nome_rotulo" varchar NOT NULL,
  	"participar_nome_placeholder" varchar NOT NULL,
  	"participar_email_rotulo" varchar NOT NULL,
  	"participar_email_placeholder" varchar NOT NULL,
  	"participar_semestre_rotulo" varchar NOT NULL,
  	"participar_area_rotulo" varchar NOT NULL,
  	"participar_selecione" varchar NOT NULL,
  	"participar_enviar_rotulo" varchar NOT NULL,
  	"participar_nota" varchar NOT NULL,
  	"falar_titulo" varchar NOT NULL,
  	"falar_tipo_rotulo" varchar NOT NULL,
  	"falar_tipos_reclamacao_rotulo" varchar NOT NULL,
  	"falar_tipos_reclamacao_nota" varchar NOT NULL,
  	"falar_tipos_sugestao_rotulo" varchar NOT NULL,
  	"falar_tipos_sugestao_nota" varchar NOT NULL,
  	"falar_tipos_elogio_rotulo" varchar NOT NULL,
  	"falar_tipos_elogio_nota" varchar NOT NULL,
  	"falar_tipos_oportunidade_rotulo" varchar NOT NULL,
  	"falar_tipos_oportunidade_nota" varchar NOT NULL,
  	"falar_assunto_rotulo" varchar NOT NULL,
  	"falar_assunto_placeholder" varchar NOT NULL,
  	"falar_mensagem_rotulo" varchar NOT NULL,
  	"falar_mensagem_placeholder" varchar NOT NULL,
  	"falar_anonimo_rotulo" varchar NOT NULL,
  	"falar_contato_rotulo" varchar NOT NULL,
  	"falar_contato_placeholder" varchar NOT NULL,
  	"falar_nota_anonimo" varchar NOT NULL,
  	"falar_enviar_rotulo" varchar NOT NULL,
  	"mensagens_enviando" varchar NOT NULL,
  	"mensagens_sucesso" varchar NOT NULL,
  	"mensagens_erro" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "pagina_sobre_secoes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"estilo" "enum_pagina_sobre_secoes_estilo" NOT NULL,
  	"corpo" varchar NOT NULL
  );
  
  CREATE TABLE "pagina_sobre" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_titulo" varchar NOT NULL,
  	"seo_titulo_social" varchar NOT NULL,
  	"seo_descricao" varchar NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"lead" varchar NOT NULL,
  	"nota" varchar,
  	"agentes_titulo" varchar NOT NULL,
  	"agentes_resumo" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "pagina_contato_secoes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"estilo" "enum_pagina_contato_secoes_estilo" NOT NULL,
  	"corpo" varchar NOT NULL
  );
  
  CREATE TABLE "pagina_contato" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_titulo" varchar NOT NULL,
  	"seo_titulo_social" varchar NOT NULL,
  	"seo_descricao" varchar NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"lead" varchar NOT NULL,
  	"nota" varchar,
  	"agentes_titulo" varchar NOT NULL,
  	"agentes_resumo" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "pagina_privacidade_secoes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"estilo" "enum_pagina_privacidade_secoes_estilo" NOT NULL,
  	"corpo" varchar NOT NULL
  );
  
  CREATE TABLE "pagina_privacidade" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_titulo" varchar NOT NULL,
  	"seo_titulo_social" varchar NOT NULL,
  	"seo_descricao" varchar NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"lead" varchar NOT NULL,
  	"nota" varchar,
  	"agentes_titulo" varchar NOT NULL,
  	"agentes_resumo" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "pagina_galeria" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_titulo" varchar NOT NULL,
  	"seo_titulo_social" varchar NOT NULL,
  	"seo_descricao" varchar NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"lead" varchar NOT NULL,
  	"nota" varchar NOT NULL,
  	"drive_rotulo" varchar NOT NULL,
  	"carregando" varchar NOT NULL,
  	"noscript" varchar NOT NULL,
  	"mensagens_vazio" varchar NOT NULL,
  	"mensagens_carregando_fotos" varchar NOT NULL,
  	"mensagens_em_breve" varchar NOT NULL,
  	"mensagens_ver_mais" varchar NOT NULL,
  	"mensagens_erro_categoria" varchar NOT NULL,
  	"mensagens_erro_geral" varchar NOT NULL,
  	"agentes_titulo" varchar NOT NULL,
  	"agentes_resumo" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "usuarios_sessions" ADD CONSTRAINT "usuarios_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_usuarios_fk" FOREIGN KEY ("usuarios_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_midia_fk" FOREIGN KEY ("midia_id") REFERENCES "public"."midia"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_usuarios_fk" FOREIGN KEY ("usuarios_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configuracao_site_nomes_alternativos" ADD CONSTRAINT "configuracao_site_nomes_alternativos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configuracao_site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configuracao_site" ADD CONSTRAINT "configuracao_site_og_imagem_id_midia_id_fk" FOREIGN KEY ("og_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "configuracao_navegacao_links" ADD CONSTRAINT "configuracao_navegacao_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configuracao_navegacao"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configuracao_rodape_colunas_links" ADD CONSTRAINT "configuracao_rodape_colunas_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configuracao_rodape_colunas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configuracao_rodape_colunas" ADD CONSTRAINT "configuracao_rodape_colunas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configuracao_rodape"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "oportunidades_dados_itens" ADD CONSTRAINT "oportunidades_dados_itens_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."oportunidades_dados"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_hero_slides" ADD CONSTRAINT "inicio_hero_slides_mascote_id_midia_id_fk" FOREIGN KEY ("mascote_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inicio_hero_slides" ADD CONSTRAINT "inicio_hero_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inicio_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_quem_somos_membros" ADD CONSTRAINT "inicio_quem_somos_membros_foto_id_midia_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inicio_quem_somos_membros" ADD CONSTRAINT "inicio_quem_somos_membros_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inicio_quem_somos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_lojinha_produtos" ADD CONSTRAINT "inicio_lojinha_produtos_imagem_id_midia_id_fk" FOREIGN KEY ("imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inicio_lojinha_produtos" ADD CONSTRAINT "inicio_lojinha_produtos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inicio_lojinha"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_guia_cards" ADD CONSTRAINT "inicio_guia_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inicio_guia"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_guia" ADD CONSTRAINT "inicio_guia_foto_id_midia_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inicio_faq_itens" ADD CONSTRAINT "inicio_faq_itens_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inicio_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_atalhos_itens" ADD CONSTRAINT "inicio_atalhos_itens_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inicio_atalhos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_formularios_participar_semestres" ADD CONSTRAINT "inicio_formularios_participar_semestres_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inicio_formularios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_formularios_participar_areas" ADD CONSTRAINT "inicio_formularios_participar_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inicio_formularios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pagina_sobre_secoes" ADD CONSTRAINT "pagina_sobre_secoes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pagina_sobre"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pagina_contato_secoes" ADD CONSTRAINT "pagina_contato_secoes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pagina_contato"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pagina_privacidade_secoes" ADD CONSTRAINT "pagina_privacidade_secoes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pagina_privacidade"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "usuarios_sessions_order_idx" ON "usuarios_sessions" USING btree ("_order");
  CREATE INDEX "usuarios_sessions_parent_id_idx" ON "usuarios_sessions" USING btree ("_parent_id");
  CREATE INDEX "usuarios_updated_at_idx" ON "usuarios" USING btree ("updated_at");
  CREATE INDEX "usuarios_created_at_idx" ON "usuarios" USING btree ("created_at");
  CREATE UNIQUE INDEX "usuarios_email_idx" ON "usuarios" USING btree ("email");
  CREATE INDEX "midia_updated_at_idx" ON "midia" USING btree ("updated_at");
  CREATE INDEX "midia_created_at_idx" ON "midia" USING btree ("created_at");
  CREATE UNIQUE INDEX "midia_filename_idx" ON "midia" USING btree ("filename");
  CREATE INDEX "midia_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "midia" USING btree ("sizes_thumbnail_filename");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_usuarios_id_idx" ON "payload_locked_documents_rels" USING btree ("usuarios_id");
  CREATE INDEX "payload_locked_documents_rels_midia_id_idx" ON "payload_locked_documents_rels" USING btree ("midia_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_usuarios_id_idx" ON "payload_preferences_rels" USING btree ("usuarios_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "configuracao_site_nomes_alternativos_order_idx" ON "configuracao_site_nomes_alternativos" USING btree ("_order");
  CREATE INDEX "configuracao_site_nomes_alternativos_parent_id_idx" ON "configuracao_site_nomes_alternativos" USING btree ("_parent_id");
  CREATE INDEX "configuracao_site_og_imagem_idx" ON "configuracao_site" USING btree ("og_imagem_id");
  CREATE INDEX "configuracao_navegacao_links_order_idx" ON "configuracao_navegacao_links" USING btree ("_order");
  CREATE INDEX "configuracao_navegacao_links_parent_id_idx" ON "configuracao_navegacao_links" USING btree ("_parent_id");
  CREATE INDEX "configuracao_rodape_colunas_links_order_idx" ON "configuracao_rodape_colunas_links" USING btree ("_order");
  CREATE INDEX "configuracao_rodape_colunas_links_parent_id_idx" ON "configuracao_rodape_colunas_links" USING btree ("_parent_id");
  CREATE INDEX "configuracao_rodape_colunas_order_idx" ON "configuracao_rodape_colunas" USING btree ("_order");
  CREATE INDEX "configuracao_rodape_colunas_parent_id_idx" ON "configuracao_rodape_colunas" USING btree ("_parent_id");
  CREATE INDEX "oportunidades_dados_itens_order_idx" ON "oportunidades_dados_itens" USING btree ("_order");
  CREATE INDEX "oportunidades_dados_itens_parent_id_idx" ON "oportunidades_dados_itens" USING btree ("_parent_id");
  CREATE INDEX "inicio_hero_slides_order_idx" ON "inicio_hero_slides" USING btree ("_order");
  CREATE INDEX "inicio_hero_slides_parent_id_idx" ON "inicio_hero_slides" USING btree ("_parent_id");
  CREATE INDEX "inicio_hero_slides_mascote_idx" ON "inicio_hero_slides" USING btree ("mascote_id");
  CREATE INDEX "inicio_quem_somos_membros_order_idx" ON "inicio_quem_somos_membros" USING btree ("_order");
  CREATE INDEX "inicio_quem_somos_membros_parent_id_idx" ON "inicio_quem_somos_membros" USING btree ("_parent_id");
  CREATE INDEX "inicio_quem_somos_membros_foto_idx" ON "inicio_quem_somos_membros" USING btree ("foto_id");
  CREATE INDEX "inicio_lojinha_produtos_order_idx" ON "inicio_lojinha_produtos" USING btree ("_order");
  CREATE INDEX "inicio_lojinha_produtos_parent_id_idx" ON "inicio_lojinha_produtos" USING btree ("_parent_id");
  CREATE INDEX "inicio_lojinha_produtos_imagem_idx" ON "inicio_lojinha_produtos" USING btree ("imagem_id");
  CREATE INDEX "inicio_guia_cards_order_idx" ON "inicio_guia_cards" USING btree ("_order");
  CREATE INDEX "inicio_guia_cards_parent_id_idx" ON "inicio_guia_cards" USING btree ("_parent_id");
  CREATE INDEX "inicio_guia_foto_idx" ON "inicio_guia" USING btree ("foto_id");
  CREATE INDEX "inicio_faq_itens_order_idx" ON "inicio_faq_itens" USING btree ("_order");
  CREATE INDEX "inicio_faq_itens_parent_id_idx" ON "inicio_faq_itens" USING btree ("_parent_id");
  CREATE INDEX "inicio_atalhos_itens_order_idx" ON "inicio_atalhos_itens" USING btree ("_order");
  CREATE INDEX "inicio_atalhos_itens_parent_id_idx" ON "inicio_atalhos_itens" USING btree ("_parent_id");
  CREATE INDEX "inicio_formularios_participar_semestres_order_idx" ON "inicio_formularios_participar_semestres" USING btree ("_order");
  CREATE INDEX "inicio_formularios_participar_semestres_parent_id_idx" ON "inicio_formularios_participar_semestres" USING btree ("_parent_id");
  CREATE INDEX "inicio_formularios_participar_areas_order_idx" ON "inicio_formularios_participar_areas" USING btree ("_order");
  CREATE INDEX "inicio_formularios_participar_areas_parent_id_idx" ON "inicio_formularios_participar_areas" USING btree ("_parent_id");
  CREATE INDEX "pagina_sobre_secoes_order_idx" ON "pagina_sobre_secoes" USING btree ("_order");
  CREATE INDEX "pagina_sobre_secoes_parent_id_idx" ON "pagina_sobre_secoes" USING btree ("_parent_id");
  CREATE INDEX "pagina_contato_secoes_order_idx" ON "pagina_contato_secoes" USING btree ("_order");
  CREATE INDEX "pagina_contato_secoes_parent_id_idx" ON "pagina_contato_secoes" USING btree ("_parent_id");
  CREATE INDEX "pagina_privacidade_secoes_order_idx" ON "pagina_privacidade_secoes" USING btree ("_order");
  CREATE INDEX "pagina_privacidade_secoes_parent_id_idx" ON "pagina_privacidade_secoes" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "usuarios_sessions" CASCADE;
  DROP TABLE "usuarios" CASCADE;
  DROP TABLE "midia" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "configuracao_site_nomes_alternativos" CASCADE;
  DROP TABLE "configuracao_site" CASCADE;
  DROP TABLE "configuracao_navegacao_links" CASCADE;
  DROP TABLE "configuracao_navegacao" CASCADE;
  DROP TABLE "configuracao_rodape_colunas_links" CASCADE;
  DROP TABLE "configuracao_rodape_colunas" CASCADE;
  DROP TABLE "configuracao_rodape" CASCADE;
  DROP TABLE "configuracao_integracoes" CASCADE;
  DROP TABLE "configuracao_llms" CASCADE;
  DROP TABLE "oportunidades_dados_itens" CASCADE;
  DROP TABLE "oportunidades_dados" CASCADE;
  DROP TABLE "inicio_seo" CASCADE;
  DROP TABLE "inicio_hero_slides" CASCADE;
  DROP TABLE "inicio_hero" CASCADE;
  DROP TABLE "inicio_agenda" CASCADE;
  DROP TABLE "inicio_quem_somos_membros" CASCADE;
  DROP TABLE "inicio_quem_somos" CASCADE;
  DROP TABLE "inicio_historico" CASCADE;
  DROP TABLE "inicio_lojinha_produtos" CASCADE;
  DROP TABLE "inicio_lojinha" CASCADE;
  DROP TABLE "inicio_guia_cards" CASCADE;
  DROP TABLE "inicio_guia" CASCADE;
  DROP TABLE "inicio_oportunidades" CASCADE;
  DROP TABLE "inicio_faq_itens" CASCADE;
  DROP TABLE "inicio_faq" CASCADE;
  DROP TABLE "inicio_atalhos_itens" CASCADE;
  DROP TABLE "inicio_atalhos" CASCADE;
  DROP TABLE "inicio_formularios_participar_semestres" CASCADE;
  DROP TABLE "inicio_formularios_participar_areas" CASCADE;
  DROP TABLE "inicio_formularios" CASCADE;
  DROP TABLE "pagina_sobre_secoes" CASCADE;
  DROP TABLE "pagina_sobre" CASCADE;
  DROP TABLE "pagina_contato_secoes" CASCADE;
  DROP TABLE "pagina_contato" CASCADE;
  DROP TABLE "pagina_privacidade_secoes" CASCADE;
  DROP TABLE "pagina_privacidade" CASCADE;
  DROP TABLE "pagina_galeria" CASCADE;
  DROP TYPE "public"."enum_usuarios_papel";
  DROP TYPE "public"."enum_oportunidades_dados_itens_cor";
  DROP TYPE "public"."enum_inicio_hero_slides_acento";
  DROP TYPE "public"."enum_inicio_guia_cards_tipo";
  DROP TYPE "public"."enum_pagina_sobre_secoes_estilo";
  DROP TYPE "public"."enum_pagina_contato_secoes_estilo";
  DROP TYPE "public"."enum_pagina_privacidade_secoes_estilo";`)
}
