import { mdInicio } from '@/lib/md-paginas';

export const revalidate = 3600;

export function GET() {
  return new Response(mdInicio(new Date()), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept, Accept-Encoding',
    },
  });
}
