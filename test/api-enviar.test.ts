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

  // cada chamada vem de um IP novo (o limite de taxa é por IP) e do próprio site (checagem de origem)
  let ipSeq = 0;
  const cabecalhos = (extra: Record<string, string> = {}, ip = `10.0.0.${++ipSeq}`) => ({
    Origin: 'https://cadeufpel.com',
    Host: 'cadeufpel.com',
    'X-Forwarded-For': ip,
    ...extra,
  });
  const json = (corpo: unknown, extra: Record<string, string> = {}, ip?: string) =>
    new Request('https://cadeufpel.com/api/enviar', {
      method: 'POST',
      headers: cabecalhos({ 'Content-Type': 'application/json', ...extra }, ip),
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

  it('aceita corpo form-urlencoded com vários horários e envia pelo Resend', async () => {
    const req = new Request('https://cadeufpel.com/api/enviar', {
      method: 'POST',
      headers: cabecalhos({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      body: 'formulario=participar&nome=Ana&email=a%40b.com&disponibilidade=qua-14%3A30&disponibilidade=seg-09%3A00&disponibilidade=seg-09%3A30',
    });
    const res = await postEnviar(req);
    expect(res.status).toBe(200);
    const enviado = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(enviado.subject).toBe('[CADe] Quero participar — Ana');
    expect(enviado.to).toEqual(['cadesignufpel@gmail.com']);
    expect(enviado.html).toContain('Segunda-feira: 09:00, 09:30<br>Quarta-feira: 14:30');
  });

  it('participar sem disponibilidade responde 400', async () => {
    for (const disponibilidade of [undefined, [], 'seg-09:00']) {
      const res = await postEnviar(json({ formulario: 'participar', nome: 'Ana', email: 'a@b.com', disponibilidade }));
      expect(res.status).toBe(400);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('participar com horário fora da grade responde 400', async () => {
    for (const invalido of ['seg-17:45', 'seg-08:30', 'seg-18:00', 'sab-10:00', 'seg-9:00']) {
      const res = await postEnviar(
        json({ formulario: 'participar', nome: 'Ana', email: 'a@b.com', disponibilidade: ['seg-09:00', invalido] }),
      );
      expect(res.status).toBe(400);
    }
    expect(fetchMock).not.toHaveBeenCalled();
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
    const res = await postEnviar(
      json({ formulario: 'participar', nome: 'Ana', email: 'a@b.com', disponibilidade: ['sex-17:30'] }),
    );
    expect(res.status).toBe(502);
  });

  const valido = {
    formulario: 'participar',
    nome: 'Ana',
    email: 'ana@exemplo.com',
    disponibilidade: ['seg-09:00'],
  };

  it('corpo enorme sem Content-Length (chunked) responde 413 e não envia', async () => {
    // o cabeçalho não declara tamanho: só a medição do corpo lido pega o campo extra gigante
    const extra = { ...valido, extra: 'x'.repeat(25000) };
    expect((await postEnviar(json(extra))).status).toBe(413);
    const form = new Request('https://cadeufpel.com/api/enviar', {
      method: 'POST',
      headers: cabecalhos({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      body: new URLSearchParams({ formulario: 'falar', assunto: 'a', mensagem: 'm', extra: 'x'.repeat(25000) }),
    });
    expect((await postEnviar(form)).status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Content-Length acima do limite responde 413', async () => {
    expect((await postEnviar(json(valido, { 'Content-Length': '30000' }))).status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sem Origin ou de outro site responde 403', async () => {
    const semOrigem = new Request('https://cadeufpel.com/api/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Host: 'cadeufpel.com', 'X-Forwarded-For': '10.9.0.1' },
      body: JSON.stringify(valido),
    });
    expect((await postEnviar(semOrigem)).status).toBe(403);
    expect((await postEnviar(json(valido, { Origin: 'https://evil.example' }))).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('campo acima do limite, tipo errado ou e-mail inválido responde 400', async () => {
    for (const corpo of [
      { ...valido, nome: 'a'.repeat(121) },
      { ...valido, nome: { x: 1 } },
      { ...valido, email: 'nao-e-email' },
      { formulario: 'falar', assunto: 'a', mensagem: 'm'.repeat(5001) },
    ]) {
      expect((await postEnviar(json(corpo))).status).toBe(400);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('6º envio do mesmo IP na janela responde 429 com Retry-After', async () => {
    const ip = '10.8.8.8';
    const status: number[] = [];
    let ultima!: Response;
    for (let i = 0; i < 6; i++) {
      ultima = await postEnviar(json(valido, {}, ip));
      status.push(ultima.status);
    }
    expect(status.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(ultima.status).toBe(429);
    expect(Number(ultima.headers.get('Retry-After'))).toBeGreaterThan(0);
  });
});
