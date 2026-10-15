import GaleriaCarrossel from '@/components/GaleriaCarrossel';
import type { InicioHistorico } from '@/lib/tipos';

interface Props {
  textos: InicioHistorico;
  pastaId: string;
}

export default function Historico({ textos, pastaId }: Props) {
  return (
    <section className="sec wrap" id="historico" data-od-id="historico">
      <div className="sec-head">
        <p className="eyebrow">{textos.eyebrow}</p>
        <h2 className="h-sec">{textos.titulo}</h2>
        <p className="lead">{textos.lead}</p>
        <p className="form-nota">{textos.nota}</p>
      </div>
      <GaleriaCarrossel textos={textos} pastaId={pastaId} />
      <noscript><p className="form-nota">{textos.noscript}</p></noscript>
      <a className="btn btn--ghost" href="/galeria" data-od-id="historico-ver-galeria" style={{ marginTop: '24px' }}>
        {textos.verTudoRotulo}{' '}
        <span className="m-icon" aria-hidden="true">{'\ue5c8'}</span>
      </a>
    </section>
  );
}
