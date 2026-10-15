import { llms } from '@/lib/conteudo';

export const dynamic = 'force-static';

export function GET() {
  return new Response(llms.texto, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
