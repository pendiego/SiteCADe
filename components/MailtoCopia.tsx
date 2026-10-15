'use client';

import { useEffect, useState } from 'react';

export default function MailtoCopia() {
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine) and (hover: hover)').matches) return;

    let temporizador: number | undefined;
    let limpeza: number | undefined;

    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest('a[href^="mailto:"]') as HTMLAnchorElement | null;
      if (!link) return;
      e.preventDefault();

      const email = decodeURIComponent(link.href.slice('mailto:'.length).split('?')[0]);
      let saiu = false;
      const onBlur = () => {
        saiu = true;
      };
      window.addEventListener('blur', onBlur);
      location.href = link.href;

      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(() => {
        window.removeEventListener('blur', onBlur);
        if (saiu) return;
        navigator.clipboard?.writeText(email).catch(() => undefined);
        setCopiado(email);
        window.clearTimeout(limpeza);
        limpeza = window.setTimeout(() => setCopiado(null), 2500);
      }, 400);
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      window.clearTimeout(temporizador);
      window.clearTimeout(limpeza);
    };
  }, []);

  return copiado ? (
    <div className="toast-mailto" role="status">{`${copiado} copiado`}</div>
  ) : null;
}
