import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { ARQUIVOS, PAGINAS_MD, config, proxy } from '@/proxy';

const CHROME = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';

const pedido = (caminho: string, accept?: string) =>
  new NextRequest(`https://cadeufpel.com${caminho}`, { headers: accept ? { accept } : {} });

describe('proxy (negociação por Accept)', () => {
  it('/sobre com text/markdown reescreve para o .md e anuncia Vary', () => {
    const res = proxy(pedido('/sobre', 'text/markdown'));
    expect(res.headers.get('x-middleware-rewrite')).toMatch(/\/sobre\.md$/);
    expect(res.headers.get('vary')).toContain('Accept');
  });

  it('/sobre com Accept de navegador não reescreve e anuncia o alternate', () => {
    const res = proxy(pedido('/sobre', CHROME));
    expect(res.headers.get('x-middleware-rewrite')).toBeNull();
    const link = res.headers.get('link') ?? '';
    expect(link).toContain('rel="alternate"');
    expect(link).toContain('text/markdown');
  });

  it('rota inexistente com */* reescreve para /api/404', () => {
    const res = proxy(pedido('/nao-existe', '*/*'));
    expect(res.headers.get('x-middleware-rewrite')).toMatch(/\/api\/404$/);
  });

  it('rota inexistente com Accept de navegador segue para not-found sem reescrita', () => {
    const res = proxy(pedido('/nao-existe', CHROME));
    expect(res.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('toda alternativa markdown aponta para um arquivo servido', () => {
    for (const destino of Object.values(PAGINAS_MD)) {
      expect(Object.hasOwn(ARQUIVOS, destino), destino).toBe(true);
    }
  });
});

describe('proxy matcher', () => {
  // Next compila o matcher como expressão anclada no caminho inteiro.
  const casa = new RegExp(`^${config.matcher[0]}$`);

  it.each(['/', '/sobre', '/galeria', '/sobre.md', '/llms.txt', '/administracao'])('processa %s', (caminho) => {
    expect(casa.test(caminho)).toBe(true);
  });

  it.each(['/admin', '/admin/', '/admin/collections/usuarios', '/api/cms/usuarios', '/api/enviar', '/_next/static/x.js', '/assets/logo.svg'])(
    'não processa %s',
    (caminho) => {
      expect(casa.test(caminho)).toBe(false);
    },
  );
});

// Varre app/ como o roteamento do Next: grupos "(…)" não aparecem na URL, e as rotas do
// painel Payload e os handlers de API ficam fora da enumeração pública.
type RotaApp = { url: string; tipo: 'page' | 'route' };

const APP = fileURLToPath(new URL('../app', import.meta.url));
const GRUPO = /^\(.+\)$/;
const EXCLUIDOS: Record<string, true> = { api: true, admin: true, '(payload)': true };

function rotasDoApp(dir: string, segmentos: string[] = []): RotaApp[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entrada): RotaApp[] => {
    const caminho = path.join(dir, entrada.name);
    if (entrada.isDirectory()) {
      if (Object.hasOwn(EXCLUIDOS, entrada.name) || entrada.name.startsWith('[')) return [];
      const proximos = GRUPO.test(entrada.name) ? segmentos : [...segmentos, entrada.name];
      return rotasDoApp(caminho, proximos);
    }
    const tipo = entrada.name === 'page.tsx' ? 'page' : entrada.name === 'route.ts' ? 'route' : null;
    if (!tipo) return [];
    return [{ url: `/${segmentos.join('/')}`, tipo }];
  });
}

describe('rotas públicas do app (route scanner)', () => {
  const rotas = rotasDoApp(APP);

  it('enumera páginas do site sem o grupo (site) na URL', () => {
    const paginas = rotas.filter((r) => r.tipo === 'page').map((r) => r.url).sort();
    expect(paginas).toEqual(Object.keys(PAGINAS_MD).sort());
  });

  it('toda página tem alternativa markdown e vice-versa', () => {
    const paginas = rotas.filter((r) => r.tipo === 'page').map((r) => r.url);
    for (const pagina of paginas) {
      expect(Object.hasOwn(PAGINAS_MD, pagina), pagina).toBe(true);
    }
    for (const pagina of Object.keys(PAGINAS_MD)) {
      expect(paginas, pagina).toContain(pagina);
    }
  });

  it('todo arquivo markdown/texto tem handler de rota, exceto os estáticos de public/', () => {
    const arquivos = rotas.filter((r) => r.tipo === 'route').map((r) => r.url).sort();
    const esperados = Object.keys(ARQUIVOS)
      .filter((arquivo) => arquivo !== '/robots.txt' && arquivo !== '/sitemap.xml')
      .sort();
    expect(arquivos).toEqual(esperados);
  });

  it('nenhuma rota de painel ou API entra na enumeração pública', () => {
    const urls = rotas.map((r) => r.url);
    expect(urls.filter((u) => u === '/admin' || u.startsWith('/admin/') || u.startsWith('/api/'))).toEqual([]);
  });
});
