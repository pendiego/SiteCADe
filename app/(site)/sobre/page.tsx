import type { Metadata } from 'next';
import PaginaInstitucional from '@/components/PaginaInstitucional';
import { getConteudo } from '@/lib/conteudo';
import { metadados, ldSobre } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { paginas } = await getConteudo();
  return metadados({ caminho: '/sobre', seo: paginas.sobre.seo, md: '/sobre.md' });
}

export default async function Pagina() {
  const ld = await ldSobre();
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replaceAll('<', '\\u003c') }} />
    <PaginaInstitucional slug="sobre" />
  </>;
}
