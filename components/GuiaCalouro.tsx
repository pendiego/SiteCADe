'use client';

import { Fragment, useState } from 'react';
import MateriaisModal from '@/components/MateriaisModal';
import type { InicioGuia } from '@/lib/tipos';

interface Props {
  textos: InicioGuia;
  pastaId: string;
}

export default function GuiaCalouro({ textos, pastaId }: Props) {
  const [materiaisAberto, setMateriaisAberto] = useState(false);

  return (
    <section className="sec wrap" id="guia-calouro" data-od-id="guia-calouro">
      <img className="mascote-canto" src="/assets/mascote-calouros.svg" alt="" width={176} height={126} />
      <div className="sec-head" style={{ gap: 16 }}>
        <p className="eyebrow">{textos.eyebrow}</p>
        <h2 className="h-sec">{textos.titulo}</h2>
        <p className="lead">
          {textos.lead.split('\n').map((linha, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {linha}
            </Fragment>
          ))}
        </p>
      </div>

      <div className="guia-corpo">
        <div
          className="guia-foto"
          data-od-id="guia-foto"
          style={{ backgroundImage: `url(${textos.foto})` }}
        >
          {textos.fotoLegenda}
        </div>

        <div className="guia-cards">
          {textos.cards.map((card) =>
            card.tipo === 'materiais' ? (
              <button
                key={card.id}
                className="card"
                type="button"
                aria-haspopup="dialog"
                id={card.id}
                data-od-id={card.id}
                onClick={() => setMateriaisAberto(true)}
              >
                <b>{card.titulo}</b>
                <p>{card.texto}</p>
              </button>
            ) : (
              <a
                key={card.id}
                className="card"
                href={card.href}
                target="_blank"
                rel="noopener"
                data-od-id={card.id}
              >
                <b>
                  {card.titulo}{' '}
                  <span className="m-icon" aria-hidden="true">{'\uf8ce'}</span>
                </b>
                <p>{card.texto}</p>
              </a>
            ),
          )}
        </div>
      </div>

      <MateriaisModal
        textos={textos.materiais}
        pastaId={pastaId}
        aberto={materiaisAberto}
        onFechar={() => setMateriaisAberto(false)}
      />
    </section>
  );
}
