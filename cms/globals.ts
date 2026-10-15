import { revalidateTag } from 'next/cache'
import type { GlobalConfig } from 'payload'
import { acessoConteudoEscrita, acessoConteudoPublico } from './access'
import { modelos } from './modelos'

// Invalida o cache do conteúdo após cada escrita pela UI/REST.
// O seed passa context.importacaoInicial e pula a revalidação do Next (roda via CLI).
const invalidarConteudo = (context: Record<string, unknown>): void => {
  if (context.importacaoInicial === true) return
  revalidateTag('conteudo-cade', { expire: 0 })
}

export const globais: GlobalConfig[] = modelos.map((modelo) => ({
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
  fields: modelo.fields,
}))
