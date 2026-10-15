'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  id: string;
  odId?: string;
  tituloId: string;
  aberto: boolean;
  onFechar: () => void;
  children: ReactNode;
}

export default function Modal({ id, odId, tituloId, aberto, onFechar, children }: ModalProps) {
  const fecharRef = useRef<HTMLButtonElement>(null);
  const onFecharRef = useRef(onFechar);

  useEffect(() => {
    onFecharRef.current = onFechar;
  }, [onFechar]);

  useEffect(() => {
    if (!aberto) return;
    const gatilho = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    fecharRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFecharRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      gatilho?.focus();
    };
  }, [aberto]);

  return (
    <div
      className="modal"
      id={id}
      data-od-id={odId}
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
      hidden={!aberto}
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div className="modal-cartao">
        <button
          ref={fecharRef}
          className="modal-fechar"
          id={`${id}-fechar`}
          type="button"
          aria-label="Fechar popup"
          onClick={onFechar}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
