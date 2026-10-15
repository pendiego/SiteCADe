import { getConteudo } from '@/lib/conteudo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { llms } = await getConteudo();
  return new Response(llms.texto, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
