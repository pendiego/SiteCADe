import Image from 'next/image';
import type { InicioLojinha } from '@/lib/tipos';

interface Props {
  textos: InicioLojinha;
}

export default function Lojinha({ textos }: Props) {
  return (
    <section className="sec wrap" id="lojinha" data-od-id="lojinha">
      <div className="sec-head">
        <p className="eyebrow">{textos.eyebrow}</p>
        <h2 className="h-sec">{textos.titulo}</h2>
        <p className="lead" style={{ color: 'rgba(11,11,109,.85)', fontSize: 'clamp(16px,1.5vw,18px)' }}>
          {textos.lead}
        </p>

      <a className="loja-badge" href={textos.badgeHref} target="_blank" rel="noopener" data-od-id="loja-badge">
        <svg className="brand-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x={2} y={2} width={20} height={20} rx={5} />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <path d="M17.5 6.5h.01" />
        </svg>
        {textos.badgeRotulo}
      </a>
      </div>

      <div className="produtos" data-od-id="produtos">
        {textos.produtos.map((p) => (
          <a className="produto" href={p.href} target="_blank" rel="noopener" key={p.id} data-od-id={p.id}>
            <div className="produto-img">
              <Image src={p.imagem} alt={p.alt} width={1000} height={667} sizes="(max-width:720px) 100vw, 25vw" />
              <span className="produto-hover">
                {textos.hoverRotulo}
                <span className="m-icon m-icon--16" aria-hidden="true">{'\ue5c8'}</span>
              </span>
            </div>
            <div>
              <b>{p.titulo}</b>
              <br />
              <span>{p.subtitulo}</span>
            </div>
          </a>
        ))}

        <a className="produto produto-cta" href={textos.cta.href} target="_blank" rel="noopener" data-od-id="produto-ver-mais">
          <svg className="brand-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x={2} y={2} width={20} height={20} rx={5} />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <path d="M17.5 6.5h.01" />
          </svg>
          <div>
            <b>{textos.cta.titulo}</b>
            <br />
            <span>{textos.cta.subtitulo}</span>
          </div>
        </a>
      </div>

      <p className="loja-nota">{textos.nota}</p>
    </section>
  );
}
