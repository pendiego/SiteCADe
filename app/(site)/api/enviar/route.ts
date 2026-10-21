import { descreverDisponibilidade, normalizarDisponibilidade } from '@/lib/disponibilidade';

const PADRAO_PARA = 'cadesignufpel@gmail.com';
const PADRAO_DE = 'CADe UFPel <naoresponda@cadeufpel.com>';

// remove aspas/espaço que sobram ao colar valores no painel da Vercel (erro comum)
function limparEnv(valor: string | undefined, padrao: string): string {
  return String(valor || padrao)
    .trim()
    .replace(/^["']|["']$/g, '');
}

const RE_FROM = /^([^<>]+<)?[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+>?$/;
// aceita variável só se estiver no formato email@x.com ou Nome <email@x.com>; senão usa o padrão
function limparFrom(valor: string | undefined): string {
  const v = limparEnv(valor, PADRAO_DE);
  return RE_FROM.test(v) ? v : PADRAO_DE;
}

// e-mail puro ASCII (Resend rejeita "to" com caracteres não-ASCII, ex: aspas curvas coladas do painel da Vercel)
const RE_TO = /^[\x21-\x7E]+@[\x21-\x7E]+\.[\x21-\x7E]+$/;
function limparTo(valor: string | undefined): string {
  const v = limparEnv(valor, PADRAO_PARA);
  return RE_TO.test(v) ? v : PADRAO_PARA;
}

function escapeHtml(valor: unknown): string {
  return String(valor || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function campo(rotulo: string, valor: unknown): string {
  if (valor == null || valor === '') return '';
  return `<p><b>${escapeHtml(rotulo)}:</b> ${escapeHtml(valor).replace(/\n/g, '<br>')}</p>`;
}

type Corpo = Record<string, unknown>;

// --- Limites de entrada ---
const MAX_CORPO = 20000; // caracteres do corpo, medidos depois de lido: Content-Length pode faltar (POST chunked)
const RE_EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

// string aparada; '' se ausente; null se o tipo for inválido ou passar do limite
function texto(valor: unknown, max: number): string | null {
  if (valor == null || valor === '') return '';
  if (typeof valor === 'number') valor = String(valor);
  if (typeof valor !== 'string') return null;
  const t = valor.trim();
  return t.length > max ? null : t;
}

// --- Limite de taxa por IP, em memória ---
// Best-effort: cada instância serverless da Vercel tem o próprio contador, então isto freia abuso
// simples, não um ataque distribuído (para isso, regra de rate limit no Firewall da Vercel).
const JANELA_MS = 10 * 60 * 1000;
const MAX_ENVIOS = 5;
const acessos = new Map<string, { inicio: number; n: number }>();

// 0 = liberado; >0 = segundos até poder tentar de novo
function esperaSegundos(ip: string): number {
  const agora = Date.now();
  if (acessos.size > 5000) acessos.clear();
  for (const [chave, reg] of acessos) if (agora - reg.inicio > JANELA_MS) acessos.delete(chave);
  const reg = acessos.get(ip);
  if (!reg) {
    acessos.set(ip, { inicio: agora, n: 1 });
    return 0;
  }
  if (reg.n >= MAX_ENVIOS) return Math.ceil((reg.inicio + JANELA_MS - agora) / 1000);
  reg.n++;
  return 0;
}

function ipDe(request: Request): string {
  const xff = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  return xff || request.headers.get('x-real-ip') || 'desconhecido';
}

// só aceita POST vindo de páginas do próprio site (Origin ou Referer com o mesmo host)
function mesmaOrigem(request: Request): boolean {
  const origem = request.headers.get('origin') || request.headers.get('referer');
  if (!origem) return false;
  try {
    return new URL(origem).host === (request.headers.get('host') || new URL(request.url).host);
  } catch {
    return false;
  }
}

// corpo JSON; se não for JSON válido, tenta application/x-www-form-urlencoded (mesmo fallback de api/enviar.js).
// Devolve null se o corpo lido passar de MAX_CORPO.
async function lerCorpo(request: Request): Promise<Corpo | null> {
  const bruto = await request.text();
  if (bruto.length > MAX_CORPO) return null;
  let corpo: unknown;
  try {
    corpo = JSON.parse(bruto);
  } catch {
    const params = new URLSearchParams(bruto);
    // o envio sem JavaScript repete `disponibilidade` por horário marcado; fromEntries guardaria só o último
    corpo = { ...Object.fromEntries(params), disponibilidade: params.getAll('disponibilidade') };
  }
  return corpo && typeof corpo === 'object' ? (corpo as Corpo) : {};
}

const erro = (mensagem: string, status: number) => Response.json({ ok: false, erro: mensagem }, { status });

const TIPOS_FALAR: Record<string, string> = {
  reclamacao: 'Reclamação',
  sugestao: 'Sugestão',
  elogio: 'Elogio',
  oportunidade: 'Oportunidade',
};

export function GET() {
  return erro('Método não permitido', 405);
}

export async function POST(request: Request): Promise<Response> {
  if (!mesmaOrigem(request)) return erro('Origem não permitida', 403);
  if (Number(request.headers.get('content-length') || 0) > MAX_CORPO) return erro('Mensagem grande demais', 413);
  const espera = esperaSegundos(ipDe(request));
  if (espera > 0) {
    return Response.json(
      { ok: false, erro: 'Muitos envios. Tente de novo em alguns minutos.' },
      { status: 429, headers: { 'Retry-After': String(espera) } },
    );
  }

  const apiKey = limparEnv(process.env.RESEND_API_KEY, '');
  if (!apiKey) {
    console.error('[api/enviar] RESEND_API_KEY não configurada');
    return erro('Envio de e-mail não configurado no servidor', 500);
  }

  const body = await lerCorpo(request);
  if (!body) return erro('Mensagem grande demais', 413);
  const formulario = body.formulario;

  // honeypot: campo invisível pro usuário real, se vier preenchido é bot — finge sucesso e não envia
  if (body.empresa) {
    return Response.json({ ok: true }, { status: 200 });
  }

  let assunto: string;
  let html: string;

  if (formulario === 'participar') {
    const nome = texto(body.nome, 120);
    const email = texto(body.email, 254);
    const semestre = texto(body.semestre, 40);
    const area = texto(body.area, 200);
    if (nome === null || email === null || semestre === null || area === null) {
      return erro('Algum campo está longo demais ou inválido', 400);
    }
    if (!nome || !email) {
      return erro('Nome e e-mail são obrigatórios', 400);
    }
    if (!RE_EMAIL.test(email)) {
      return erro('E-mail inválido', 400);
    }
    const disponibilidade = normalizarDisponibilidade(body.disponibilidade);
    if (!disponibilidade) {
      return erro('Informe ao menos um horário de disponibilidade', 400);
    }
    assunto = `[CADe] Quero participar — ${String(nome)}`;
    html = [
      '<h2>Novo interesse em participar do CADe</h2>',
      campo('Nome', nome),
      campo('E-mail', email),
      campo('Semestre', semestre),
      campo('Onde quer ajudar', area),
      campo('Disponibilidade para reunião', descreverDisponibilidade(disponibilidade)),
    ].join('');
  } else if (formulario === 'falar') {
    const tipo = texto(body.tipo, 30);
    const assuntoMsg = texto(body.assunto, 150);
    const mensagem = texto(body.mensagem, 5000);
    const contato = texto(body.contato, 200);
    const anonimo = body.anonimo;
    if (tipo === null || assuntoMsg === null || mensagem === null || contato === null) {
      return erro('Algum campo está longo demais ou inválido', 400);
    }
    if (!assuntoMsg || !mensagem) {
      return erro('Assunto e mensagem são obrigatórios', 400);
    }
    const tipoRotulo =
      (typeof tipo === 'string' && Object.hasOwn(TIPOS_FALAR, tipo) ? TIPOS_FALAR[tipo] : undefined) ||
      (tipo ? String(tipo) : 'Não informado');
    assunto = `[CADe] ${tipoRotulo} — ${String(assuntoMsg)}`;
    const eAnonimo = anonimo === true || anonimo === 'true' || anonimo === 'on' || anonimo === '1';
    html = [
      '<h2>Nova mensagem pelo site do CADe</h2>',
      campo('Tipo', tipoRotulo),
      campo('Assunto', assuntoMsg),
      campo('Mensagem', mensagem),
      eAnonimo
        ? '<p><b>Envio anônimo</b> — sem nome nem contato.</p>'
        : campo('Contato', contato || 'não informado'),
    ].join('');
  } else {
    return erro('Formulário desconhecido', 400);
  }
  assunto = assunto.replace(/[\r\n]+/g, ' ').trim();

  let resp: Response;
  try {
    resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: limparFrom(process.env.RESEND_FROM),
        to: [limparTo(process.env.RESEND_TO)],
        subject: assunto,
        html,
      }),
    });
  } catch (err) {
    console.error('[api/enviar] erro de rede', err);
    return erro('Falha ao enviar o e-mail', 502);
  }

  if (!resp.ok) {
    const detalhe = await resp.text();
    console.error('[api/enviar] Resend respondeu', resp.status, detalhe);
    return erro('Falha ao enviar o e-mail', 502);
  }

  return Response.json({ ok: true }, { status: 200 });
}
