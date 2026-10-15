'use client';

import { useEffect, useRef, useState } from 'react';
import Lightbox from '@/components/Lightbox';
import { listarArquivos, miniaturaUrl, tituloPasta } from '@/lib/drive';
import type { InicioHistorico } from '@/lib/tipos';

interface Props {
  textos: InicioHistorico;
  pastaId: string;
}

interface Pasta {
  id: string;
  name: string;
}

interface Dimensoes {
  width: number;
  height: number;
}

interface Foto {
  id: string;
  pasta: string;
  dimensoes?: Dimensoes;
}

const QTD = 10;
const CACHE_KEY = 'cade-galeria-cache-v2';
const CACHE_TTL = 3600000; // 1h: evita repetir a varredura de pastas do Drive a cada visita/reload
const TAMANHO_MAXIMO = 1600;

function fotoValida(f: unknown): f is Foto {
  const x = f as Foto;
  return !!x && typeof x.id === 'string' && typeof x.pasta === 'string';
}

function lerCache(): Foto[] | null {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
    if (
      cache &&
      typeof cache.ts === 'number' &&
      Date.now() >= cache.ts &&
      Date.now() - cache.ts < CACHE_TTL &&
      Array.isArray(cache.todas) &&
      cache.todas.every(fotoValida)
    ) {
      return cache.todas;
    }
  } catch {
    /* cache corrompido: segue para a rede */
  }
  return null;
}

async function listarTodas(pastaId: string): Promise<Foto[]> {
  const pastas = (await listarArquivos(
    `'${pastaId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    'id,name',
  )) as Pasta[];
  const porPasta = await Promise.all(
    pastas.map(async (pasta) => {
      const arquivos = (await listarArquivos(
        `'${pasta.id}' in parents and mimeType contains 'image/' and trashed=false`,
        'id,imageMediaMetadata(width,height)',
      )) as { id: string; imageMediaMetadata?: Dimensoes }[];
      return arquivos.map((f) => ({ id: f.id, pasta: pasta.name, dimensoes: f.imageMediaMetadata }));
    }),
  );
  const todas = porPasta.flat();
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), todas }));
  } catch {
    /* sem armazenamento: sem cache */
  }
  return todas;
}

function embaralhar<T>(lista: T[]): T[] {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function CardFoto({
  foto,
  onErro,
  onAbrir,
}: {
  foto: Foto;
  onErro(id: string): void;
  onAbrir(): void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [src, setSrc] = useState<string>('');

  // Mede o card após montar para escolher o tamanho da miniatura (igual ao original).
  useEffect(() => {
    const btn = ref.current;
    if (!btn) return;
    const caixa = btn.getBoundingClientRect();
    const d = foto.dimensoes;
    const proporcao = d && d.width > 0 && d.height > 0 ? d.width / d.height : 1;
    const largura = Math.max(caixa.width, caixa.height * proporcao);
    const tamanho = Math.min(
      TAMANHO_MAXIMO,
      Math.max(160, Math.ceil((largura * Math.min(window.devicePixelRatio || 1, 2)) / 80) * 80),
    );
    setSrc(miniaturaUrl(foto.id, tamanho));
  }, [foto]);

  return (
    <button
      ref={ref}
      type="button"
      className="gal-foto"
      data-od-id={`galeria-foto-${foto.id}`}
      data-drive-id={foto.id}
      onClick={onAbrir}
    >
      <img
        alt={tituloPasta(foto.pasta)}
        loading="lazy"
        src={src || undefined}
        onError={() => onErro(foto.id)}
      />
      <span>{tituloPasta(foto.pasta)}</span>
    </button>
  );
}

export default function GaleriaCarrossel({ textos, pastaId }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const iniciadoRef = useRef(false);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [status, setStatus] = useState('');
  const [podeAnterior, setPodeAnterior] = useState(false);
  const [podeProxima, setPodeProxima] = useState(false);
  const [indice, setIndice] = useState<number | null>(null);

  function atualiza() {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth - 1;
    setPodeAnterior(track.scrollLeft > 0);
    setPodeProxima(track.scrollLeft < max);
  }

  function passo(): number {
    const track = trackRef.current;
    if (!track) return 0;
    const foto = track.querySelector<HTMLElement>('.gal-foto');
    return foto ? foto.getBoundingClientRect().width + 16 : track.clientWidth;
  }

  function rolar(sentido: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: sentido * passo(), behavior: reduz ? 'auto' : 'smooth' });
  }

  // Setas: reavalia no scroll, no resize e quando a lista muda.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => atualiza();
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    atualiza();
    return () => {
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
    // atualiza só lê refs e chama setters estáveis.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    atualiza();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fotos]);

  // Carregamento preguiçoso: ao chegar perto da viewport ou ao receber foco dentro da seção.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const historico = track.closest<HTMLElement>('#historico');

    const carregar = () => {
      if (iniciadoRef.current) return;
      iniciadoRef.current = true;
      setStatus(textos.mensagens.carregando);
      const pegar = async () => {
        const cache = lerCache();
        return cache ?? (await listarTodas(pastaId));
      };
      pegar()
        .then((todas) => {
          setFotos(embaralhar(todas).slice(0, QTD));
          setStatus(todas.length ? '' : textos.mensagens.vazio);
        })
        .catch(() => setStatus(textos.mensagens.erro));
    };

    let observer: IntersectionObserver | null = null;
    const aoFocar = () => carregar();
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect();
            carregar();
          }
        },
        { rootMargin: '400px' },
      );
      observer.observe(track);
      historico?.addEventListener('focusin', aoFocar);
    } else {
      carregar();
    }

    return () => {
      observer?.disconnect();
      historico?.removeEventListener('focusin', aoFocar);
    };
  }, [pastaId, textos]);

  return (
    <>
      <div className="galeria-wrap" data-od-id="galeria-wrap">
        <button
          type="button"
          className="gal-seta gal-seta--prev"
          aria-label="Fotos anteriores"
          data-od-id="galeria-anterior"
          disabled={!podeAnterior}
          onClick={() => rolar(-1)}
        >
          <span className="m-icon" aria-hidden="true">{'\ue5cb'}</span>
        </button>
        <div className="galeria" id="galeria" data-od-id="galeria" ref={trackRef}>
          {fotos.map((foto, i) => (
            <CardFoto
              key={foto.id}
              foto={foto}
              onErro={(id) => setFotos((lista) => lista.filter((f) => f.id !== id))}
              onAbrir={() => setIndice(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="gal-seta gal-seta--next"
          aria-label="Próximas fotos"
          data-od-id="galeria-proxima"
          disabled={!podeProxima}
          onClick={() => rolar(1)}
        >
          <span className="m-icon" aria-hidden="true">{'\ue5cc'}</span>
        </button>
      </div>
      <p className="form-nota" id="galeria-status" role="status" data-od-id="galeria-status">
        {status}
      </p>
      <Lightbox
        fotos={fotos.map((f) => ({ id: f.id, legenda: tituloPasta(f.pasta) }))}
        indice={indice}
        onFechar={() => setIndice(null)}
      />
    </>
  );
}
