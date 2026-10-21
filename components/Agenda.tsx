'use client';

import { useEffect, useRef, useState } from 'react';
import { GOOGLE_API_KEY } from '@/lib/google';
import type { InicioAgenda } from '@/lib/tipos';

interface Props {
  textos: InicioAgenda;
  calendarId: string;
  assinarUrl: string;
}

type Mensagens = InicioAgenda['mensagens'];

interface Evento {
  ano: number;
  mes: number;
  dia: number;
  cor: string;
  ms: string;
  dow: string;
  data: string;
  titulo: string;
  desc: string;
}

interface ItemCalendario {
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: { date?: string; dateTime?: string };
}

interface Mes {
  ano: number;
  mes: number;
}

type Pressionado = { tipo: 'evento'; idx: number } | { tipo: 'dia'; dia: number } | null;

const ROTULOS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const CORES = ['amarelo', 'ciano', 'azul'];
const NOMES_MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const ABREV_MES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const NOMES_DIA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const ABREV_DIA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const CHAVE_EVENTO = 'cade:evento';

function diaLocal(str: string): Date {
  // "2026-09-12" (dia inteiro) ou "2026-09-12T19:00:00-03:00" — sempre lido em hora local.
  const [ano, mes, dia] = str.slice(0, 10).split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

function construirEventos(items: ItemCalendario[], m: Mensagens): Evento[] {
  return items.map((item) => {
    const inicio = (item.start?.date || item.start?.dateTime) as string;
    const d = diaLocal(inicio);
    const absMes = d.getFullYear() * 12 + d.getMonth();
    return {
      ano: d.getFullYear(),
      mes: d.getMonth(),
      dia: d.getDate(),
      cor: CORES[absMes % CORES.length],
      ms: ABREV_MES[d.getMonth()],
      dow: ABREV_DIA[d.getDay()],
      data: `${NOMES_DIA[d.getDay()]}, ${d.getDate()} de ${NOMES_MES[d.getMonth()]}`,
      titulo: item.summary || m.semTitulo,
      desc: [item.description, item.location].filter(Boolean).join(' · ') || m.semDescricao,
    };
  });
}

function buscarItens(calendarId: string, sinal: AbortSignal): Promise<ItemCalendario[]> {
  const agora = new Date().toISOString();
  const url =
    'https://www.googleapis.com/calendar/v3/calendars/' +
    encodeURIComponent(calendarId) + '/events' +
    '?key=' + encodeURIComponent(GOOGLE_API_KEY) +
    '&singleEvents=true&orderBy=startTime&maxResults=20&timeMin=' + encodeURIComponent(agora);
  return fetch(url, { signal: sinal })
    .then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then((json) => {
      if (!Array.isArray(json.items)) throw new Error('Resposta inválida');
      return (json.items as ItemCalendario[]).filter(
        (it) => it.status !== 'cancelled' && it.start && (it.start.date || it.start.dateTime),
      );
    });
}

function gravarSelecao(idx: number | null) {
  try {
    if (idx === null) localStorage.removeItem(CHAVE_EVENTO);
    else localStorage.setItem(CHAVE_EVENTO, String(idx));
  } catch {
    /* armazenamento indisponível: seleção só vale nesta visita */
  }
}

export default function Agenda({ textos, calendarId, assinarUrl }: Props) {
  const m = textos.mensagens;

  const [status, setStatus] = useState<'carregando' | 'pronto' | 'indisponivel'>('carregando');
  const [busy, setBusy] = useState<boolean>();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [visto, setVisto] = useState<Mes | null>(null);
  const [hoje, setHoje] = useState<{ ano: number; mes: number; dia: number } | null>(null);
  const [sel, setSel] = useState(0);
  const [pressionado, setPressionado] = useState<Pressionado>(null);
  const [detalhe, setDetalhe] = useState({ data: '', titulo: textos.carregando, desc: '' });
  const [attrs, setAttrs] = useState<{ titulo?: string; desc?: string }>({});
  const x0 = useRef<number | null>(null);

  // Mantém a lógica de seleção num closure que recebe a lista explicitamente,
  // pois no carregamento a lista ainda não está no estado do render atual.
  function selecionarEm(lista: Evento[], idx: number) {
    const ev = lista[idx];
    if (!ev) {
      setDetalhe({ data: m.semEventosData, titulo: m.semEventosTitulo, desc: m.semEventosDesc });
      setPressionado(null);
      gravarSelecao(null);
      return;
    }
    setDetalhe({ data: ev.data, titulo: ev.titulo, desc: ev.desc });
    setAttrs({ titulo: ev.titulo, desc: ev.desc });
    setSel(idx);
    setVisto((v) => (v && v.ano === ev.ano && v.mes === ev.mes ? v : { ano: ev.ano, mes: ev.mes }));
    setPressionado({ tipo: 'evento', idx });
    gravarSelecao(idx);
  }

  function selecionarDia(d: number) {
    if (!visto) return;
    const idx = eventos.findIndex((e) => e.ano === visto.ano && e.mes === visto.mes && e.dia === d);
    if (idx > -1) {
      selecionarEm(eventos, idx);
      return;
    }
    const data = new Date(visto.ano, visto.mes, d);
    setDetalhe({
      data: `${NOMES_DIA[data.getDay()]}, ${d} de ${NOMES_MES[visto.mes]}`,
      titulo: m.diaSemEventoTitulo,
      desc: m.diaSemEventoDesc,
    });
    setPressionado({ tipo: 'dia', dia: d });
    gravarSelecao(null);
  }

  function mudarMes(delta: number) {
    setVisto((v) => {
      if (!v) return v;
      let ano = v.ano;
      let mes = v.mes + delta;
      if (mes < 0) { mes = 11; ano--; }
      if (mes > 11) { mes = 0; ano++; }
      return { ano, mes };
    });
    setPressionado(null);
  }

  useEffect(() => {
    const agora = new Date();
    setVisto({ ano: agora.getFullYear(), mes: agora.getMonth() });
    setHoje({ ano: agora.getFullYear(), mes: agora.getMonth(), dia: agora.getDate() });
    setBusy(true);

    let ativo = true;
    const controle = new AbortController();
    const limite = setTimeout(() => controle.abort(new Error('Tempo de espera esgotado')), 8000);

    buscarItens(calendarId, controle.signal)
      .then((itens) => {
        if (!ativo) return;
        const lista = construirEventos(itens, m);
        setEventos(lista);
        setStatus('pronto');
        let salvo = 0;
        try { salvo = Number(localStorage.getItem(CHAVE_EVENTO)) || 0; } catch { /* sem armazenamento */ }
        selecionarEm(lista, lista.length ? (lista[salvo] ? salvo : 0) : -1);
      })
      .catch(() => {
        if (!ativo) return;
        setStatus('indisponivel');
        setDetalhe((d) => ({ ...d, titulo: m.indisponivelTitulo, desc: m.indisponivelDesc }));
      })
      .finally(() => {
        clearTimeout(limite);
        if (ativo) setBusy(false);
      });

    return () => {
      ativo = false;
      clearTimeout(limite);
      controle.abort();
    };
    // selecionarEm e m derivam de textos; a busca roda uma vez por calendário.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarId, textos]);

  const pronto = status === 'pronto';

  function renderCalendario() {
    if (!visto) return null;
    const inicioSemana = new Date(visto.ano, visto.mes, 1).getDay();
    const dias = new Date(visto.ano, visto.mes + 1, 0).getDate();
    const vazios = Array.from({ length: inicioSemana }, (_, i) => i);
    const numeros = Array.from({ length: dias }, (_, i) => i + 1);

    return (
      <div className="mes" data-od-id="mes-calendario" aria-label="Calendário">
        <div className="mes-cab">
          <button type="button" className="mes-nav" aria-label="Mês anterior" data-od-id="agenda-mes-anterior" onClick={() => mudarMes(-1)}>‹</button>
          <p className="mes-nome">{`${NOMES_MES[visto.mes].toUpperCase()} ${visto.ano}`}</p>
          <button type="button" className="mes-nav" aria-label="Próximo mês" data-od-id="agenda-mes-proximo" onClick={() => mudarMes(1)}>›</button>
        </div>
        <div className="semana">
          {ROTULOS.map((r, i) => (
            <span key={i} className="rotulo" aria-hidden="true">{r}</span>
          ))}
        </div>
        <div className="semana">
          {vazios.map((i) => (
            <span key={`v${i}`} className="dia dia--vazio" />
          ))}
          {numeros.map((d) => {
            const idx = eventos.findIndex((e) => e.ano === visto.ano && e.mes === visto.mes && e.dia === d);
            const ev = idx > -1 ? eventos[idx] : null;
            const ehHoje = !!hoje && hoje.ano === visto.ano && hoje.mes === visto.mes && hoje.dia === d;
            const classes = ['dia', ev ? `dia--${ev.cor}` : '', ehHoje ? 'dia--hoje' : ''].filter(Boolean).join(' ');
            const pressed = ev
              ? pressionado?.tipo === 'evento' && pressionado.idx === idx
              : pressionado?.tipo === 'dia' && pressionado.dia === d;
            return (
              <button
                key={d}
                type="button"
                className={classes}
                disabled={!pronto}
                data-od-id={`agenda-dia-${visto.ano}-${visto.mes + 1}-${d}`}
                data-dia={d}
                data-evento={ev ? idx : undefined}
                aria-pressed={pressed}
                aria-label={ev ? `${d} — ${ev.titulo}` : String(d)}
                onClick={() => selecionarDia(d)}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderCartao(i: number) {
    const e = eventos[i];
    return (
      <button
        type="button"
        className="evt"
        data-od-id={`evento-${i}`}
        data-evento={i}
        title={`${e.titulo} — ${e.desc}`}
        onClick={() => selecionarEm(eventos, i)}
      >
        <span className={`evt-data evt-data--${e.cor}`}>
          <span className="evt-dia">{e.dia}</span>
          <span className="evt-ms">{e.ms}</span>
          <span className="evt-dow">{e.dow}</span>
        </span>
        <span className="evt-info">
          <span className="evt-titulo">{e.titulo}</span>
          <span className="evt-desc">{e.desc}</span>
        </span>
        <span className="evt-seta m-icon" aria-hidden="true">{'\ue5c8'}</span>
      </button>
    );
  }

  return (
    <section className="sec wrap" id="agenda" data-od-id="agenda" aria-busy={busy}>
      <div className="agenda-head">
        <div className="sec-head">
          <p className="eyebrow">{textos.eyebrow}</p>
          <h2 className="h-sec">{textos.titulo}</h2>
        </div>
        <a className="btn btn--primary" href={assinarUrl} target="_blank" rel="noopener" data-od-id="agenda-cta">
          <span className="m-icon" aria-hidden="true">{'\uebcc'}</span>
          {' '}
          {textos.ctaRotulo}
        </a>
      </div>

      <div className="agenda-corpo">
        <div className="calendario" id="calendario" data-od-id="agenda-calendario">
          {renderCalendario()}
        </div>

        <div className="painel">
          <div className="detalhe" data-od-id="agenda-detalhe" aria-live="polite">
            <p className="detalhe-rot">{textos.rotuloDetalhe}</p>
            <p className="detalhe-data" id="detalhe-data">{detalhe.data}</p>
            <p className="detalhe-titulo" id="detalhe-titulo" title={attrs.titulo}>{detalhe.titulo}</p>
            <p className="detalhe-desc" id="detalhe-desc" title={attrs.desc}>{detalhe.desc}</p>
          </div>
          <div
            className="eventos"
            id="eventos"
            data-od-id="agenda-eventos"
            onTouchStart={(e) => { x0.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (x0.current === null) return;
              const dx = e.changedTouches[0].clientX - x0.current;
              x0.current = null;
              if (Math.abs(dx) < 48) return;
              const alvo = sel + (dx < 0 ? 1 : -1);
              if (eventos[alvo]) selecionarEm(eventos, alvo);
            }}
          >
            {pronto && (eventos.length === 0 ? (
              <p className="detalhe-desc">{m.nenhumFuturo}</p>
            ) : (
              <>
                <div className="evt-mes-head">
                  <span>{eventos[sel + 1] ? m.proximoEvento : m.ultimoEvento}</span>
                  <div className="regua"></div>
                  <button
                    type="button"
                    className="mes-nav"
                    aria-label="Evento anterior"
                    data-od-id="agenda-evento-anterior"
                    disabled={sel <= 0}
                    onClick={() => selecionarEm(eventos, sel - 1)}
                  >‹</button>
                  <button
                    type="button"
                    className="mes-nav"
                    aria-label="Próximo evento"
                    data-od-id="agenda-evento-proximo"
                    disabled={sel >= eventos.length - 1}
                    onClick={() => selecionarEm(eventos, sel + 1)}
                  >›</button>
                </div>
                {eventos[sel + 1] && renderCartao(sel + 1)}
              </>
            ))}
          </div>
        </div>
      </div>
      <noscript><p className="form-nota">{textos.noscript}</p></noscript>
    </section>
  );
}
