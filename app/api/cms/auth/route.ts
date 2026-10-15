import { MENSAGEM_NAO_SUPORTADO, credenciaisGitHub, escopoValidado, paginaPopup } from '@/app/api/cms/_oauth';

export function GET(request: Request): Response {
  const parametros = new URL(request.url).searchParams;

  if (parametros.get('provider') !== 'github') {
    return paginaPopup({ error: MENSAGEM_NAO_SUPORTADO, errorCode: 'UNSUPPORTED_BACKEND' });
  }

  const credenciais = credenciaisGitHub();
  if (!credenciais) {
    return paginaPopup({
      error: 'OAuth app client ID or secret is not configured.',
      errorCode: 'MISCONFIGURED_CLIENT',
    });
  }

  const csrf = crypto.randomUUID().replaceAll('-', '');
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', credenciais.clientId);
  url.searchParams.set('scope', escopoValidado(parametros.get('scope')));
  url.searchParams.set('state', csrf);

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      'Set-Cookie': `csrf-token=github_${csrf}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax; Secure`,
    },
  });
}
