import { modelos } from './modelos'

export interface PlanoSeed {
  criarGlobais: string[]
  criarAdmin: boolean
}

export const planejarSeed = (args: { globaisExistentes: string[]; adminExiste: boolean }): PlanoSeed => {
  const existentes = new Set(args.globaisExistentes)
  return {
    criarGlobais: modelos.map((m) => m.chave).filter((chave) => !existentes.has(chave)),
    criarAdmin: !args.adminExiste,
  }
}

// Valores de exemplo que aparecem na documentação: criariam um admin com senha pública e,
// no caso do e-mail, um endereço que não recebe a recuperação de senha. O seed nunca altera
// uma conta existente, então o erro seria permanente.
const senhasDeExemplo: Record<string, true> = { 'senha-longa-e-unica': true }
const dominiosDeExemplo: Record<string, true> = { 'exemplo.com': true, 'example.com': true }

export const lerCredenciaisAdmin = (env: Record<string, string | undefined>): { email: string; senha: string } => {
  const email = env.CMS_ADMIN_EMAIL
  const senha = env.CMS_ADMIN_PASSWORD
  if (!email) throw new Error('CMS_ADMIN_EMAIL é obrigatório para criar o primeiro administrador.')
  if (!senha) throw new Error('CMS_ADMIN_PASSWORD é obrigatório para criar o primeiro administrador.')
  if (dominiosDeExemplo[email.slice(email.lastIndexOf('@') + 1).toLowerCase()]) {
    throw new Error('CMS_ADMIN_EMAIL é um endereço de exemplo. Use o seu e-mail real: ele recebe a recuperação de senha.')
  }
  if (senhasDeExemplo[senha]) {
    throw new Error('CMS_ADMIN_PASSWORD é a senha de exemplo da documentação. Escolha uma senha própria, longa e única.')
  }
  return { email, senha }
}
