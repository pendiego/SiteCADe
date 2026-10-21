import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as getOportunidades } from '@/app/(site)/api/oportunidades/route';
import { GET as get404 } from '@/app/(site)/api/404/route';
import type { Conteudo } from '@/lib/conteudo';

// vi.hoisted roda antes dos imports estáticos, por isso o fs é carregado aqui dentro.
// Fronteira mockada: somente getConteudo; site vem do seed real.
const { estado } = await vi.hoisted(async () => {
  const { readFileSync } = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const seed = (arquivo: string) =>
    JSON.parse(readFileSync(path.join(fileURLToPath(new URL('../cms/seed', import.meta.url)), arquivo), 'utf8'));
  return {
    estado: {
      conteudo: { site: seed('site.json'), dadosOportunidades: { itens: [] } } as unknown as Conteudo,
    },
  };
});

vi.mock('@/lib/conteudo', () => ({ getConteudo: async () => estado.conteudo }));

const base = estado.conteudo;

const item = (parcial: Record<string, unknown>) => ({
  publicado: true,
  titulo: 'Item',
  tag: 'bolsa',
  cor: 'verde',
  resumo: 'R',
  texto: '',
  cta: 'Ver',
  link: 'https://exemplo.test',
  expira: '2026-12-31',
  ...parcial,
});

describe('api/oportunidades', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-10T12:00:00-03:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
    estado.conteudo = base;
  });

  it('devolve só itens publicados e vigentes, com cache de borda', async () => {
    estado.conteudo = {
      ...base,
      dadosOportunidades: {
        itens: [
          item({ titulo: 'Vigente' }),
          item({ titulo: 'Rascunho', publicado: false }),
          item({ titulo: 'Vencida', expira: '2026-09-09' }),
        ],
      },
    } as Conteudo;

    const res = await getOportunidades();
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('public, s-maxage=300, stale-while-revalidate=86400');
    const corpo = (await res.json()) as { atualizado: string; oportunidades: { titulo: string }[] };
    expect(corpo.oportunidades.map((o) => o.titulo)).toEqual(['Vigente']);
    expect(corpo.atualizado).toBe('2026-09-10T15:00:00.000Z');
  });
});

describe('api/404', () => {
  it('responde 404 em markdown com Link para sitemap e llms', async () => {
    const res = get404();
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
    expect(res.headers.get('link')).toContain('rel="sitemap"');
    expect(await res.text()).toMatch(/^# 404 — Página não encontrada/);
  });
});
