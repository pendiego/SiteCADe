import { Forbidden, type CollectionConfig } from 'payload'
import {
  acessoUsuarios,
  campoAtivoEditavel,
  campoPapelEditavel,
  podeAutenticar,
  podeGerenciarUsuarios,
} from '../access'
import { verificacaoEmail } from '../email'

const producao = process.env.NODE_ENV === 'production'
const tempoBloqueio = 15 * 60 * 1000

export const Usuarios: CollectionConfig = {
  slug: 'usuarios',
  labels: { singular: 'Usuário', plural: 'Usuários' },
  admin: { useAsTitle: 'email', group: 'Acesso' },
  access: acessoUsuarios,
  auth: {
    maxLoginAttempts: 5,
    lockTime: tempoBloqueio,
    tokenExpiration: 8 * 60 * 60,
    useSessions: true,
    removeTokenFromResponses: true,
    verify: verificacaoEmail,
    forgotPassword: { expiration: 60 * 60 * 1000, minRequestInterval: 60 * 1000 },
    cookies: {
      secure: producao,
      sameSite: 'Lax',
    },
  },
  hooks: {
    beforeOperation: [
      ({ operation, req }) => {
        // Criação só por administrador ativo ou pelo seed (contexto somente-servidor).
        // Bloqueia também o endpoint /first-register, que ignora access.create.
        if (operation !== 'create') return
        if (podeGerenciarUsuarios(req.user)) return
        if (req.context.importacaoInicial === true) return
        throw new Forbidden(req.t)
      },
    ],
    beforeLogin: [
      ({ user }) => {
        if (!podeAutenticar(user)) throw new Forbidden()
        return user
      },
    ],
    afterChange: [
      async ({ doc, req, collection, context }) => {
        if (doc.ativo === true || context.revogandoSessao === true) return doc
        await req.payload.update({
          collection: collection.slug,
          id: doc.id,
          data: { sessions: [] },
          overrideAccess: true,
          context: { revogandoSessao: true },
          req,
        })
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'nome',
      type: 'text',
      label: 'Nome',
      required: false,
    },
    {
      name: 'foto',
      type: 'upload',
      relationTo: 'midia',
      label: 'Foto de perfil',
      required: false,
      admin: { description: 'Aparece no canto do painel. Envie uma imagem quadrada, de preferência.' },
    },
    {
      name: 'papel',
      type: 'select',
      label: 'Papel',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Administrador', value: 'administrador' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        read: ({ req }) => podeGerenciarUsuarios(req.user),
        create: campoPapelEditavel,
        update: campoPapelEditavel,
      },
    },
    {
      name: 'ativo',
      type: 'checkbox',
      label: 'Ativo',
      defaultValue: true,
      access: {
        read: ({ req }) => podeGerenciarUsuarios(req.user),
        create: campoAtivoEditavel,
        update: campoAtivoEditavel,
      },
    },
  ],
}
