import PaginaInstitucional from '@/components/PaginaInstitucional';
import { paginas } from '@/lib/conteudo';
import { metadados, ldPrivacidade } from '@/lib/seo';

export const metadata = metadados({ caminho: '/privacidade', seo: paginas.privacidade.seo, md: '/privacidade.md' });

export default function Pagina() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldPrivacidade()).replaceAll('<', '\\u003c') }} />
    <PaginaInstitucional slug="privacidade" />
  </>;
}
