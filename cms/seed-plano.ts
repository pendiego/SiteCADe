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

// E-mail de exemplo criaria um admin que não recebe a recuperação de senha, e o seed nunca
// altera uma conta existente: o erro seria permanente.
const dominiosDeExemplo: Record<string, true> = { 'exemplo.com': true, 'example.com': true }

export const lerCredenciaisAdmin = (env: Record<string, string | undefined>): { email: string; senha: string } => {
  const email = env.CMS_ADMIN_EMAIL
  const senha = env.CMS_ADMIN_PASSWORD
  if (!email) throw new Error('CMS_ADMIN_EMAIL é obrigatório para criar o primeiro administrador.')
  if (!senha) throw new Error('CMS_ADMIN_PASSWORD é obrigatório para criar o primeiro administrador.')
  if (dominiosDeExemplo[email.slice(email.lastIndexOf('@') + 1).toLowerCase()]) {
    throw new Error('CMS_ADMIN_EMAIL é um endereço de exemplo. Use o seu e-mail real: ele recebe a recuperação de senha.')
  }
  return { email, senha }
}
