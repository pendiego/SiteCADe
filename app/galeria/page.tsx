import Nav from '@/components/Nav';
import Rodape from '@/components/Rodape';
import VoltarTopo from '@/components/VoltarTopo';
import GaleriaCompleta from '@/components/GaleriaCompleta';
import { navegacao, rodape, site, integracoes, galeria } from '@/lib/conteudo';
import { metadados, ldGaleria } from '@/lib/seo';

export const metadata = metadados({ caminho: '/galeria', seo: galeria.seo, md: '/galeria.md' });

export default function PaginaGaleria() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldGaleria()).replaceAll('<', '\\u003c') }} />
    <Nav navegacao={navegacao} naHome={false} />
    <GaleriaCompleta textos={galeria} pastaId={integracoes.drivePastaGaleria} />
    <Rodape rodape={rodape} site={site} naHome={false} />
    <VoltarTopo />
  </>;
}
