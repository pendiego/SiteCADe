import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { modelos } from '@/cms/modelos';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const CHAVES_PUBLICAS = [
  'site',
  'navegacao',
  'rodape',
  'integracoes',
  'llms',
  'dadosOportunidades',
  'inicioSeo',
  'hero',
  'agenda',
  'quemSomos',
  'historico',
  'lojinha',
  'guia',
  'oportunidadesTexto',
  'faq',
  'atalhos',
  'formularios',
  'galeria',
  'paginas.sobre',
  'paginas.contato',
  'paginas.privacidade',
];

describe('catálogo de modelos (cms/modelos)', () => {
  it('tem um documento por chave pública do conteúdo, sem sobra', () => {
    expect(modelos.map((m) => m.chave).sort()).toEqual([...CHAVES_PUBLICAS].sort());
    expect(modelos).toHaveLength(21);
  });

  it('chaves e slugs são únicos', () => {
    expect(new Set(modelos.map((m) => m.chave)).size).toBe(modelos.length);
    expect(new Set(modelos.map((m) => m.slug)).size).toBe(modelos.length);
  });

  it('slugs são kebab-case', () => {
    for (const modelo of modelos) {
      expect(modelo.slug, modelo.chave).toMatch(KEBAB);
    }
  });

  it('cada modelo aponta para um JSON de seed existente', () => {
    for (const modelo of modelos) {
      expect(modelo.arquivo, modelo.chave).toMatch(/^cms\/seed\/.+\.json$/);
      expect(existsSync(path.join(raiz, modelo.arquivo)), modelo.arquivo).toBe(true);
    }
  });
});
