import { site, inicioSeo, quemSomos, guia, oportunidadesTexto, faq, lojinha, atalhos, paginas, galeria, integracoes, dadosOportunidades } from '@/lib/conteudo';
import { oportunidadesPublicadas } from '@/lib/oportunidades';
import { driveUrl } from '@/lib/links';

type Caminho = '/' | '/sobre' | '/contato' | '/privacidade' | '/galeria';
type Institucional = 'sobre' | 'contato' | 'privacidade';

// Ordem e rótulos das páginas do rodapé Markdown (rodapeMd(atual) omite a página atual).
const PAGINAS_RODAPE: Record<Caminho, { rotulo: string; href: string }> = {
  '/': { rotulo: 'Início', href: `${site.url}/` },
  '/sobre': { rotulo: 'Sobre o CADe', href: `${site.url}/sobre` },
  '/contato': { rotulo: 'Contato', href: `${site.url}/contato` },
  '/privacidade': { rotulo: 'Privacidade', href: `${site.url}/privacidade` },
  '/galeria': { rotulo: 'Histórico e galeria', href: `${site.url}/galeria` },
};

// Converte links relativos do conteúdo ("/sobre", "#agenda") em absolutos para agentes.
export function absolutizar(md: string): string {
  return md.replace(/\]\(\//g, `](${site.url}/`).replace(/\]\(#/g, `](${site.url}/#`);
}

export function rodapeMd(atual: Caminho): string {
  const links = (Object.keys(PAGINAS_RODAPE) as Caminho[])
    .filter((c) => c !== atual)
    .map((c) => `- [${PAGINAS_RODAPE[c].rotulo}](${PAGINAS_RODAPE[c].href})`)
    .join('\n');
  return [
    '## Páginas',
    '',
    links,
    '',
    '## Para agentes',
    '',
    `- Instruções e casos de uso: [/llms.txt](${site.url}/llms.txt)`,
    `- Mapa do site: [/sitemap.xml](${site.url}/sitemap.xml)`,
    '',
  ].join('\n');
}

export function mdInicio(hoje: Date): string {
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
      `${inicioSeo.agentes.resumo}\n- **Gestão atual:** ${quemSomos.membros.length} alunos eleitos`,
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
      rodapeMd('/'),
    ].join('\n'),
  );
}

export function mdInstitucional(slug: Institucional): string {
  const p = paginas[slug];
  const secoes = p.secoes
    .map((s) => `## ${s.titulo}\n\n${s.corpo}`)
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
      rodapeMd(`/${slug}` as Caminho),
    ].join('\n'),
  );
}

export function mdGaleria(): string {
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
      rodapeMd('/galeria'),
    ].join('\n'),
  );
}
