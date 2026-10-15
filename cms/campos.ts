import type {
  ArrayField,
  CheckboxField,
  DateField,
  Field,
  GroupField,
  NumberField,
  SelectField,
  TextareaField,
  TextField,
  UploadField,
  Validate,
} from 'payload'

export const padraoIdentificador = /^[a-z0-9-]+$/
export const mensagemIdentificador = 'Use só minúsculas, números e hífen'
export const dicaIdentificador =
  'Identificador técnico único (data-od-id). Não altere em itens existentes.'

export const texto = (name: string, label: string, obrigatorio = true): TextField => ({
  name,
  type: 'text',
  label,
  required: obrigatorio,
})

export const longo = (name: string, label: string, obrigatorio = true, descricao?: string): TextareaField => ({
  name,
  type: 'textarea',
  label,
  required: obrigatorio,
  admin: descricao ? { description: descricao } : undefined,
})

export const markdown = (name: string, label: string, obrigatorio = true): TextareaField => ({
  name,
  type: 'textarea',
  label,
  required: obrigatorio,
  admin: { description: 'Markdown (links, listas e negrito).' },
})

export const booleano = (name: string, label: string, padrao = false): CheckboxField => ({
  name,
  type: 'checkbox',
  label,
  required: true,
  defaultValue: padrao,
})

export const numero = (name: string, label: string): NumberField => ({
  name,
  type: 'number',
  label,
  required: true,
  admin: { step: 1 },
})

export const selecao = (
  name: string,
  label: string,
  opcoes: readonly string[],
  padrao?: string,
  obrigatorio = true,
): SelectField => ({
  name,
  type: 'select',
  label,
  required: obrigatorio,
  defaultValue: padrao,
  options: opcoes.map((valor) => ({ label: valor, value: valor })),
})

export const imagem = (name: string, label: string, obrigatorio = true): UploadField => ({
  name,
  type: 'upload',
  label,
  relationTo: 'midia',
  required: obrigatorio,
})

export const data = (name: string, label: string, obrigatorio = false): DateField => ({
  name,
  type: 'date',
  label,
  required: obrigatorio,
  admin: { date: { pickerAppearance: 'dayOnly' } },
})

export const grupo = (name: string, label: string, fields: Field[], obrigatorio = true): GroupField => ({
  name,
  type: 'group',
  label,
  required: obrigatorio,
  fields,
})

export const listaTextos = (name: string, label: string, rotuloItem: string): ArrayField => ({
  name,
  type: 'array',
  label,
  required: true,
  labels: { singular: rotuloItem, plural: label },
  fields: [{ name: 'valor', type: 'text', label: rotuloItem, required: true }],
})

const validarIdsUnicos: Validate = (valor: unknown) => {
  if (!Array.isArray(valor)) return true
  const ids: string[] = []
  for (const linha of valor) {
    if (linha && typeof linha === 'object' && 'odId' in linha && typeof linha.odId === 'string') {
      ids.push(linha.odId)
    }
  }

  return new Set(ids).size === ids.length || 'Identificadores devem ser únicos nesta lista'
}

const validarIdentificador: Validate = (valor: unknown) =>
  (typeof valor === 'string' && padraoIdentificador.test(valor)) || mensagemIdentificador

export const identificador = (): TextField => ({
  name: 'odId',
  type: 'text',
  label: 'Identificador',
  required: true,
  unique: false,
  admin: { description: dicaIdentificador },
  validate: validarIdentificador,
})

export const lista = (name: string, label: string, rotuloItem: string, fields: Field[]): ArrayField => ({
  name,
  type: 'array',
  label,
  required: true,
  labels: { singular: rotuloItem, plural: label },
  fields,
})

export const listaComId = (name: string, label: string, rotuloItem: string, fields: Field[]): ArrayField => ({
  name,
  type: 'array',
  label,
  required: true,
  labels: { singular: rotuloItem, plural: label },
  validate: validarIdsUnicos,
  fields: [identificador(), ...fields],
})

export const paginaInstitucional = (): Field[] => [
  grupo('seo', 'SEO', [
    texto('titulo', 'Título da página'),
    texto('tituloSocial', 'Título em redes sociais'),
    texto('descricao', 'Descrição'),
  ]),
  texto('eyebrow', 'Chamada'),
  texto('titulo', 'Título'),
  longo('lead', 'Introdução'),
  lista('secoes', 'Seções', 'Seção', [
    texto('titulo', 'Título da seção'),
    selecao('estilo', 'Estilo', ['texto', 'canais']),
    markdown('corpo', 'Conteúdo'),
  ]),
  markdown('nota', 'Nota', false),
  grupo('agentes', 'Para agentes', [texto('titulo', 'Título'), markdown('resumo', 'Resumo', false)]),
]
