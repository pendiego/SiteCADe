import { mdInstitucional } from '@/lib/md-paginas';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(await mdInstitucional('contato'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept, Accept-Encoding',
    },
  });
}
