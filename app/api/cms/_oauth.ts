export const ORIGEM_CMS = 'https://cadeufpel.com';

const ESCOPOS_PERMITIDOS = ['repo', 'public_repo', 'user', 'read:user', 'user:email'];
const ESCOPO_PADRAO = 'repo,user';

export const MENSAGEM_NAO_SUPORTADO = 'Your Git backend is not supported by the authenticator.';

// escopo pedido pelo CMS só vale se todos os itens estiverem na lista permitida; senão, padrão
export function escopoValidado(pedido: string | null): string {
  const escopos = (pedido ?? '').split(/[\s,]+/).filter(Boolean);
  const validos = escopos.length > 0 && escopos.every((escopo) => ESCOPOS_PERMITIDOS.includes(escopo));
  return validos ? escopos.join(',') : ESCOPO_PADRAO;
}

export function credenciaisGitHub(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

// serializa valor para dentro de <script>: escapa '<' para impedir fechar a tag
function paraScript(valor: unknown): string {
  return JSON.stringify(valor ?? null).replaceAll('<', '\\u003c');
}

type Resultado = { token?: string; error?: string; errorCode?: string };

// HTML do popup: entrega o resultado ao CMS (opener) pelo protocolo do sveltia-cms-auth
export function paginaPopup({ token, error, errorCode }: Resultado): Response {
  const estado = error ? 'error' : 'success';
  const conteudo = error ? { provider: 'github', error, errorCode } : { provider: 'github', token };
  const mensagem = `authorization:github:${estado}:${JSON.stringify(conteudo)}`;

  const html = `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Autorização — CADe UFPel</title></head>
<body>
<script>
(() => {
  const origemConfiavel = ${paraScript(ORIGEM_CMS)};
  const mensagem = ${paraScript(mensagem)};
  const temToken = ${paraScript(Boolean(token))};
  window.addEventListener('message', ({ data, origin }) => {
    if (data !== 'authorizing:github') return;
    if (temToken && origin !== origemConfiavel) return;
    window.opener?.postMessage(mensagem, origin);
  });
  window.opener?.postMessage('authorizing:github', '*');
})();
</script>
</body>
</html>
`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': 'csrf-token=deleted; HttpOnly; Max-Age=0; Path=/; SameSite=Lax; Secure',
    },
  });
}
