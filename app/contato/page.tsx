import PaginaInstitucional from '@/components/PaginaInstitucional';
import { paginas } from '@/lib/conteudo';
import { metadados, ldContato } from '@/lib/seo';

export const metadata = metadados({ caminho: '/contato', seo: paginas.contato.seo, md: '/contato.md' });

export default function Pagina() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldContato()).replaceAll('<', '\\u003c') }} />
    <PaginaInstitucional slug="contato" />
  </>;
}
