import FaixaGestao from '@/components/FaixaGestao';
import type { InicioQuemSomos } from '@/lib/tipos';

interface Props {
  textos: InicioQuemSomos;
}

export default function QuemSomos({ textos }: Props) {
  return (
    <section className="sec wrap" id="o-cade" data-od-id="quem-somos">
      <p className="eyebrow">{textos.eyebrow}</p>
      <div className="quem-txt">
        <h2 className="h-sec">{textos.titulo}</h2>
        <p>{textos.texto}</p>
        <p>
          <a className="btn btn--ghost btn--sm" href="/sobre" data-od-id="quem-link-sobre">
            Conheça o CADe UFPel
          </a>
        </p>
      </div>
      <div className="gestao">
        <div className="gestao-head">
          <b>{textos.gestaoTitulo}</b>
          <span>{textos.membros.length} pessoas</span>
        </div>
        <FaixaGestao membros={textos.membros} />
      </div>
    </section>
  );
}
