'use client';

import { useEffect, useRef, useState } from 'react';
import type { HeroSlide } from '@/lib/tipos';

const TROCA = 5000;

interface HeroProps {
  slides: HeroSlide[];
}

interface Controle {
  manual: (i: number) => void;
  anterior: () => void;
  proxima: () => void;
}

export default function Hero({ slides }: HeroProps) {
  const palcoRef = useRef<HTMLDivElement>(null);
  const trilhoRef = useRef<HTMLDivElement>(null);
  const controleRef = useRef<Controle | null>(null);
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    const palco = palcoRef.current;
    const trilho = trilhoRef.current;
    if (!palco || !trilho) return;
    const itens = Array.from(trilho.querySelectorAll<HTMLElement>('.hero-slide'));
    if (itens.length < 2) return;
    const n = itens.length;

    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)');
    let atualI = 0;
    let desligado = reduz.matches;
    const pausas = { ponteiro: false, foco: false, aba: false, fora: false };
    const pausado = () => pausas.ponteiro || pausas.foco || pausas.aba || pausas.fora;

    const ir = (i: number, suave: boolean) => {
      const alvo = ((i % n) + n) % n;
      const salta = Math.abs(alvo - atualI) > 1;
      atualI = alvo;
      trilho.scrollTo({
        left: trilho.clientWidth * atualI,
        behavior: suave && !salta && !reduz.matches ? 'smooth' : 'auto',
      });
      setAtual(atualI);
    };

    controleRef.current = {
      manual: (i) => {
        desligado = true;
        ir(i, true);
      },
      anterior: () => {
        desligado = true;
        ir(atualI - 1, true);
      },
      proxima: () => {
        desligado = true;
        ir(atualI + 1, true);
      },
    };

    let agendado = false;
    const onScroll = () => {
      if (agendado) return;
      agendado = true;
      window.requestAnimationFrame(() => {
        agendado = false;
        const i = Math.round(trilho.scrollLeft / trilho.clientWidth);
        if (i !== atualI && itens[i]) {
          atualI = i;
          setAtual(i);
        }
      });
    };
    const onPointerDown = () => {
      desligado = true;
    };
    const onResize = () => ir(atualI, false);
    const onPonteiroEntra = () => {
      pausas.ponteiro = true;
    };
    const onPonteiroSai = () => {
      pausas.ponteiro = false;
    };
    const onFocoEntra = () => {
      pausas.foco = true;
    };
    const onFocoSai = () => {
      pausas.foco = false;
    };
    const onVisibilidade = () => {
      pausas.aba = document.hidden;
    };
    const onReduz = (e: MediaQueryListEvent) => {
      if (e.matches) desligado = true;
    };

    trilho.addEventListener('scroll', onScroll, { passive: true });
    trilho.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', onResize);
    palco.addEventListener('mouseenter', onPonteiroEntra);
    palco.addEventListener('mouseleave', onPonteiroSai);
    palco.addEventListener('focusin', onFocoEntra);
    palco.addEventListener('focusout', onFocoSai);
    document.addEventListener('visibilitychange', onVisibilidade);
    reduz.addEventListener('change', onReduz);

    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            pausas.fora = !e.isIntersecting;
          });
        },
        { threshold: 0 },
      );
      observer.observe(palco);
    }

    const timer = window.setInterval(() => {
      if (desligado || pausado()) return;
      ir(atualI + 1, true);
    }, TROCA);

    ir(0, false);

    return () => {
      window.clearInterval(timer);
      observer?.disconnect();
      trilho.removeEventListener('scroll', onScroll);
      trilho.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onResize);
      palco.removeEventListener('mouseenter', onPonteiroEntra);
      palco.removeEventListener('mouseleave', onPonteiroSai);
      palco.removeEventListener('focusin', onFocoEntra);
      palco.removeEventListener('focusout', onFocoSai);
      document.removeEventListener('visibilitychange', onVisibilidade);
      reduz.removeEventListener('change', onReduz);
      controleRef.current = null;
    };
  }, [slides.length]);

  return (
    <section className="hero sobre-navy" data-od-id="hero">
      <div className="wrap hero-palco" data-od-id="hero-palco" ref={palcoRef}>
        <button
          className="hero-seta hero-seta--prev"
          type="button"
          aria-label="Banner anterior"
          data-od-id="hero-anterior"
          onClick={() => controleRef.current?.anterior()}
        >
          <span className="m-icon" aria-hidden="true">{'\ue5cb'}</span>
        </button>

        <div
          className="hero-slides"
          id="hero-slides"
          role="group"
          aria-label="Banners do CADe"
          data-od-id="hero-slides"
          ref={trilhoRef}
        >
          {slides.map((s, i) => {
            const principal = i === 0;
            const sufixo = principal ? '' : `-${s.id}`;
            const Titulo = principal ? 'h1' : 'p';
            return (
              <article key={s.id} className={`hero-slide hero-slide--${s.acento}`} data-od-id={`hero-slide-${s.id}`}>
                <div className="hero-grid">
                  <div className="hero-txt">
                    <div className="hero-topo">
                      <p className="eyebrow">{s.eyebrow}</p>
                      <Titulo className={principal ? undefined : 'hero-titulo'} data-od-id={`hero-titulo${sufixo}`}>
                        {s.titulo}
                      </Titulo>
                    </div>
                    <p className="hero-desc" data-od-id={`hero-subtitulo${sufixo}`}>
                      {s.subtitulo}
                    </p>
                    <a className="btn btn--primary" href={s.ctaHref} data-od-id={`hero-cta${sufixo}`}>
                      {s.ctaRotulo}{' '}
                      <span className="m-icon" aria-hidden="true">{'\ue5c8'}</span>
                    </a>
                  </div>
                  <img className="hero-mascote" src={s.mascote} alt={s.mascoteAlt} width={s.mascoteLargura} height={s.mascoteAltura} />
                </div>
              </article>
            );
          })}
        </div>

        <button
          className="hero-seta hero-seta--next"
          type="button"
          aria-label="Próximo banner"
          data-od-id="hero-proxima"
          onClick={() => controleRef.current?.proxima()}
        >
          <span className="m-icon" aria-hidden="true">{'\ue5cc'}</span>
        </button>

        <div className="hero-pontos" data-od-id="hero-pontos">
          {slides.map((_, i) => (
            <button
              key={i}
              className="hero-ponto"
              type="button"
              aria-label={`Ir para o banner ${i + 1}`}
              aria-current={i === atual ? 'true' : undefined}
              data-od-id={`hero-ponto-${i + 1}`}
              onClick={() => controleRef.current?.manual(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
