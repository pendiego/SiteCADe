import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Rodape from '@/components/Rodape';
import { navegacao, rodape, site } from '@/lib/conteudo';

export const metadata: Metadata = {
  title: '404 — Página não encontrada — CADe UFPel',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <>
    <Nav navegacao={navegacao} naHome={false} />
    <main id="topo">
      <div className="area" id="area-404" style={{ background: 'var(--bg-cade)' }} data-od-id="area-404">
        <section className="sec wrap" data-od-id="erro-404">
          <div className="sec-head">
            <p className="eyebrow">ERRO 404</p>
            <h1 className="h-sec" data-od-id="erro-404-titulo">Essa página não existe.</h1>
            <p className="lead">O endereço que você abriu não corresponde a nenhuma página do site. Talvez o link esteja incompleto ou tenha vindo com um caractere a mais.</p>
          </div>
          <div className="inst-prosa" data-od-id="erro-404-links">
            <h2 data-od-id="erro-404-onde-procurar">Onde procurar</h2>
            <ul className="inst-canais">
              <li><span><b><a href="/">Início</a></b> — agenda de eventos, quem somos, guia do calouro, oportunidades, FAQ e formulários.</span></li>
              <li><span><b><a href="/sobre">Sobre o CADe</a></b> — o que é a organização, como a gestão é eleita e onde ficamos.</span></li>
              <li><span><b><a href="/contato">Contato</a></b> — e-mail, Instagram, formulários e para onde levar cada assunto.</span></li>
              <li><span><b><a href="/privacidade">Privacidade</a></b> — o que fazemos com os dados dos formulários.</span></li>
              <li><span><b><a href="/galeria">Galeria</a></b> — fotos de eventos, festas e gestões anteriores.</span></li>
            </ul>
            <p className="inst-nota">Se você chegou aqui por um link do próprio site, avise a gente pelo <a href="/contato">contato</a> que corrigimos.</p>
          </div>
        </section>
      </div>
    </main>
    <Rodape rodape={rodape} site={site} naHome={false} />
  </>;
}
