import { describe, expect, it } from 'vitest';
import { oportunidadesPublicadas } from '@/lib/oportunidades';
import type { Oportunidade } from '@/lib/tipos';

function oportunidade(parcial: Partial<Oportunidade>): Oportunidade {
  return {
    publicado: true,
    titulo: '',
    tag: '',
    cor: 'verde',
    resumo: '',
    texto: '',
    cta: '',
    link: '',
    expira: '',
    ...parcial,
  } as Oportunidade;
}

const INSTAGRAM = 'https://www.instagram.com/cadesignufpel';

describe('oportunidades (lib/oportunidades)', () => {
  const itens = [
    oportunidade({ publicado: false, titulo: 'Rascunho', tag: 'bolsa' }),
    oportunidade({ publicado: false, titulo: 'Não publicado', tag: 'bolsa' }),
    oportunidade({
      tag: 'bolsa',
      cor: 'invalida' as Oportunidade['cor'],
      titulo: 'Título igual',
      resumo: 'Resumo A',
      link: 'sem-esquema',
      expira: '11/09/2026',
    }),
    oportunidade({
      tag: '',
      cor: 'ciano',
      titulo: 'Título igual',
      texto: 'Texto B',
      cta: 'Abrir',
      link: 'https://exemplo.test',
    }),
    oportunidade({ tag: 'edital', cor: 'amarelo', titulo: '' }),
    oportunidade({ tag: 'edital', titulo: 'Expirada', expira: '2026-09-09' }),
  ];

  it('publica só itens válidos, com ids únicos e fallbacks', () => {
    const resultado = oportunidadesPublicadas(itens, '2026-09-10', INSTAGRAM);
    expect(resultado).toHaveLength(2);
    expect(resultado.map((o) => o.id)).toEqual(['titulo-igual', 'titulo-igual-2']);
    expect(resultado[0].cor).toBe('verde');
    expect(resultado[0].link).toBe(INSTAGRAM);
    expect(resultado[1].cor).toBe('ciano');
    expect(resultado[1].texto).toBe('Texto B');
    expect(resultado.map((o) => o.titulo)).not.toContain('Expirada');
  });

  it('limita a 12 itens', () => {
    const muitos = Array.from({ length: 13 }, (_, i) => oportunidade({ titulo: `Oportunidade ${i + 1}` }));
    expect(oportunidadesPublicadas(muitos, '2026-09-10', INSTAGRAM)).toHaveLength(12);
  });

  it('expira com hora ainda conta como o próprio dia', () => {
    const resultado = oportunidadesPublicadas(
      [oportunidade({ titulo: 'Prazo hoje', expira: '2026-09-11T00:00' })],
      '2026-09-10',
      INSTAGRAM,
    );
    expect(resultado.map((o) => o.titulo)).toEqual(['Prazo hoje']);
  });
});
