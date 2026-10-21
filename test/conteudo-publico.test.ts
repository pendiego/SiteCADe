import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Conteudo } from '@/lib/conteudo';
import * as md from '@/lib/md-paginas';
import * as seo from '@/lib/seo';

// vi.hoisted roda antes dos imports estáticos, por isso o fs é carregado aqui dentro.
// Fixture = JSONs de cms/seed, na forma pública de Conteudo. A única fronteira mockada é getConteudo.
const { estado } = await vi.hoisted(async () => {
  const { readFileSync } = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const seed = (arquivo: string) =>
    JSON.parse(readFileSync(path.join(fileURLToPath(new URL('../cms/seed', import.meta.url)), arquivo), 'utf8'));
  const conteudo = {
    site: seed('site.json'),
    navegacao: seed('navegacao.json'),
    rodape: seed('rodape.json'),
    integracoes: seed('integracoes.json'),
    llms: seed('llms.json'),
    dadosOportunidades: seed('oportunidades.json'),
    inicioSeo: seed('inicio/seo.json'),
    hero: seed('inicio/hero.json'),
    agenda: seed('inicio/agenda.json'),
    quemSomos: seed('inicio/quem-somos.json'),
    historico: seed('inicio/historico.json'),
    lojinha: seed('inicio/lojinha.json'),
    guia: seed('inicio/guia.json'),
    oportunidadesTexto: seed('inicio/oportunidades.json'),
    faq: seed('inicio/faq.json'),
    atalhos: seed('inicio/atalhos.json'),
    formularios: seed('inicio/formularios.json'),
    galeria: seed('paginas/galeria.json'),
    paginas: {
      sobre: seed('paginas/sobre.json'),
      contato: seed('paginas/contato.json'),
      privacidade: seed('paginas/privacidade.json'),
    },
  };
  return { estado: { conteudo: conteudo as unknown as Conteudo } };
});

vi.mock('@/lib/conteudo', () => ({ getConteudo: async () => estado.conteudo }));

const base = estado.conteudo;
afterEach(() => {
  estado.conteudo = base;
});

const HOJE = new Date('2026-09-10T12:00:00-03:00');

describe('markdown de páginas (lib/md-paginas)', () => {
  it.each([
    ['inicio', () => md.mdInicio(HOJE)],
    ['sobre', () => md.mdInstitucional('sobre')],
    ['contato', () => md.mdInstitucional('contato')],
    ['privacidade', () => md.mdInstitucional('privacidade')],
    ['galeria', () => md.mdGaleria()],
  ])('%s aponta para llms.txt e sitemap, sem links relativos', async (_nome, gerar) => {
    const texto = await gerar();
    expect(texto).toContain('/llms.txt');
    expect(texto).toContain('/sitemap.xml');
    expect(texto).not.toContain('](/');
    expect(texto).not.toContain('](#');
  });

  it('mdInicio reflete a gestão vinda do conteúdo, não um número fixo', async () => {
    const membros = base.quemSomos.membros.slice(0, 3);
    estado.conteudo = { ...base, quemSomos: { ...base.quemSomos, membros } };
    expect(await md.mdInicio(HOJE)).toContain('Gestão atual:** 3 alunos');
  });

  it('mdInstitucional(sobre) lista coordenação com cargo e demais membros, vindos do mesmo conteúdo da home', async () => {
    const texto = await md.mdInstitucional('sobre');
    expect(texto).toContain('### Coordenação');
    expect(texto).toContain('- **Ana Tomasi** — Coordenadora geral');
    expect(texto).toContain('### Membros');
    // quem não é coordenação não ganha cargo nem aparece na lista de coordenação
    expect(texto).not.toContain('- **Ana** —');

    // trocar a lista no painel muda a página: o conteúdo é a única fonte
    const membros = [
      { nome: 'Zeca', foto: '/z.webp', enquadramento: '50% 25%', cargo: 'Tesoureiro', coordenacao: true },
      { nome: 'Bia', foto: '/b.webp', enquadramento: '50% 25%', cargo: '', coordenacao: false },
    ];
    estado.conteudo = { ...base, quemSomos: { ...base.quemSomos, membros } };
    const outro = await md.mdInstitucional('sobre');
    expect(outro).toContain('- **Zeca** — Tesoureiro');
    expect(outro).toContain('Bia.');
    expect(outro).not.toContain('Ana Tomasi');
  });

  it('mdInstitucional(sobre) sem ninguém marcado como coordenação não inventa o bloco', async () => {
    const membros = [{ nome: 'Bia', foto: '/b.webp', enquadramento: '50% 25%', coordenacao: false }];
    estado.conteudo = { ...base, quemSomos: { ...base.quemSomos, membros } };
    const texto = await md.mdInstitucional('sobre');
    expect(texto).not.toContain('### Coordenação');
    expect(texto).toContain('### Membros');
  });

  it('mdInicio lista só oportunidades publicadas e vigentes', async () => {
    estado.conteudo = {
      ...base,
      dadosOportunidades: {
        itens: [
          { publicado: true, titulo: 'Vaga vigente', tag: 'bolsa', cor: 'verde', resumo: 'R', texto: '', cta: 'Ver', link: 'https://exemplo.test', expira: '2026-12-31' },
          { publicado: false, titulo: 'Rascunho secreto', tag: 'bolsa', cor: 'verde', resumo: 'R', texto: '', cta: 'Ver', link: 'https://exemplo.test', expira: '2026-12-31' },
          { publicado: true, titulo: 'Vaga vencida', tag: 'bolsa', cor: 'verde', resumo: 'R', texto: '', cta: 'Ver', link: 'https://exemplo.test', expira: '2026-09-01' },
        ],
      },
    };
    const texto = await md.mdInicio(HOJE);
    expect(texto).toContain('Vaga vigente');
    expect(texto).not.toContain('Rascunho secreto');
    expect(texto).not.toContain('Vaga vencida');
  });

  it('mdInicio sem oportunidades publicadas mostra o texto de vazio do conteúdo', async () => {
    estado.conteudo = { ...base, dadosOportunidades: { itens: [] } };
    expect(await md.mdInicio(HOJE)).toContain(base.oportunidadesTexto.vazio);
  });
});

