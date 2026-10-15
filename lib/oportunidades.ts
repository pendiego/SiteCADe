import type { Oportunidade, OportunidadePublica } from '@/lib/tipos';

const LIMITE_ITENS = 12;

export function slug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Aceita "AAAA-MM-DD", "AAAA-MM-DD…" (ignora a hora) e "DD/MM/AAAA".
export function dataChave(valor: string): string | null {
  const v = String(valor ?? '').trim();
  let ano: number, mes: number, dia: number;
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (m) {
    ano = +m[1];
    mes = +m[2];
    dia = +m[3];
  } else {
    m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
    if (!m) return null;
    dia = +m[1];
    mes = +m[2];
    ano = +m[3];
  }
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return null;
  return `${String(ano).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

export function hojeEmSaoPaulo(agora: Date = new Date()): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(agora);
  const ano = partes.find((p) => p.type === 'year')?.value ?? '';
  const mes = partes.find((p) => p.type === 'month')?.value ?? '';
  const dia = partes.find((p) => p.type === 'day')?.value ?? '';
  return `${ano}-${mes}-${dia}`;
}

export function oportunidadesPublicadas(
  itens: Oportunidade[],
  hoje: Date | string,
  instagramUrl: string,
): OportunidadePublica[] {
  const dia = typeof hoje === 'string' ? (dataChave(hoje) ?? hojeEmSaoPaulo()) : hojeEmSaoPaulo(hoje);
  const usados = new Set<string>();
  const saida: OportunidadePublica[] = [];

  for (const item of itens) {
    if (!item.publicado) continue;

    const titulo = String(item.titulo ?? '').trim().slice(0, 140);
    if (!titulo) continue;

    const expira = dataChave(item.expira ?? '');
    if (expira && expira < dia) continue;

    const corMinuscula = String(item.cor ?? '').trim().toLowerCase();
    const cor = corMinuscula === 'amarelo' || corMinuscula === 'ciano' ? corMinuscula : 'verde';

    const tag = String(item.tag ?? '').trim().toUpperCase().slice(0, 24) || 'OPORTUNIDADE';
    const resumo = String(item.resumo ?? '').trim();
    const texto = String(item.texto ?? '').trim().slice(0, 1200) || resumo;
    const cta = String(item.cta ?? '').trim() || 'Quero essa oportunidade';
    const linkBruto = String(item.link ?? '').trim();
    const link = /^https?:\/\//i.test(linkBruto) || /^mailto:/i.test(linkBruto) ? linkBruto : instagramUrl;

    const base = slug(titulo) || 'oportunidade';
    let id = base;
    for (let n = 2; usados.has(id); n++) id = `${base}-${n}`;
    usados.add(id);

    saida.push({ id, tag, cor: cor as OportunidadePublica['cor'], titulo, resumo, texto, cta, link });
    if (saida.length === LIMITE_ITENS) break;
  }

  return saida;
}
