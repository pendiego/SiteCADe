import { postgresAdapter } from '@payloadcms/db-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { pt } from '@payloadcms/translations/languages/pt'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Midia } from './cms/collections/midia'
import { Usuarios } from './cms/collections/usuarios'
import { adaptadorEmail, validarConfiguracaoEmail } from './cms/email'
import { globais } from './cms/globals'

const producao = process.env.NODE_ENV === 'production'

if (!process.env.PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET é obrigatório. Defina-o no ambiente; não há valor padrão.')
}
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL é obrigatório (PostgreSQL). Não há banco alternativo.')
}
validarConfiguracaoEmail(process.env)

// Origem canônica: explícita via env e obrigatória em produção. No preview da Vercel o NODE_ENV
// também é `production`, mas o domínio canônico ainda não aponta para o preview: ali vale a
// VERCEL_URL (fornecida pela plataforma) e a env canônica é ignorada. Nunca deriva de conteúdo
// CMS nem de header da requisição.
const preview = process.env.VERCEL_ENV === 'preview'
const origemCanonica = preview ? undefined : process.env.PAYLOAD_PUBLIC_SERVER_URL
const hostVercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined
const origemDev = producao ? undefined : 'http://localhost:3000'

if (producao && !preview && !origemCanonica) {
  throw new Error('PAYLOAD_PUBLIC_SERVER_URL é obrigatório em produção.')
}

const serverURL = origemCanonica ?? hostVercel ?? origemDev
if (!serverURL) {
  throw new Error('Defina PAYLOAD_PUBLIC_SERVER_URL ou VERCEL_URL para determinar a origem do servidor.')
}

const origensConfiaveis = [origemCanonica, hostVercel, origemDev].filter(
  (origem): origem is string => origem !== undefined,
)

const tokenBlob = process.env.BLOB_READ_WRITE_TOKEN

export default buildConfig({
  serverURL,
  telemetry: false,
  secret: process.env.PAYLOAD_SECRET,
  cors: origensConfiaveis,
  csrf: origensConfiaveis,
  admin: {
    user: Usuarios.slug,
    avatar: { Component: '/cms/admin/Avatar#Avatar' },
    components: {
      beforeDashboard: ['/cms/admin/PainelInicio#PainelInicio'],
      graphics: { Logo: '/cms/admin/Marca#Logo', Icon: '/cms/admin/Marca#Icone' },
    },
    meta: {
      titleSuffix: ' · Painel CADe',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/assets/favicon.svg' }],
    },
  },
  i18n: {
    supportedLanguages: { pt },
    fallbackLanguage: 'pt',
  },
  routes: {
    api: '/api/cms',
    admin: '/admin',
  },
  graphQL: { disable: true },
  collections: [Midia, Usuarios],
  globals: globais,
  email: adaptadorEmail,
  sharp,
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
    migrationDir: 'cms/migrations',
    push: false,
  }),
  // Blob só com token explícito. Sem token em produção, upload falha em cms/collections/midia.ts.
  // Uploads passam sempre pelo servidor (validação e conversão para WebP); sem `clientUploads`.
  // `disablePayloadAccessControl` grava a URL direta do Blob: as imagens (já públicas) não passam
  // por uma função serverless a cada requisição e o remotePattern do next.config.ts é efetivamente usado.
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(tokenBlob),
      // Mantém o schema idêntico com e sem token (o plugin só cria o campo `prefix` quando ativo).
      alwaysInsertFields: true,
      collections: { midia: { disablePayloadAccessControl: true } },
      token: tokenBlob ?? '',
      access: 'public',
    }),
  ],
  typescript: { outputFile: 'payload-types.ts' },
})
