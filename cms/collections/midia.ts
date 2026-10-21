import { APIError, type CollectionConfig } from 'payload'
import { limiteDimensaoPx, validarUpload } from '../midia-regras'
import { podeGerenciarConteudo } from '../access'

const producao = process.env.NODE_ENV === 'production'
const temBlob = !!process.env.BLOB_READ_WRITE_TOKEN
// Disco local só como opção explícita de desenvolvimento, nunca em produção nem com Blob ativo.
export const uploadLocalDev = !producao && !temBlob && process.env.CMS_UPLOAD_LOCAL === 'true'

export const Midia: CollectionConfig = {
  slug: 'midia',
  labels: { singular: 'Imagem', plural: 'Imagens' },
  admin: {
    useAsTitle: 'filename',
    group: 'Atualize sempre',
    description:
      'Fotos usadas no site. PNG, JPEG ou WebP até 4 MiB, nome em minúsculas com hífen (ex.: foto-gestao-2026.png). Viram WebP sozinhas.',
  },
  access: {
    read: () => true,
    create: ({ req }) => podeGerenciarConteudo(req.user),
    update: ({ req }) => podeGerenciarConteudo(req.user),
    delete: ({ req }) => podeGerenciarConteudo(req.user),
  },
  hooks: {
    beforeOperation: [
      ({ operation, req }) => {
        if (operation !== 'create' && operation !== 'update') return
        if (producao && !temBlob) {
          throw new APIError(
            'BLOB_READ_WRITE_TOKEN ausente em produção: upload indisponível.',
            500,
            undefined,
            true,
          )
        }
        if (req.file) {
          const erro = validarUpload({
            nome: req.file.name,
            mimeType: req.file.mimetype,
            tamanho: req.file.size,
          })
          if (erro) throw new APIError(erro, 400)
        }
      },
    ],
  },
  upload: {
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    filesRequiredOnCreate: true,
    disableLocalStorage: !uploadLocalDev,
    staticDir: 'cms/media-local',
    formatOptions: { format: 'webp' },
    resizeOptions: {
      width: limiteDimensaoPx,
      height: limiteDimensaoPx,
      fit: 'inside',
      withoutEnlargement: true,
    },
    adminThumbnail: 'thumbnail',
    imageSizes: [{ name: 'thumbnail', width: 320, height: 320, fit: 'inside' }],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto alternativo',
      required: true,
    },
  ],
}
