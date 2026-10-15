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

// corpo JSON; se não for JSON válido, tenta application/x-www-form-urlencoded (mesmo fallback de api/enviar.js)
async function lerCorpo(request: Request): Promise<Corpo> {
  const copia = request.clone();
  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    const params = new URLSearchParams(await copia.text());
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
  const apiKey = limparEnv(process.env.RESEND_API_KEY, '');
  if (!apiKey) {
    console.error('[api/enviar] RESEND_API_KEY não configurada');
    return erro('Envio de e-mail não configurado no servidor', 500);
  }

  const body = await lerCorpo(request);
  const formulario = body.formulario;

  // honeypot: campo invisível pro usuário real, se vier preenchido é bot — finge sucesso e não envia
  if (body.empresa) {
    return Response.json({ ok: true }, { status: 200 });
  }

  let assunto: string;
  let html: string;

  if (formulario === 'participar') {
    const { nome, email, semestre, area } = body;
    if (!nome || !email) {
      return erro('Nome e e-mail são obrigatórios', 400);
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
    const { tipo, assunto: assuntoMsg, mensagem, anonimo, contato } = body;
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
