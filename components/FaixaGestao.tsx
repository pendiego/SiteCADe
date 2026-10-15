'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import type { Membro } from '@/lib/tipos';

interface Props {
  membros: Membro[];
}

export default function FaixaGestao({ membros }: Props) {
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const scroller = track?.parentElement;
    if (!track || !scroller) return;

    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)');
    let parado = false;
    let desligado = reduz.matches;

    const aplica = () => {
      track.style.animationPlayState = !desligado && !parado ? 'running' : 'paused';
    };

    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            (entries) => {
              for (const e of entries) {
                parado = !e.isIntersecting;
              }
              aplica();
            },
            { threshold: 0 },
          )
        : null;
    observer?.observe(scroller);

    const pausa = () => {
      parado = true;
      aplica();
    };
    const retoma = () => {
      parado = false;
      aplica();
    };
    const visibilidade = () => {
      if (document.hidden) pausa();
      else retoma();
    };
    const reducao = (e: MediaQueryListEvent) => {
      desligado = e.matches;
      aplica();
    };

    track.addEventListener('focusin', pausa);
    track.addEventListener('focusout', retoma);
    document.addEventListener('visibilitychange', visibilidade);
    reduz.addEventListener('change', reducao);
    aplica();

    return () => {
      observer?.disconnect();
      track.removeEventListener('focusin', pausa);
      track.removeEventListener('focusout', retoma);
      document.removeEventListener('visibilitychange', visibilidade);
      reduz.removeEventListener('change', reducao);
    };
  }, []);

  return (
    <div className="fotos-scroll" data-od-id="gestao-fotos" role="group" aria-label="Fotos da gestão">
      <ul className="fotos-track" id="gestao-track" ref={trackRef}>
        {membros.map((m) => (
          <li className="gestao-foto" key={m.nome}>
            <Image
              src={m.foto}
              alt=""
              width={158}
              height={158}
              sizes="(max-width:720px) 124px, 158px"
              style={{ objectPosition: m.enquadramento }}
            />
            <span className="gestao-nome">{m.nome}</span>
          </li>
        ))}
        {membros.map((m) => (
          <li className="gestao-foto" key={`copia-${m.nome}`} aria-hidden="true">
            <Image
              src={m.foto}
              alt=""
              width={158}
              height={158}
              sizes="(max-width:720px) 124px, 158px"
              style={{ objectPosition: m.enquadramento }}
            />
            <span className="gestao-nome">{m.nome}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
