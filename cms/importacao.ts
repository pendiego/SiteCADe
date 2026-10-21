import type { Field } from 'payload'
import { camposDeDados } from './campos'

export type ResolverImagem = (caminho: string) => Promise<number | string>

const ehRegistro = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor)

// O Payload injeta um campo `id` em todo array ao sanitizar a configuração.
const ehListaDeValores = (campos: Field[]): boolean => {
  const proprios = camposDeDados(campos).filter((c) => !('name' in c) || c.name !== 'id')
  const [unico] = proprios
  return proprios.length === 1 && unico?.type === 'text' && unico.name === 'valor'
}

const temOdId = (campos: Field[]): boolean => camposDeDados(campos).some((c) => 'name' in c && c.name === 'odId')

const converterCampo = async (
  campo: Field,
  valor: unknown,
  resolverImagem: ResolverImagem,
): Promise<unknown> => {
  if (valor === undefined) return undefined

  if (campo.type === 'date') {
    return valor === '' ? null : valor
  }

  if (campo.type === 'upload') {
    return typeof valor === 'string' ? resolverImagem(valor) : valor
  }

  if (campo.type === 'group') {
    return ehRegistro(valor) ? converterDados(campo.fields, valor, resolverImagem) : valor
  }

  if (campo.type === 'array') {
    if (!Array.isArray(valor)) return valor
    if (ehListaDeValores(campo.fields)) return valor.map((item) => ({ valor: item }))
    const linhas: unknown[] = []
    for (const linha of valor) {
      if (!ehRegistro(linha)) {
        linhas.push(linha)
        continue
      }
      // Linhas com `id` do JSON viram `odId`; converterDados copia só campos declarados, descartando `id`.
      const base = temOdId(campo.fields) && 'id' in linha ? { ...linha, odId: linha.id } : linha
      linhas.push(await converterDados(campo.fields, base, resolverImagem))
    }
    return linhas
  }

  return valor
}

export const converterDados = async (
  campos: Field[],
  dados: Record<string, unknown>,
  resolverImagem: ResolverImagem,
): Promise<Record<string, unknown>> => {
  const saida: Record<string, unknown> = {}
  for (const campo of camposDeDados(campos)) {
    if (!('name' in campo)) continue
    const convertido = await converterCampo(campo, dados[campo.name], resolverImagem)
    if (convertido !== undefined) saida[campo.name] = convertido
  }
  return saida
}
