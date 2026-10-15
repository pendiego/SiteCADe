import { resendAdapter } from '@payloadcms/email-resend'
import type { EmailAdapter } from 'payload'

const verdadeiro = (valor: string | undefined): boolean => valor === 'true' || valor === '1'

// Verificação de e-mail no cadastro é opcional (as contas são criadas por um administrador).
export const verificacaoEmail = verdadeiro(process.env.CMS_VERIFICACAO_EMAIL)

// A recuperação de senha é sempre exposta pelo Payload ("Esqueceu a senha?"), então em produção o envio
// precisa funcionar: sem chave e remetente o link quebraria para os editores.
export const validarConfiguracaoEmail = (env: Record<string, string | undefined>): void => {
  const precisaEmail = env.NODE_ENV === 'production' || verdadeiro(env.CMS_VERIFICACAO_EMAIL)
  if (!precisaEmail) return
  if (!env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY é obrigatório em produção: a recuperação de senha do CMS depende do envio de e-mail.')
  }
  if (!env.CMS_EMAIL_REMETENTE) {
    throw new Error('CMS_EMAIL_REMETENTE é obrigatório em produção (remetente verificado no Resend).')
  }
}

// Sem RESEND_API_KEY o envio falha explicitamente: nenhum fluxo pode reportar e-mail enviado.
const adaptadorIndisponivel: EmailAdapter = () => ({
  defaultFromAddress: 'indisponivel@invalid',
  defaultFromName: 'CMS',
  name: 'indisponivel',
  sendEmail: async () => {
    throw new Error('Envio de e-mail não configurado (RESEND_API_KEY ausente).')
  },
})

export const adaptadorEmail: EmailAdapter = process.env.RESEND_API_KEY
  ? resendAdapter({
      apiKey: process.env.RESEND_API_KEY,
      defaultFromAddress: process.env.CMS_EMAIL_REMETENTE ?? '',
      defaultFromName: 'SiteCADe',
    })
  : adaptadorIndisponivel
