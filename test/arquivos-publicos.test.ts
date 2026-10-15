import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const lerTexto = (arquivo: string) => readFileSync(path.join(raiz, arquivo), 'utf8');

describe('arquivos públicos', () => {
  it('sitemap lista as páginas canônicas sem www', () => {
    const xml = lerTexto('public/sitemap.xml');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const pagina of ['/', '/sobre', '/contato', '/privacidade', '/galeria']) {
      expect(locs).toContain(`https://cadeufpel.com${pagina}`);
    }
    for (const url of locs) expect(new URL(url).origin).toBe('https://cadeufpel.com');
  });

  it('robots aponta para o sitemap e para o llms.txt', () => {
    const robots = lerTexto('public/robots.txt');
    expect(robots).toContain('Sitemap: https://cadeufpel.com/sitemap.xml');
    expect(robots).toContain('/llms.txt');
  });
});
