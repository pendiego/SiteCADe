import type { Access, FieldAccess } from 'payload'

export type Papel = 'administrador' | 'editor'

export type UsuarioSessao =
  | { id: number | string; papel?: unknown; ativo?: unknown }
  | null
  | undefined

const ehAtivo = (u: UsuarioSessao): boolean => !!u && u.ativo === true

const ehAdministradorAtivo = (u: UsuarioSessao): boolean =>
  ehAtivo(u) && u?.papel === 'administrador'

const ehEditorAtivo = (u: UsuarioSessao): boolean => ehAtivo(u) && u?.papel === 'editor'

export const podeAutenticar = (u: UsuarioSessao): boolean => ehAtivo(u)

export const podeGerenciarUsuarios = (u: UsuarioSessao): boolean => ehAdministradorAtivo(u)

export const podeAlterarPapel = (u: UsuarioSessao): boolean => ehAdministradorAtivo(u)

export const podeAlterarAtividade = (u: UsuarioSessao): boolean => ehAdministradorAtivo(u)

export const podeLerProprioPerfil = (u: UsuarioSessao, id: number | string): boolean =>
  ehAdministradorAtivo(u) || (ehEditorAtivo(u) && u?.id === id)

export const podeAtualizarProprioPerfil = (u: UsuarioSessao, id: number | string): boolean =>
  ehAdministradorAtivo(u) || (ehEditorAtivo(u) && u?.id === id)

export const podeGerenciarConteudo = (u: UsuarioSessao): boolean =>
  ehAdministradorAtivo(u) || ehEditorAtivo(u)

export const acessoUsuarios = {
  admin: (({ req }) => podeGerenciarConteudo(req.user)) satisfies Access,
  create: (({ req }) => podeGerenciarUsuarios(req.user)) satisfies Access,
  read: (({ req }) => {
    const u = req.user
    if (podeGerenciarUsuarios(u)) return true
    if (ehEditorAtivo(u) && u) return { id: { equals: u.id } }
    return false
  }) satisfies Access,
  update: (({ req }) => {
    const u = req.user
    if (podeGerenciarUsuarios(u)) return true
    if (ehEditorAtivo(u) && u) return { id: { equals: u.id } }
    return false
  }) satisfies Access,
  delete: (({ req }) => podeGerenciarUsuarios(req.user)) satisfies Access,
}

export const campoPapelEditavel: FieldAccess = ({ req }) => podeAlterarPapel(req.user)

export const campoAtivoEditavel: FieldAccess = ({ req }) => podeAlterarAtividade(req.user)

export const acessoConteudoPublico: Access = () => true

export const acessoConteudoEscrita: Access = ({ req }) => podeGerenciarConteudo(req.user)
