import { Marked, type Tokens } from 'marked';
import type { SecaoInstitucional } from '@/lib/tipos';

// Origem canônica do site; usada quando o chamador não informa siteUrl.
const SITE_URL_PADRAO = 'https://cadeufpel.com';

function escapar(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Links http(s) externos ao site abrem em nova aba; mailto, "/..." e "#..." não.
function criarMarcado(siteUrl: string): Marked {
  return new Marked({
    async: false,
    renderer: {
      strong({ tokens }: Tokens.Strong): string {
        return `<b>${this.parser.parseInline(tokens)}</b>`;
      },
      html({ text }: { text: string }): string {
        return escapar(text);
      },
      link({ href, title, tokens }: Tokens.Link): string {
        const texto = this.parser.parseInline(tokens);
        if (!/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href)) return texto;
        let externo = false;
        if (/^https?:\/\//i.test(href)) {
          try { externo = new URL(href).origin !== new URL(siteUrl).origin; }
          catch { return texto; }
        }
        const titulo = title ? ` title="${escapar(title)}"` : '';
        const alvo = externo ? ' target="_blank" rel="noopener"' : '';
        return `<a href="${escapar(href)}"${titulo}${alvo}>${texto}</a>`;
      },
    },
  });
}

const marcadores = new Map<string, Marked>();

function marcadorPara(siteUrl: string): Marked {
  let marcado = marcadores.get(siteUrl);
  if (!marcado) {
    marcado = criarMarcado(siteUrl);
    marcadores.set(siteUrl, marcado);
  }
  return marcado;
}

export function md(fonte: string, siteUrl: string = SITE_URL_PADRAO): string {
  return marcadorPara(siteUrl).parse(fonte) as string;
}

export function mdInline(fonte: string, siteUrl: string = SITE_URL_PADRAO): string {
  return marcadorPara(siteUrl).parseInline(fonte) as string;
}

// Porta de `.inst-canais`: a primeira lista da seção "canais" recebe a classe.
// Estilo "lista": cada item "**Título** — descrição" vira título + descrição (layout editorial, sem o travessão).
export function secaoHtml(s: SecaoInstitucional, siteUrl: string = SITE_URL_PADRAO): string {
  const html = md(s.corpo, siteUrl);
  if (s.estilo === 'canais') return html.replace('<ul>', '<ul class="inst-canais">');
  if (s.estilo === 'lista') {
    return html
      .replace('<ul>', '<ul class="inst-lista">')
      .replace(
        /<li><b>([\s\S]*?)<\/b> — ([\s\S]*?)<\/li>/g,
        (_item, titulo: string, descricao: string) =>
          `<li><b>${titulo}</b><span>${descricao.replace(/^\p{Ll}/u, (letra) => letra.toUpperCase())}</span></li>`,
      );
  }
  return html;
}
