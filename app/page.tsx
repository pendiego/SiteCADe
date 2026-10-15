import Nav from '@/components/Nav';
import Rodape from '@/components/Rodape';
import VoltarTopo from '@/components/VoltarTopo';
import Hero from '@/components/Hero';
import Agenda from '@/components/Agenda';
import QuemSomos from '@/components/QuemSomos';
import Historico from '@/components/Historico';
import Lojinha from '@/components/Lojinha';
import GuiaCalouro from '@/components/GuiaCalouro';
import Oportunidades from '@/components/Oportunidades';
import Faq from '@/components/Faq';
import Atalhos from '@/components/Atalhos';
import Formularios from '@/components/Formularios';
import MailtoCopia from '@/components/MailtoCopia';
import { site, navegacao, rodape, integracoes, inicioSeo, hero, agenda, quemSomos, lojinha, guia, oportunidadesTexto, dadosOportunidades, faq, atalhos, formularios } from '@/lib/conteudo';
import { oportunidadesPublicadas } from '@/lib/oportunidades';
import { metadados, ldInicio } from '@/lib/seo';

export const revalidate = 3600;
export const metadata = metadados({ caminho: '/', seo: inicioSeo.seo, md: '/index.md' });

export default function Inicio() {
  const itens = oportunidadesPublicadas(dadosOportunidades.itens, new Date(), site.instagramUrl);
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldInicio()).replaceAll('<', '\\u003c') }} />
    <Nav navegacao={navegacao} naHome />
    <main id="topo">
      <div className="area" id="area-cade" style={{ background: 'var(--bg-cade)' }} data-od-id="area-cade">
        <div className="faixa" style={{ background: 'var(--navy)' }} />
        <Hero slides={hero.slides} />
        <Agenda textos={agenda} calendarId={integracoes.googleCalendarId} assinarUrl={integracoes.calendarioAssinarUrl} />
        <QuemSomos textos={quemSomos} />
        <Historico />
        <Lojinha textos={lojinha} />
      </div>
      <div className="area" id="area-calouros" style={{ background: 'var(--bg-calouros)' }} data-od-id="area-calouros">
        <div className="faixa" style={{ background: 'var(--ciano)' }} />
        <GuiaCalouro textos={guia} pastaId={integracoes.drivePastaMateriais} />
      </div>
      <div className="area" id="area-dicas" style={{ background: 'var(--bg-dicas)' }} data-od-id="area-dicas">
        <div className="faixa" style={{ background: 'var(--amarelo)' }} />
        <Oportunidades textos={oportunidadesTexto} itens={itens} />
        <Faq textos={faq} />
        <Atalhos textos={atalhos} />
      </div>
      <div className="area" id="area-formularios" style={{ background: 'var(--bg-forms)' }} data-od-id="area-formularios">
        <div className="faixa" style={{ background: 'var(--verde)' }} />
        <Formularios textos={formularios} />
      </div>
    </main>
    <Rodape rodape={rodape} site={site} naHome />
    <VoltarTopo />
    <MailtoCopia />
  </>;
}
