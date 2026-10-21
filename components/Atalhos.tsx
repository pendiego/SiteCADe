import type { InicioAtalhos } from '@/lib/tipos';

interface Props {
  textos: InicioAtalhos;
}

export default function Atalhos({ textos }: Props) {
  return (
    <section className="sec wrap" id="links" data-od-id="links">
      <div className="sec-head">
        <p className="eyebrow">{textos.eyebrow}</p>
        <h2 className="h-sec">{textos.titulo}</h2>
      </div>
      <div className="links">
        {textos.itens.map((item) => (
          <a
            className="link-card"
            key={item.id}
            href={item.href}
            {...(item.novaAba ? { target: '_blank', rel: 'noopener' } : {})}
            data-od-id={item.id}
          >
            <span className="link-top">
              <b>{item.titulo}</b>
              <span className="m-icon" aria-hidden="true">{'\uf8ce'}</span>
            </span>
            <span>{item.subtitulo}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
