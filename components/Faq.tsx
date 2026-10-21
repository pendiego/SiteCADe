import { mdInline } from '@/lib/markdown';
import type { InicioFaq } from '@/lib/tipos';

interface Props {
  textos: InicioFaq;
}

export default function Faq({ textos }: Props) {
  return (
    <section className="sec wrap" id="faq" data-od-id="faq">
      <div className="faq-grid">
        <div className="sec-head">
          <p className="eyebrow">{textos.eyebrow}</p>
          <h2 className="h-sec">{textos.titulo}</h2>
          <p>{textos.texto}</p>
        </div>
        <div className="faq-lista">
          {textos.itens.map((item) => (
            <details className="faq" key={item.id} open={item.aberto} data-od-id={item.id}>
              <summary>
                {item.pergunta}
                <span className="faq-icone faq-icone--menos m-icon" aria-hidden="true">{'\ue15b'}</span>
                <span className="faq-icone faq-icone--mais m-icon" aria-hidden="true">{'\ue145'}</span>
              </summary>
              <p className="faq-resposta" dangerouslySetInnerHTML={{ __html: mdInline(item.resposta) }} />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
