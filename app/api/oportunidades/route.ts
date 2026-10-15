import { dadosOportunidades, site } from '@/lib/conteudo';
import { oportunidadesPublicadas } from '@/lib/oportunidades';

export const dynamic = 'force-dynamic';

export function GET() {
  const agora = new Date();
  return Response.json(
    {
      atualizado: agora.toISOString(),
      oportunidades: oportunidadesPublicadas(dadosOportunidades.itens, agora, site.instagramUrl),
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
      },
    },
  );
}
