import { mdInstitucional } from '@/lib/md-paginas';

export const dynamic = 'force-static';

export function GET() {
  return new Response(mdInstitucional('sobre'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept, Accept-Encoding',
    },
  });
}
