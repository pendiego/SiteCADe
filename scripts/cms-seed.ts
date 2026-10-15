import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import sharp from 'sharp'
import config from '../payload.config'
import { uploadLocalDev } from '../cms/collections/midia'
import { normalizarNomeArquivo, validarUpload, limiteDimensaoPx } from '../cms/midia-regras'
import { converterDados, type ResolverImagem } from '../cms/importacao'
import { modelos } from '../cms/modelos'
import { lerCredenciaisAdmin, planejarSeed } from '../cms/seed-plano'

const contexto = { importacaoInicial: true }

const ehRegistro = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor)

const lerJson = async (arquivo: string): Promise<Record<string, unknown>> => {
  const bruto: unknown = JSON.parse(await readFile(path.resolve(process.cwd(), arquivo), 'utf8'))
  if (!ehRegistro(bruto)) throw new Error(`Seed inválido: ${arquivo} precisa ser um objeto JSON.`)
  return bruto
}

const main = async (): Promise<void> => {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !uploadLocalDev) {
    throw new Error(
      'Defina BLOB_READ_WRITE_TOKEN (Blob de produção) ou CMS_UPLOAD_LOCAL=true (dev). Sem armazenamento o seed gravaria imagens sem arquivo.',
    )
  }
  const credenciais = lerCredenciaisAdmin(process.env)
  const payload = await getPayload({ config })

  const globaisExistentes: string[] = []
  for (const modelo of modelos) {
    const doc = await payload.findGlobal({ slug: modelo.slug, depth: 0, overrideAccess: true })
    if (doc.createdAt) globaisExistentes.push(modelo.chave)
  }
  const usuarios = await payload.count({ collection: 'usuarios', overrideAccess: true })
  const plano = planejarSeed({ globaisExistentes, adminExiste: usuarios.totalDocs > 0 })

  const midiaPorCaminho = new Map<string, number | string>()
  const resolverImagem: ResolverImagem = async (caminho) => {
    const emCache = midiaPorCaminho.get(caminho)
    if (emCache !== undefined) return emCache

    const bruto = await readFile(path.resolve(process.cwd(), 'public', caminho.replace(/^\//, '')))
    const nome = `${normalizarNomeArquivo(path.basename(caminho))}.webp`
    const convertido = await sharp(bruto, { density: 300 })
      .resize({ width: limiteDimensaoPx, height: limiteDimensaoPx, fit: 'inside', withoutEnlargement: true })
      .webp()
      .toBuffer()

    const erro = validarUpload({ nome, mimeType: 'image/webp', tamanho: convertido.byteLength })
    if (erro) throw new Error(`Imagem do seed inválida (${caminho}): ${erro}`)

    const existente = await payload.find({
      collection: 'midia',
      where: { filename: { equals: nome } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const [primeiro] = existente.docs
    const id = primeiro
      ? primeiro.id
      : (
          await payload.create({
            collection: 'midia',
            data: { alt: nome.replace(/\.webp$/, '').replace(/-/g, ' ') },
            file: { data: convertido, mimetype: 'image/webp', name: nome, size: convertido.byteLength },
            overrideAccess: true,
            context: contexto,
          })
        ).id
    midiaPorCaminho.set(caminho, id)
    return id
  }

  for (const modelo of modelos) {
    if (!plano.criarGlobais.includes(modelo.chave)) continue
    const dados = await lerJson(modelo.arquivo)
    const data = await converterDados(modelo.fields, dados, resolverImagem)
    await payload.updateGlobal({ slug: modelo.slug, data, overrideAccess: true, context: contexto })
    console.log(`Global criada: ${modelo.slug}`)
  }

  if (plano.criarAdmin) {
    await payload.create({
      collection: 'usuarios',
      data: { email: credenciais.email, password: credenciais.senha, papel: 'administrador', ativo: true },
      overrideAccess: true,
      context: contexto,
    })
    console.log('Administrador inicial criado.')
  } else {
    console.log('Usuário já existente; conta não alterada.')
  }

  await payload.destroy()
}

// `payload run` encerra o processo ao terminar o import: o seed precisa ser aguardado.
await main()
