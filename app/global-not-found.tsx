import type { Metadata, Viewport } from 'next';
import { connection } from 'next/server';
import Nav from '@/components/Nav';
import Rodape from '@/components/Rodape';
import { getConteudo } from '@/lib/conteudo';
import './styles/base.css';
import './styles/nav.css';
import './styles/hero.css';
import './styles/agenda.css';
import './styles/secoes.css';
import './styles/componentes.css';
import './styles/icons.css';
import './styles/responsivo.css';
import './styles/institucional.css';
import './styles/galeria.css';

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#0b0b6d',
};

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const { site } = await getConteudo();
  return {
    metadataBase: new URL(site.url),
    title: '404 — Página não encontrada — CADe UFPel',
    robots: { index: false, follow: true },
    icons: { icon: '/assets/favicon.svg', apple: '/assets/apple-touch-icon.png' },
  };
}

export default async function GlobalNotFound() {
  await connection();
  const { site, navegacao, rodape } = await getConteudo();
  return <html lang="pt-BR">
    <head>
      <link rel="help" type="text/plain" href={`${site.url}/llms.txt`} title="Instruções para agentes — quando usar este site" />
      <link rel="preconnect" href="https://www.googleapis.com" />
      <link rel="preconnect" href="https://drive.google.com" />
      <link rel="preload" href="/assets/font/LTSuperior-Regular.c014d3ebf198.woff2" as="font" type="font/woff2" crossOrigin="" />
      <link rel="preload" href="/assets/font/LTSuperior-ExtraBold.d9f519a435a7.woff2" as="font" type="font/woff2" crossOrigin="" />
      <link rel="preload" href="/assets/font/material-symbols.b23762b70bc5.woff2" as="font" type="font/woff2" crossOrigin="" />
    </head>
    <body>
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
                <li><span><b><a href="/sobre">Sobre o CADe</a></b> — o que é a organização, quem compõe a gestão e onde ficamos.</span></li>
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
    </body>
  </html>;
}
