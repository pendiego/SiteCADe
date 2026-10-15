import { MENSAGEM_NAO_SUPORTADO, credenciaisGitHub, paginaPopup } from '@/app/api/cms/_oauth';

export async function GET(request: Request): Promise<Response> {
  const parametros = new URL(request.url).searchParams;

  const cookie = request.headers.get('cookie') ?? '';
  const csrfCookie = /(?:^|;)\s*csrf-token=github_([0-9a-f]{32})(?=;|$)/.exec(cookie);
  if (!csrfCookie) {
    return paginaPopup({ error: MENSAGEM_NAO_SUPORTADO, errorCode: 'UNSUPPORTED_BACKEND' });
  }

  const code = parametros.get('code');
  const state = parametros.get('state');
  if (!code || !state) {
    return paginaPopup({
      error: 'Failed to receive an authorization code. Please try again later.',
      errorCode: 'AUTH_CODE_REQUEST_FAILED',
    });
  }

  // state precisa bater com o cookie gerado em /api/cms/auth (proteção CSRF)
  if (state !== csrfCookie[1]) {
    return paginaPopup({
      error: 'Potential CSRF attack detected. Authentication flow aborted.',
      errorCode: 'CSRF_DETECTED',
    });
  }

  const credenciais = credenciaisGitHub();
  if (!credenciais) {
    return paginaPopup({
      error: 'OAuth app client ID or secret is not configured.',
      errorCode: 'MISCONFIGURED_CLIENT',
    });
  }

  let resposta: Response;
  try {
    resposta = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: credenciais.clientId,
        client_secret: credenciais.clientSecret,
        code,
      }),
    });
  } catch {
    return paginaPopup({
      error: 'Failed to request access token. Please try again later.',
      errorCode: 'TOKEN_REQUEST_FAILED',
    });
  }

  let dados: unknown;
  try {
    dados = await resposta.json();
  } catch {
    return paginaPopup({
      error: 'Server responded with malformed data. Please try again later.',
      errorCode: 'MALFORMED_RESPONSE',
    });
  }

  const { access_token: accessToken, error } = (dados ?? {}) as Record<string, unknown>;
  if (typeof error === 'string' && error) {
    return paginaPopup({ error });
  }
  if (typeof accessToken === 'string' && accessToken) {
    return paginaPopup({ token: accessToken });
  }
  return paginaPopup({
    error: 'Server responded with malformed data. Please try again later.',
    errorCode: 'MALFORMED_RESPONSE',
  });
}
