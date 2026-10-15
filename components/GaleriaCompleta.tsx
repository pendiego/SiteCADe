'use client';

import { useEffect, useRef, useState } from 'react';
import Lightbox from '@/components/Lightbox';
import { listarArquivos, miniaturaUrl, tituloPasta } from '@/lib/drive';
import { driveUrl } from '@/lib/links';
import type { PaginaGaleria } from '@/lib/tipos';

interface Props {
  textos: PaginaGaleria;
  pastaId: string;
}

interface Pasta {
  id: string;
  name: string;
}

interface Foto {
  id: string;
  imageMediaMetadata?: { width: number; height: number };
}

type Lote = { fotos: { id: string; legenda: string }[]; indice: number };

const LOTE = 10;
const TAMANHO_MAXIMO = 1600;

type Mensagens = PaginaGaleria['mensagens'];

function CardFotoCategoria({
  foto,
  nome,
  categoriaId,
  onErro,
  onAbrir,
}: {
  foto: Foto;
  nome: string;
  categoriaId: string;
  onErro(id: string): void;
  onAbrir(): void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [src, setSrc] = useState('');

  // Mede o card antes do paint para escolher o tamanho da miniatura (igual à galeria original).
  useEffect(() => {
    const btn = ref.current;
    if (!btn) return;
    const caixa = btn.getBoundingClientRect();
    const d = foto.imageMediaMetadata;
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
      data-od-id={`galeria-foto-${categoriaId}-${foto.id}`}
      data-drive-id={foto.id}
      onClick={onAbrir}
    >
      <img
        alt={nome}
        loading="lazy"
        src={src || undefined}
        onError={() => onErro(foto.id)}
      />
    </button>
  );
}

function Categoria({
  pasta,
  mensagens,
  onAbrir,
}: {
  pasta: Pasta;
  mensagens: Mensagens;
  onAbrir(fotos: { id: string; legenda: string }[], indice: number): void;
}) {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [estado, setEstado] = useState<'carregando' | 'vazio' | 'erro' | 'ok'>('carregando');
  const [exibidas, setExibidas] = useState(0);
  const [removidas, setRemovidas] = useState<Set<string>>(() => new Set());
  const gridRef = useRef<HTMLDivElement>(null);
  const focoRef = useRef<number | null>(null);
  const nome = tituloPasta(pasta.name);

  useEffect(() => {
    listarArquivos<Foto>(
      `'${pasta.id}' in parents and mimeType contains 'image/' and trashed=false`,
      'id,imageMediaMetadata(width,height)',
    )
      .then((arquivos) => {
        if (!arquivos.length) {
          setEstado('vazio');
          return;
        }
        setFotos(arquivos);
        setExibidas(Math.min(LOTE, arquivos.length));
        setEstado('ok');
      })
      .catch(() => setEstado('erro'));
  }, [pasta.id]);

  // Após um lote extra com "Ver mais" já esgotado, foca a primeira foto nova.
  useEffect(() => {
    if (focoRef.current === null) return;
    const cards = gridRef.current?.querySelectorAll<HTMLElement>('.gal-foto');
    cards?.[focoRef.current]?.focus();
    focoRef.current = null;
  }, [exibidas]);

  function verMais() {
    const primeiro = exibidas;
    const fim = Math.min(exibidas + LOTE, fotos.length);
    if (primeiro && fim >= fotos.length) focoRef.current = primeiro;
    setExibidas(fim);
  }

  const visiveis = fotos.slice(0, exibidas).filter((f) => !removidas.has(f.id));

  let texto: string;
  if (estado === 'carregando') texto = mensagens.carregandoFotos;
  else if (estado === 'vazio') texto = mensagens.emBreve;
  else if (estado === 'erro') texto = mensagens.erroCategoria;
  else texto = `${exibidas} de ${fotos.length} fotos.`;

  return (
    <div className="galeria-cat" data-od-id={`galeria-categoria-${pasta.id}`}>
      <h3 data-od-id={`galeria-titulo-${pasta.id}`}>{nome}</h3>
      <div className="galeria-grid" ref={gridRef}>
        {visiveis.map((f, i) => (
          <CardFotoCategoria
            key={f.id}
            foto={f}
            categoriaId={pasta.id}
            nome={nome}
            onErro={(id) => setRemovidas((s) => new Set(s).add(id))}
            onAbrir={() => onAbrir(visiveis.map((v) => ({ id: v.id, legenda: nome })), i)}
          />
        ))}
      </div>
      <p className="form-nota" role="status">{texto}</p>
      {estado === 'ok' && exibidas < fotos.length && (
        <button
          type="button"
          className="btn btn--ghost gal-ver-mais"
          data-od-id={`galeria-mais-${pasta.id}`}
          onClick={verMais}
        >
          {mensagens.verMais}
        </button>
      )}
    </div>
  );
}

export default function GaleriaCompleta({ textos, pastaId }: Props) {
  const [categorias, setCategorias] = useState<Pasta[]>([]);
  const [estadoGeral, setEstadoGeral] = useState<'carregando' | 'vazio' | 'erro' | 'ok'>('carregando');
  const [lote, setLote] = useState<Lote | null>(null);

  useEffect(() => {
    listarArquivos<Pasta>(
      `'${pastaId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      'id,name',
    )
      .then((lista) => {
        const subpastas = lista.sort((a, b) => a.name.localeCompare(b.name));
        if (!subpastas.length) {
          setEstadoGeral('vazio');
          return;
        }
        setCategorias(subpastas);
        setEstadoGeral('ok');
      })
      .catch(() => setEstadoGeral('erro'));
  }, [pastaId]);

  const m = textos.mensagens;
  let textoGeral = '';
  if (estadoGeral === 'carregando') textoGeral = textos.carregando;
  else if (estadoGeral === 'vazio') textoGeral = m.vazio;
  else if (estadoGeral === 'erro') textoGeral = m.erroGeral;

  return (
    <>
      <main id="topo">
        <div className="area" id="area-galeria" style={{ background: 'var(--bg-cade)' }} data-od-id="area-galeria">
          <section className="sec wrap" data-od-id="galeria-completa">
            <div className="sec-head">
              <p className="eyebrow">{textos.eyebrow}</p>
              <h1 className="h-sec" data-od-id="galeria-titulo">{textos.titulo}</h1>
              <p className="lead">{textos.lead}</p>
              <p className="form-nota">{textos.nota}</p>
              <a
                className="btn btn--ghost btn--sm galeria-drive-cta"
                href={driveUrl(pastaId)}
                target="_blank"
                rel="noopener"
                data-od-id="galeria-drive"
              >
                {textos.driveRotulo}
              </a>
            </div>

            <div id="galeria-categorias" data-od-id="galeria-categorias">
              <p className="lead" id="galeria-carregando" role="status">{textoGeral}</p>
              {estadoGeral === 'ok' && categorias.map((pasta) => (
                <Categoria
                  key={pasta.id}
                  pasta={pasta}
                  mensagens={m}
                  onAbrir={(fotos, indice) => setLote({ fotos, indice })}
                />
              ))}
            </div>
            <noscript><p className="form-nota">{textos.noscript}</p></noscript>
          </section>
        </div>
      </main>
      <Lightbox
        fotos={lote?.fotos ?? []}
        indice={lote?.indice ?? null}
        onFechar={() => setLote(null)}
        onNavegar={(indice) => setLote((atual) => (atual ? { ...atual, indice } : atual))}
      />
    </>
  );
}
