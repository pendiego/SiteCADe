import PaginaInstitucional from '@/components/PaginaInstitucional';
import { paginas } from '@/lib/conteudo';
import { metadados, ldSobre } from '@/lib/seo';

export const metadata = metadados({ caminho: '/sobre', seo: paginas.sobre.seo, md: '/sobre.md' });

export default function Pagina() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldSobre()).replaceAll('<', '\\u003c') }} />
    <PaginaInstitucional slug="sobre" />
  </>;
}
