import EquipeGestao from '@/components/EquipeGestao';
import Nav from '@/components/Nav';
import Rodape from '@/components/Rodape';
import { getConteudo } from '@/lib/conteudo';
import { mdInline, secaoHtml } from '@/lib/markdown';

interface Props {
  slug: 'sobre' | 'contato' | 'privacidade';
}

export default async function PaginaInstitucional({ slug }: Props) {
  const { paginas, navegacao, rodape, site, quemSomos } = await getConteudo();
  const pagina = paginas[slug];
  const fundo = slug === 'contato' ? 'var(--bg-forms)' : 'var(--bg-cade)';
  // wrapper com display:contents: o HTML do CMS continua filho direto de .inst-prosa para o CSS
  const blocos = pagina.secoes.map((secao, i) => {
    const titulo = secao.titulo.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<h2 data-od-id="${slug}-secao-${i + 1}">${titulo}</h2>${secaoHtml(secao, site.url)}`;
    return (
      <div key={i} style={{ display: 'contents' }}>
        <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />
        {secao.estilo === 'gestao' && <EquipeGestao quemSomos={quemSomos} />}
      </div>
    );
  });
  const nota = pagina.nota ? `<p class="inst-nota">${mdInline(pagina.nota, site.url)}</p>` : '';

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

        <div className="inst-prosa" data-od-id={`${slug}-prosa`}>
          {blocos}
          {nota && <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: nota }} />}
        </div>
      </section>
    </div>
    </main>
    <Rodape rodape={rodape} site={site} naHome={false} />
    </>
  );
}
