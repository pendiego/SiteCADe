import { postgresAdapter } from '@payloadcms/db-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { pt } from '@payloadcms/translations/languages/pt'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Midia } from './cms/collections/midia'
import { podeGerenciarConteudo } from './cms/access'
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
validarConfiguracaoEmail()

// Origem canônica: explícita via env. Preview usa VERCEL_URL (fornecido pela plataforma).
// Nunca deriva de conteúdo CMS nem de header da requisição.
const origemCanonica = process.env.PAYLOAD_PUBLIC_SERVER_URL
const hostVercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined
const origemDev = producao ? undefined : 'http://localhost:3000'

if (producao && !origemCanonica) {
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
  collections: [Usuarios, Midia],
  globals: globais,
  email: adaptadorEmail,
  sharp,
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
    migrationDir: 'cms/migrations',
    push: false,
  }),
  // Blob só com token explícito. Sem token em produção, upload falha em cms/collections/midia.ts.
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(tokenBlob),
      collections: { midia: true },
      token: tokenBlob ?? '',
      access: 'public',
      clientUploads: {
        access: ({ req }) => podeGerenciarConteudo(req.user),
      },
    }),
  ],
  typescript: { outputFile: 'payload-types.ts' },
})
