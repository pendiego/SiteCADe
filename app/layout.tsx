import type { Metadata, Viewport } from 'next';
import { site } from '@/lib/conteudo';
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
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  icons: { icon: '/assets/favicon.svg', apple: '/assets/apple-touch-icon.png' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR">
    <head>
      <link rel="help" type="text/plain" href={`${site.url}/llms.txt`} title="Instruções para agentes — quando usar este site" />
      <link rel="preconnect" href="https://www.googleapis.com" />
      <link rel="preconnect" href="https://drive.google.com" />
      <link rel="preload" href="/assets/font/LTSuperior-Regular.c014d3ebf198.woff2" as="font" type="font/woff2" crossOrigin="" />
      <link rel="preload" href="/assets/font/LTSuperior-ExtraBold.d9f519a435a7.woff2" as="font" type="font/woff2" crossOrigin="" />
      <link rel="preload" href="/assets/font/material-symbols.b23762b70bc5.woff2" as="font" type="font/woff2" crossOrigin="" />
    </head>
    <body>{children}</body>
  </html>;
}
