import { mdGaleria } from '@/lib/md-paginas';

export const dynamic = 'force-static';

export function GET() {
  return new Response(mdGaleria(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept, Accept-Encoding',
    },
  });
}
