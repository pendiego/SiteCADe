import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Rodape from '@/components/Rodape';
import VoltarTopo from '@/components/VoltarTopo';
import GaleriaCompleta from '@/components/GaleriaCompleta';
import { getConteudo } from '@/lib/conteudo';
import { metadados, ldGaleria } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { galeria } = await getConteudo();
  return metadados({ caminho: '/galeria', seo: galeria.seo, md: '/galeria.md' });
}

export default async function PaginaGaleria() {
  const { navegacao, rodape, site, integracoes, galeria } = await getConteudo();
  const ld = await ldGaleria();
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replaceAll('<', '\\u003c') }} />
    <Nav navegacao={navegacao} naHome={false} />
    <GaleriaCompleta textos={galeria} pastaId={integracoes.drivePastaGaleria} />
    <Rodape rodape={rodape} site={site} naHome={false} />
    <VoltarTopo />
  </>;
}
