import { resendAdapter } from '@payloadcms/email-resend'
import type { EmailAdapter } from 'payload'

const verdadeiro = (valor: string | undefined): boolean => valor === 'true' || valor === '1'

export const emailHabilitado = {
  recuperacaoSenha: verdadeiro(process.env.CMS_RECUPERACAO_SENHA),
  verificacaoEmail: verdadeiro(process.env.CMS_VERIFICACAO_EMAIL),
}

export const validarConfiguracaoEmail = (): void => {
  const precisaEmail = emailHabilitado.recuperacaoSenha || emailHabilitado.verificacaoEmail
  if (!precisaEmail) return
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY é obrigatório quando CMS_RECUPERACAO_SENHA ou CMS_VERIFICACAO_EMAIL está ativo.')
  }
  if (!process.env.CMS_EMAIL_REMETENTE) {
    throw new Error('CMS_EMAIL_REMETENTE é obrigatório quando o envio de e-mail do CMS está ativo.')
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
