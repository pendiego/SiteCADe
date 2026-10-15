const SITE = 'https://cadeufpel.com';

const MARKDOWN = `# 404 — Página não encontrada

Este caminho não existe no site do CADe UFPel. Nada foi movido: a URL pedida
simplesmente nunca existiu.

## Onde procurar

- [Início](${SITE}/) — agenda, quem somos, guia do calouro, oportunidades, FAQ e formulários
- [Sobre o CADe](${SITE}/sobre) — o que é a organização, como a gestão é eleita, onde ficamos
- [Contato](${SITE}/contato) — e-mail, Instagram, formulários e para onde levar cada assunto
- [Privacidade](${SITE}/privacidade) — o que fazemos com os dados dos formulários
- [Galeria](${SITE}/galeria) — fotos de eventos e gestões anteriores

## Arquivos para agentes

- [/llms.txt](${SITE}/llms.txt) — resumo do site, casos de uso e quando recorrer a ele
- [/sitemap.xml](${SITE}/sitemap.xml) — todas as URLs canônicas
- [/robots.txt](${SITE}/robots.txt) — regras de rastreamento

Todas as páginas também respondem em markdown via \`Accept: text/markdown\`.
`;

export function GET() {
  return new Response(MARKDOWN, {
    status: 404,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept, Accept-Encoding',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      Link: `<${SITE}/sitemap.xml>; rel="sitemap", <${SITE}/llms.txt>; rel="help"`,
    },
  });
}
