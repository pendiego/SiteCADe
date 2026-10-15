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

export const lerCredenciaisAdmin = (env: Record<string, string | undefined>): { email: string; senha: string } => {
  const email = env.CMS_ADMIN_EMAIL
  const senha = env.CMS_ADMIN_PASSWORD
  if (!email) throw new Error('CMS_ADMIN_EMAIL é obrigatório para criar o primeiro administrador.')
  if (!senha) throw new Error('CMS_ADMIN_PASSWORD é obrigatório para criar o primeiro administrador.')
  return { email, senha }
}
