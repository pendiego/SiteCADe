'use client';

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { resolverHref } from '@/lib/links';
import type { Navegacao } from '@/lib/tipos';

const ICONE_MENU = '\ue5d2';
const ICONE_FECHAR = '\ue5cd';
const ICONE_SETA = '\ue5c8';
const FOLGA = 0.35;

interface NavProps {
  navegacao: Navegacao;
  naHome: boolean;
}

function rolaPara(id: string) {
  let y = 0;
  if (id !== 'topo') {
    const alvo = document.getElementById(id);
    if (!alvo) return;
    y = alvo.getBoundingClientRect().top + window.pageYOffset;
    y -= parseFloat(getComputedStyle(alvo).scrollMarginTop) || 0;
  }
  window.scrollTo(0, Math.max(0, y));
}

export default function Nav({ navegacao, naHome }: NavProps) {
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        setAberto(false);
        botaoRef.current?.focus();
      }
    };
    const onClick = (e: Event) => {
      if (!headerRef.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [aberto]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width:721px)');
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setAberto(false);
    };
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!naHome) return;
    const areas = navegacao.links.map((l) => document.getElementById(l.href.slice(1)));
    if (!areas.every((el): el is HTMLElement => el !== null)) return;

    let agendada = false;
    const ativa = () => {
      const linha = (headerRef.current?.offsetHeight ?? 0) + window.innerHeight * FOLGA;
      let i = 0;
      areas.forEach((el, n) => {
        if (el.getBoundingClientRect().top <= linha) i = n;
      });
      setAtivo(i);
    };
    const onScroll = () => {
      if (agendada) return;
      agendada = true;
      window.requestAnimationFrame(() => {
        agendada = false;
        ativa();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', ativa);
    ativa();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', ativa);
    };
  }, [naHome, navegacao]);

  useEffect(() => {
    if (!naHome) return;
    const onClick = (e: Event) => {
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
      if (!link) return;
      const id = (link.getAttribute('href') ?? '').slice(1);
      if (!id) return;
      e.preventDefault();
      flushSync(() => setAberto(false));
      rolaPara(id);
    };
    document.addEventListener('click', onClick);

    if (window.location.hash) {
      const idInicial = window.location.hash.slice(1);
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      document.fonts.ready.then(() => rolaPara(idInicial));
    }
    return () => document.removeEventListener('click', onClick);
  }, [naHome]);

  const fechaPorLink = (e: ReactMouseEvent<HTMLElement>) => {
    if (!(e.target as Element).closest('a') || !aberto) return;
    setAberto(false);
    botaoRef.current?.focus();
  };

  return (
    <header className="nav" data-od-id="nav" ref={headerRef}>
      <div className="wrap nav-inner">
        <a className="nav-marca" href={naHome ? '#topo' : '/'} aria-label="CADe UFPel — início" data-od-id="nav-marca">
          <img src="/assets/logo-cade.svg" alt="CADe UFPel" width={75} height={36} />
        </a>

        <button
          ref={botaoRef}
          className="btn btn--ghost nav-toggle"
          type="button"
          aria-expanded={aberto}
          aria-controls="nav-links"
          aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
          data-od-id="nav-toggle"
          onClick={() => setAberto((a) => !a)}
        >
          <span className="m-icon nav-toggle-icone" aria-hidden="true">
            {aberto ? ICONE_FECHAR : ICONE_MENU}
          </span>
        </button>

        <nav
          className="nav-links"
          id="nav-links"
          aria-label="Seções do site"
          data-od-id="nav-links"
          data-aberto={String(aberto)}
          onClickCapture={fechaPorLink}
        >
          {navegacao.links.map((link, i) => (
            <a
              key={link.href}
              className="nav-link"
              href={resolverHref(link.href, naHome)}
              aria-current={naHome && i === ativo ? 'page' : undefined}
            >
              {link.rotulo}
            </a>
          ))}
          <a className="btn btn--primary nav-cta-painel" href={resolverHref(navegacao.cta.href, naHome)} data-od-id="nav-cta-painel">
            {navegacao.cta.rotulo}{' '}
            <span className="m-icon m-icon--16" aria-hidden="true">{ICONE_SETA}</span>
          </a>
        </nav>

        <a className="btn btn--primary btn--sm nav-cta" href={resolverHref(navegacao.cta.href, naHome)} data-od-id="nav-cta">
          {navegacao.cta.rotulo}{' '}
          <span className="m-icon m-icon--16" aria-hidden="true">{ICONE_SETA}</span>
        </a>
      </div>
    </header>
  );
}
