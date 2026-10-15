import Nav from '@/components/Nav';
import Rodape from '@/components/Rodape';
import { paginas, navegacao, rodape, site } from '@/lib/conteudo';
import { mdInline, secaoHtml } from '@/lib/markdown';

interface Props {
  slug: 'sobre' | 'contato' | 'privacidade';
}

export default function PaginaInstitucional({ slug }: Props) {
  const pagina = paginas[slug];
  const fundo = slug === 'contato' ? 'var(--bg-forms)' : 'var(--bg-cade)';
  const prosa = pagina.secoes.map((secao, i) => {
    const titulo = secao.titulo.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<h2 data-od-id="${slug}-secao-${i + 1}">${titulo}</h2>${secaoHtml(secao)}`;
  }).join('') + (pagina.nota ? `<p class="inst-nota">${mdInline(pagina.nota)}</p>` : '');

  return (
    <>
    <Nav navegacao={navegacao} naHome={false} />
    <main id="topo">
    <div className="area" id={`area-${slug}`} style={{ background: fundo }} data-od-id={`area-${slug}`}>
      <section className="sec wrap" data-od-id={`${slug}-institucional`}>
        <div className="sec-head">
          <p className="eyebrow">{pagina.eyebrow}</p>
          <h1 className="h-sec">{pagina.titulo}</h1>
          <p className="lead">{pagina.lead}</p>
        </div>

        <div className="inst-prosa" data-od-id={`${slug}-prosa`} dangerouslySetInnerHTML={{ __html: prosa }} />
      </section>
    </div>
    </main>
    <Rodape rodape={rodape} site={site} naHome={false} />
    </>
  );
}
