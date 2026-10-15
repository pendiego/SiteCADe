import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as getEnviar, POST as postEnviar } from '@/app/(site)/api/enviar/route';

describe('api/enviar', () => {
  const ENV = { ...process.env };
  let fetchMock: Mock;

  beforeEach(() => {
    process.env = { ...ENV, RESEND_API_KEY: 're_teste', RESEND_TO: undefined, RESEND_FROM: undefined };
    fetchMock = vi.fn(async () => new Response('{"id":"x"}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    process.env = ENV;
    vi.unstubAllGlobals();
  });

  const json = (corpo: unknown) =>
    new Request('https://cadeufpel.com/api/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });

  it('GET responde 405', async () => {
    expect((await getEnviar()).status).toBe(405);
  });

  it('sem RESEND_API_KEY responde 500 sem enviar', async () => {
    process.env.RESEND_API_KEY = '';
    const res = await postEnviar(json({ formulario: 'participar', nome: 'Ana', email: 'a@b.com' }));
    expect(res.status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('honeypot preenchido finge sucesso e não envia', async () => {
    const res = await postEnviar(json({ formulario: 'falar', empresa: 'bot', assunto: 'x', mensagem: 'y' }));
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('participar sem nome responde 400', async () => {
    const res = await postEnviar(json({ formulario: 'participar', email: 'a@b.com' }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('aceita corpo form-urlencoded e envia pelo Resend', async () => {
    const req = new Request('https://cadeufpel.com/api/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'formulario=participar&nome=Ana&email=a%40b.com',
    });
    const res = await postEnviar(req);
    expect(res.status).toBe(200);
    const enviado = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(enviado.subject).toBe('[CADe] Quero participar — Ana');
    expect(enviado.to).toEqual(['cadesignufpel@gmail.com']);
  });

  it('destinatário com aspas curvas cai no padrão ASCII', async () => {
    process.env.RESEND_TO = '“contato@exemplo.com”';
    await postEnviar(json({ formulario: 'falar', assunto: 'Oi', mensagem: 'Texto', anonimo: true }));
    const enviado = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(enviado.to).toEqual(['cadesignufpel@gmail.com']);
    expect(enviado.html).toContain('Envio anônimo');
  });

  it('falha do Resend responde 502', async () => {
    fetchMock.mockResolvedValueOnce(new Response('erro', { status: 500 }));
    const res = await postEnviar(json({ formulario: 'participar', nome: 'Ana', email: 'a@b.com' }));
    expect(res.status).toBe(502);
  });
});
