'use client';

import { useEffect, useState } from 'react';

const LIMIAR = 600;

export default function VoltarTopo() {
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    let agendado = false;
    const atualiza = () => setAtivo(window.pageYOffset > LIMIAR);
    const onScroll = () => {
      if (agendado) return;
      agendado = true;
      window.requestAnimationFrame(() => {
        agendado = false;
        atualiza();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', atualiza);
    atualiza();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', atualiza);
    };
  }, []);

  return (
    <button
      className="topo"
      type="button"
      aria-label="Voltar ao topo"
      data-od-id="voltar-ao-topo"
      data-ativo={String(ativo)}
      onClick={() => window.scrollTo(0, 0)}
    >
      <span className="m-icon" aria-hidden="true">{'\ue5d8'}</span>
    </button>
  );
}
