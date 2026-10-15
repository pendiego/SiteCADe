import { Marked, type Tokens } from 'marked';
import { site } from '@/lib/conteudo';
import type { SecaoInstitucional } from '@/lib/tipos';

function escapar(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Links http(s) externos ao site abrem em nova aba; mailto, "/..." e "#..." não.
const marcado = new Marked({
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
        try { externo = new URL(href).origin !== new URL(site.url).origin; }
        catch { return texto; }
      }
      const titulo = title ? ` title="${escapar(title)}"` : '';
      const alvo = externo ? ' target="_blank" rel="noopener"' : '';
      return `<a href="${escapar(href)}"${titulo}${alvo}>${texto}</a>`;
    },
  },
});

export function md(fonte: string): string {
  return marcado.parse(fonte) as string;
}

export function mdInline(fonte: string): string {
  return marcado.parseInline(fonte) as string;
}

// Porta de `.inst-canais`: a primeira lista da seção "canais" recebe a classe.
export function secaoHtml(s: SecaoInstitucional): string {
  const html = md(s.corpo);
  if (s.estilo !== 'canais') return html;
  return html.replace('<ul>', '<ul class="inst-canais">');
}
