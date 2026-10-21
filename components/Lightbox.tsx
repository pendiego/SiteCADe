'use client';

import { useEffect, useRef, useState } from 'react';
import { miniaturaUrl } from '@/lib/drive';

export interface FotoLightbox {
  id: string;
  legenda: string;
}

interface LightboxProps {
  fotos: FotoLightbox[];
  indice: number | null;
  onFechar: () => void;
  onNavegar?: (i: number) => void;
}

export default function Lightbox({ fotos, indice, onFechar, onNavegar }: LightboxProps) {
  const aberto = indice !== null;
  const foto = indice !== null ? fotos[indice] : undefined;
  const [zoom, setZoom] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const gatilhoRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setZoom(false);
    if (foto) gatilhoRef.current = document.querySelector<HTMLElement>(`[data-drive-id="${CSS.escape(foto.id)}"]`);
  }, [indice, foto?.id]);

  useEffect(() => {
    if (!aberto) return;
    if (!gatilhoRef.current) gatilhoRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    fecharRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
      gatilhoRef.current?.focus();
      gatilhoRef.current = null;
    };
  }, [aberto]);

  useEffect(() => {
    if (indice === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onFechar();
        return;
      }
      if (!onNavegar) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const proximo = indice + (e.key === 'ArrowRight' ? 1 : -1);
        if (proximo >= 0 && proximo < fotos.length) onNavegar(proximo);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [indice, fotos.length, onFechar, onNavegar]);

  return (
    <div
      className="modal modal--lightbox"
      id="modal-galeria"
      data-od-id="modal-galeria"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-legenda"
      hidden={!aberto}
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <button
        ref={fecharRef}
        className="modal-fechar"
        id="modal-galeria-fechar"
        type="button"
        aria-label="Fechar"
        data-od-id={onNavegar ? 'galeria-fechar' : undefined}
        onClick={onFechar}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        </svg>
      </button>
      <div ref={viewportRef} className={zoom ? 'lightbox-viewport zoom' : 'lightbox-viewport'} id="lightbox-viewport">
        <div
          className="lightbox-img"
          id="lightbox-img"
          onClick={() => {
            setZoom((z) => !z);
            if (viewportRef.current) {
              viewportRef.current.scrollTop = 0;
              viewportRef.current.scrollLeft = 0;
            }
          }}
        >
          {aberto && foto && <img src={miniaturaUrl(foto.id, 2400)} alt={foto.legenda} />}
        </div>
      </div>
      <p className="lightbox-legenda" id="lightbox-legenda">
        {foto?.legenda ?? ''}
      </p>
    </div>
  );
}
