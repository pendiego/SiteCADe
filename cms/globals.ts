import { revalidateTag } from 'next/cache'
import type { GlobalConfig } from 'payload'
import { acessoConteudoEscrita, acessoConteudoPublico } from './access'
import { gruposPainel, modelos } from './modelos'

// Invalida o cache do conteúdo após cada escrita pela UI/REST.
// O seed passa context.importacaoInicial e pula a revalidação do Next (roda via CLI).
const invalidarConteudo = (context: Record<string, unknown>): void => {
  if (context.importacaoInicial === true) return
  revalidateTag('conteudo-cade', { expire: 0 })
}

// O Payload ordena os grupos do menu pela primeira aparição: ordenar por grupo fixa a ordem do painel.
export const globais: GlobalConfig[] = [...modelos]
  .sort((a, b) => gruposPainel.indexOf(a.grupo) - gruposPainel.indexOf(b.grupo))
  .map((modelo) => ({
  slug: modelo.slug,
  label: modelo.rotulo,
  access: {
    read: acessoConteudoPublico,
    update: acessoConteudoEscrita,
  },
  hooks: {
    afterChange: [
      ({ context }) => {
        invalidarConteudo(context)
      },
    ],
  },
  admin: { group: modelo.grupo, description: modelo.descricao },
  fields: modelo.fields,
}))
