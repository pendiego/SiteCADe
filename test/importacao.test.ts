import type { Field } from 'payload'
import { describe, expect, it } from 'vitest'
import { converterDados } from '@/cms/importacao'

const resolver = async () => 1

const campos: Field[] = [
  { type: 'collapsible', label: 'x', fields: [{ name: 'titulo', type: 'text', required: true }] },
  {
    name: 'itens',
    type: 'array',
    fields: [
      { type: 'collapsible', label: 'y', fields: [{ name: 'odId', type: 'text', required: true }] },
      { name: 'rotulo', type: 'text', required: true },
    ],
  },
]

describe('converterDados (cms/importacao)', () => {
  it('preserva campos dentro de collapsible e converte id em odId', async () => {
    const saida = await converterDados(campos, { titulo: 'A', itens: [{ id: 'x', rotulo: 'B' }] }, resolver)
    expect(saida).toEqual({ titulo: 'A', itens: [{ odId: 'x', rotulo: 'B' }] })
  })
})
