import { getConteudo } from '@/lib/conteudo';
import { equipeMd } from '@/lib/equipe';
import { oportunidadesPublicadas } from '@/lib/oportunidades';
import { driveUrl } from '@/lib/links';

type Caminho = '/' | '/sobre' | '/contato' | '/privacidade' | '/galeria';
type Institucional = 'sobre' | 'contato' | 'privacidade';

// Ordem e rótulos das páginas do rodapé Markdown (rodapeMd(atual) omite a página atual).
function paginasRodape(siteUrl: string): Record<Caminho, { rotulo: string; href: string }> {
  return {
    '/': { rotulo: 'Início', href: `${siteUrl}/` },
    '/sobre': { rotulo: 'Sobre o CADe', href: `${siteUrl}/sobre` },
    '/contato': { rotulo: 'Contato', href: `${siteUrl}/contato` },
    '/privacidade': { rotulo: 'Privacidade', href: `${siteUrl}/privacidade` },
    '/galeria': { rotulo: 'Histórico e galeria', href: `${siteUrl}/galeria` },
  };
}

// Converte links relativos do conteúdo ("/sobre", "#agenda") em absolutos para agentes.
export function absolutizar(md: string, siteUrl: string): string {
  return md.replace(/\]\(\//g, `](${siteUrl}/`).replace(/\]\(#/g, `](${siteUrl}/#`);
}

export function rodapeMd(atual: Caminho, siteUrl: string): string {
  const paginas = paginasRodape(siteUrl);
  const links = (Object.keys(paginas) as Caminho[])
    .filter((c) => c !== atual)
    .map((c) => `- [${paginas[c].rotulo}](${paginas[c].href})`)
    .join('\n');
  return [
    '## Páginas',
    '',
    links,
    '',
    '## Para agentes',
    '',
    `- Instruções e casos de uso: [/llms.txt](${siteUrl}/llms.txt)`,
    `- Mapa do site: [/sitemap.xml](${siteUrl}/sitemap.xml)`,
    '',
  ].join('\n');
}

export async function mdInicio(hoje: Date): Promise<string> {
  const { site, inicioSeo, quemSomos, guia, oportunidadesTexto, faq, lojinha, atalhos, integracoes, dadosOportunidades } = await getConteudo();
  const publicadas = oportunidadesPublicadas(dadosOportunidades.itens, hoje, site.instagramUrl);
  const guiaLead = guia.lead.replace(/\n+/g, ' ');
  const cardsGuia = guia.cards
    .map((c) => `- **${c.titulo}** — ${c.texto}${c.href ? ` ([link](${c.href}))` : ''}`)
    .join('\n');
  const opsMd = publicadas.length
    ? publicadas
        .map((o) => `- **${o.titulo}** (${o.tag}) — ${o.resumo || o.texto} [${o.cta}](${o.link})`)
        .join('\n')
    : oportunidadesTexto.vazio;
  const perguntas = faq.itens.map((i) => `**${i.pergunta}**\n${i.resposta}`).join('\n\n');
  const atalhosMd = atalhos.itens.map((a) => `- [${a.titulo}](${a.href}) — ${a.subtitulo}`).join('\n');

  return absolutizar(
    [
      `# ${inicioSeo.agentes.titulo}`,
      '',
      `${inicioSeo.agentes.resumo}\n- **Gestão atual:** ${quemSomos.membros.length} alunos`,
      '',
      '## Quem somos',
      '',
      quemSomos.texto,
      '',
      'Mais detalhes: [Sobre o CADe](/sobre)',
      '',
      '## Agenda de eventos',
      '',
      `A agenda ao vivo fica em [cadeufpel.com/#agenda](/#agenda) e no [Google Calendar público](${integracoes.calendarioAssinarUrl}).`,
      '',
      '## Guia do calouro',
      '',
      guiaLead,
      '',
      cardsGuia,
      '',
      '## Oportunidades',
      '',
      oportunidadesTexto.lead,
      '',
      opsMd,
      '',
      'Lista em JSON: [/api/oportunidades](/api/oportunidades)',
      '',
      '## Perguntas frequentes',
      '',
      perguntas,
      '',
      '## Lojinha',
      '',
      lojinha.lead,
      '',
      `Pedidos pelo [Instagram](${site.instagramUrl}).`,
      '',
      '## Atalhos',
      '',
      atalhosMd,
      '',
      rodapeMd('/', site.url),
    ].join('\n'),
    site.url,
  );
}

export async function mdInstitucional(slug: Institucional): Promise<string> {
  const { site, paginas, quemSomos } = await getConteudo();
  const p = paginas[slug];
  const secoes = p.secoes
    .map((s) => {
      const base = `## ${s.titulo}\n\n${s.corpo}`;
      return s.estilo === 'gestao' ? `${base}\n\n${equipeMd(quemSomos)}` : base;
    })
    .join('\n\n');
  return absolutizar(
    [
      `# ${p.agentes.titulo}`,
      '',
      p.agentes.resumo,
      '',
      secoes,
      '',
      p.nota ? `${p.nota}\n` : '',
      rodapeMd(`/${slug}` as Caminho, site.url),
    ].join('\n'),
    site.url,
  );
}

export async function mdGaleria(): Promise<string> {
  const { site, galeria, integracoes } = await getConteudo();
  return absolutizar(
    [
      `# ${galeria.agentes.titulo}`,
      '',
      galeria.agentes.resumo,
      '',
      '## Sobre a galeria',
      '',
      `${galeria.titulo} ${galeria.lead}`,
      '',
      galeria.nota,
      '',
      `- [${galeria.driveRotulo}](${driveUrl(integracoes.drivePastaGaleria)})`,
      '',
      rodapeMd('/galeria', site.url),
    ].join('\n'),
    site.url,
  );
}