describe('SEO (lib/seo)', () => {
  function organizacoes(no: unknown): Record<string, unknown>[] {
    if (Array.isArray(no)) return no.flatMap(organizacoes);
    if (!no || typeof no !== 'object') return [];
    const objeto = no as Record<string, unknown>;
    const achados = objeto['@type'] === 'Organization' ? [objeto] : [];
    return [...achados, ...Object.values(objeto).flatMap(organizacoes)];
  }

  it.each([
    ['inicio', () => seo.ldInicio()],
    ['sobre', () => seo.ldSobre()],
    ['contato', () => seo.ldContato()],
    ['privacidade', () => seo.ldPrivacidade()],
  ])('JSON-LD de %s: organizações completas', async (_pagina, gerar) => {
    const ld = await gerar();
    const json = typeof ld === 'string' ? JSON.parse(ld) : ld;
    for (const org of organizacoes(json)) {
      if (Object.keys(org).length <= 2) continue;
      const contatos = ([] as unknown[]).concat(org.contactPoint as unknown);
      expect(contatos.length, 'contactPoint').toBeGreaterThan(0);
      for (const contato of contatos as Record<string, unknown>[]) {
        expect(contato.contactType).toBeTruthy();
        expect(contato.email || contato.telephone).toBeTruthy();
      }
      const endereco = org.address as Record<string, unknown>;
      expect(endereco['@type']).toBe('PostalAddress');
      expect(endereco.addressLocality).toBeTruthy();
      expect(endereco.addressCountry).toBeTruthy();
    }
  });

  it('preserva URLs absolutas de imagens do Blob nos metadados sociais', async () => {
    const imagem = 'https://cade.public.blob.vercel-storage.com/og-image.webp';
    estado.conteudo = { ...base, site: { ...base.site, ogImagem: imagem } };
    const meta = await seo.metadados({ caminho: '/', seo: base.inicioSeo.seo, md: '/index.md' });
    expect(meta.openGraph?.images).toEqual([imagem]);
    const organizacao = (await seo.ldInicio())['@graph'].find((no) => no['@type'] === 'Organization');
    expect(organizacao?.image).toBe(imagem);
  });

  it('canonical resolve para o domínio sem www', async () => {
    const meta = await seo.metadados({
      caminho: '/sobre',
      seo: base.paginas.sobre.seo,
      md: '/sobre.md',
    });
    const canonical = new URL(String(meta.alternates?.canonical), base.site.url);
    expect(canonical.href.startsWith('https://cadeufpel.com/')).toBe(true);
    expect(canonical.href).not.toContain('www.');
    expect(meta.alternates?.types?.['text/markdown']).toBe('/sobre.md');
  });
});
