'use client';

import { useEffect, useRef, useState } from 'react';
import Modal from '@/components/Modal';
import type { InicioOportunidades, OportunidadePublica } from '@/lib/tipos';

interface Props {
  textos: InicioOportunidades;
  itens: OportunidadePublica[];
}

export default function Oportunidades({ textos, itens }: Props) {
  const listaRef = useRef<HTMLDivElement>(null);
  const [antDesab, setAntDesab] = useState(true);
  const [proxDesab, setProxDesab] = useState(true);
  const [abertaId, setAbertaId] = useState<string | null>(null);
  const op = itens.find((i) => i.id === abertaId);

  useEffect(() => {
    const lista = listaRef.current;
    if (!lista) return;

    const atualiza = () => {
      const maximo = lista.scrollWidth - lista.clientWidth;
      setAntDesab(lista.scrollLeft <= 1);
      setProxDesab(lista.scrollLeft >= maximo - 1);
    };

    lista.addEventListener('scroll', atualiza, { passive: true });
    window.addEventListener('resize', atualiza);
    atualiza();

    return () => {
      lista.removeEventListener('scroll', atualiza);
      window.removeEventListener('resize', atualiza);
    };
  }, [itens]);

  const navegar = (direcao: 1 | -1) => {
    const lista = listaRef.current;
    const card = lista?.querySelector<HTMLElement>('.op');
    if (!lista || !card) return;
    const espaco = parseFloat(getComputedStyle(lista).columnGap) || 0;
    lista.scrollLeft += direcao * (card.getBoundingClientRect().width + espaco);
  };

  return (
    <section className="sec wrap" id="oportunidades" data-od-id="oportunidades">
      <img className="mascote-canto" src="/assets/mascote-dicas.svg" alt="" width={176} height={131} />
      <div className="op-head">
        <div className="sec-head">
          <p className="eyebrow">{textos.eyebrow}</p>
          <h2 className="h-sec">{textos.titulo}</h2>
          <p className="lead">{textos.lead}</p>
        </div>
        <a className="btn btn--ghost" href={textos.ctaHref} data-od-id="oportunidades-cta">
          {textos.ctaRotulo}{' '}
          <span className="m-icon" aria-hidden="true">{'\ue145'}</span>
        </a>
      </div>

      <div className="op-carrossel" data-od-id="oportunidades-carrossel">
        <button
          className="op-seta op-seta--prev"
          type="button"
          aria-label="Oportunidades anteriores"
          aria-controls="oportunidades-lista"
          data-od-id="oportunidades-anteriores"
          disabled={antDesab}
          onClick={() => navegar(-1)}
        >
          <span className="m-icon" aria-hidden="true">{'\ue5cb'}</span>
        </button>

        <div
          className={itens.length > 0 ? 'oportunidades' : 'oportunidades oportunidades--vazio'}
          id="oportunidades-lista"
          data-od-id="oportunidades-lista"
          ref={listaRef}
        >
          {itens.length === 0 ? (
            <p className="op-vazio" id="oportunidades-status" data-od-id="oportunidades-status" role="status">{textos.vazio}</p>
          ) : (
            itens.map((item) => (
              <button
                key={item.id}
                className="op"
                type="button"
                aria-haspopup="dialog"
                data-od-id={`op-${item.id}`}
                data-op={item.id}
                onClick={() => setAbertaId(item.id)}
              >
                <span className={`tag tag--${item.cor}`}>{item.tag}</span>
                <b>{item.titulo}</b>
                {item.resumo && <span>{item.resumo}</span>}
                <span className="op-cta">
                  {textos.verDetalhes}{' '}
                  <span className="m-icon" aria-hidden="true">{'\ue5c8'}</span>
                </span>
              </button>
            ))
          )}
        </div>

        <button
          className="op-seta op-seta--next"
          type="button"
          aria-label="Próximas oportunidades"
          aria-controls="oportunidades-lista"
          data-od-id="oportunidades-proximas"
          disabled={proxDesab}
          onClick={() => navegar(1)}
        >
          <span className="m-icon" aria-hidden="true">{'\ue5cc'}</span>
        </button>
      </div>

      <Modal
        id="modal-op"
        odId="modal-oportunidade"
        tituloId="modal-op-titulo"
        aberto={abertaId !== null}
        onFechar={() => setAbertaId(null)}
      >
        {op && (
          <>
            <span className={`tag tag--${op.cor}`} id="modal-op-tag">{op.tag}</span>
            <h3 className="modal-titulo" id="modal-op-titulo">{op.titulo}</h3>
            <p className="modal-texto" id="modal-op-texto">{op.texto}</p>
            <a
              className="btn btn--navy btn--bloco"
              id="modal-op-cta"
              href={op.link}
              target="_blank"
              rel="noopener"
              data-od-id="modal-op-cta"
            >
              {op.cta}{' '}
              <span className="m-icon" aria-hidden="true">{'\uf8ce'}</span>
            </a>
          </>
        )}
      </Modal>
    </section>
  );
}
