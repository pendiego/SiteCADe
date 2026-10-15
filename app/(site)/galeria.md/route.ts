import { mdGaleria } from '@/lib/md-paginas';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(await mdGaleria(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept, Accept-Encoding',
    },
  });
}
