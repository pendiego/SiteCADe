import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';
import { projetarDocumento } from '@/cms/projecao';

const fields: Field[] = [
    { name: 'odId', type: 'text', required: true },
    { name: 'titulo', type: 'text', required: true },
    { name: 'resumo', type: 'textarea' },
    { name: 'ativo', type: 'checkbox' },
    { name: 'ordem', type: 'number' },
    { name: 'expira', type: 'date' },
    { name: 'foto', type: 'upload', relationTo: 'midia' },
    { name: 'tags', type: 'array', fields: [{ name: 'valor', type: 'text' }] },
    {
      name: 'links',
      type: 'array',
      fields: [
        { name: 'rotulo', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    { name: 'meta', type: 'group', fields: [{ name: 'chave', type: 'text', required: true }] },
];
const modelo = { slug: 'teste', fields };

const documento = {
  id: 'interno-123',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  _status: 'published',
  odId: 'vaga-1',
  titulo: 'Monitoria',
  resumo: '',
  ativo: true,
  ordem: 2,
  expira: '2026-09-11T00:00:00.000Z',
  foto: { id: 'm1', url: '/assets/uploads/vaga.webp', filename: 'vaga.webp' },
  tags: [{ id: 't1', valor: 'ensino' }, { id: 't2', valor: 'design' }],
  links: [{ id: 'l1', rotulo: 'Edital', href: 'https://exemplo.test' }],
  meta: { chave: 'valor' },
};

describe('projetarDocumento (cms/projecao)', () => {
  it('remove metadados do Payload e troca odId por id', () => {
    const projetado = projetarDocumento(documento, modelo);
    expect(projetado).not.toHaveProperty('createdAt');
    expect(projetado).not.toHaveProperty('updatedAt');
    expect(projetado).not.toHaveProperty('_status');
    expect(projetado).not.toHaveProperty('odId');
    expect(projetado.id).toBe('vaga-1');
  });

  it('achata array de {valor} em lista de strings e preserva linhas de objeto sem ids', () => {
    const projetado = projetarDocumento(documento, modelo);
    expect(projetado.tags).toEqual(['ensino', 'design']);
    expect(projetado.links).toEqual([{ rotulo: 'Edital', href: 'https://exemplo.test' }]);
  });

  it('troca upload populado pela url', () => {
    expect(projetarDocumento(documento, modelo).foto).toBe('/assets/uploads/vaga.webp');
  });

  it('normaliza data para YYYY-MM-DD', () => {
    expect(projetarDocumento(documento, modelo).expira).toBe('2026-09-11');
  });

  it('texto opcional vazio vira string vazia', () => {
    expect(projetarDocumento(documento, modelo).resumo).toBe('');
  });

  it('upload sem url populada falha', () => {
    expect(() => projetarDocumento({ ...documento, foto: 'm1' }, modelo)).toThrow();
    expect(() => projetarDocumento({ ...documento, foto: { id: 'm1' } }, modelo)).toThrow();
  });

  it('texto obrigatório ausente falha', () => {
    expect(() => projetarDocumento({ ...documento, titulo: undefined }, modelo)).toThrow();
  });

  it('checkbox e número com tipo errado falham', () => {
    expect(() => projetarDocumento({ ...documento, ativo: 'sim' }, modelo)).toThrow();
    expect(() => projetarDocumento({ ...documento, ordem: '2' }, modelo)).toThrow();
  });

  it('grupo ausente falha em vez de inventar valores', () => {
    expect(() => projetarDocumento({ ...documento, meta: undefined }, modelo)).toThrow();
  });

  it('lista que não é array falha', () => {
    expect(() => projetarDocumento({ ...documento, tags: 'ensino' }, modelo)).toThrow();
  });

  it('campos de layout (collapsible) não escondem os filhos', () => {
    const layout: Field[] = [
      { type: 'collapsible', label: 'x', fields: [{ name: 'titulo', type: 'text', required: true }] },
      {
        name: 'links',
        type: 'array',
        fields: [
          { type: 'collapsible', label: 'y', fields: [{ name: 'rotulo', type: 'text', required: true }] },
        ],
      },
    ];
    const projetado = projetarDocumento({ titulo: 'A', links: [{ id: 'l1', rotulo: 'B' }] }, { slug: 't', fields: layout });
    expect(projetado).toEqual({ titulo: 'A', links: [{ rotulo: 'B' }] });
  });
});
