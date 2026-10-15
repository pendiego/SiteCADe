'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Modal from '@/components/Modal';
import { listarArquivos } from '@/lib/drive';
import type { InicioGuia } from '@/lib/tipos';

interface Props {
  textos: InicioGuia['materiais'];
  pastaId: string;
  aberto: boolean;
  onFechar(): void;
}

interface Arquivo {
  id: string;
  name: string;
}

interface PastaMaterial {
  id: string;
  nome: string;
  qtd: number;
}

type Estado =
  | { tipo: 'carregando' }
  | { tipo: 'vazio' }
  | { tipo: 'erro' }
  | { tipo: 'lista'; pastas: PastaMaterial[] };

export default function MateriaisModal({ textos, pastaId, aberto, onFechar }: Props) {
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });
  const carregadoRef = useRef(false);

  // Carrega uma vez ao abrir; após erro, a próxima abertura tenta de novo.
  useEffect(() => {
    if (!aberto || carregadoRef.current) return;
    carregadoRef.current = true;
    setEstado({ tipo: 'carregando' });

    const carregar = async (): Promise<Estado> => {
      const pastas = (await listarArquivos(
        `'${pastaId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        'id,name',
      )) as Arquivo[];
      if (!pastas.length) return { tipo: 'vazio' };
      const lista = await Promise.all(
        pastas.map(async (p) => {
          const arquivos = (await listarArquivos(
            `'${p.id}' in parents and trashed=false`,
            'id,name',
          )) as Arquivo[];
          return { id: p.id, nome: p.name, qtd: arquivos.length };
        }),
      );
      return { tipo: 'lista', pastas: lista };
    };

    carregar()
      .then(setEstado)
      .catch(() => {
        carregadoRef.current = false;
        setEstado({ tipo: 'erro' });
      });
  }, [aberto, pastaId]);

  let conteudo: ReactNode;
  if (estado.tipo === 'carregando') conteudo = textos.carregando;
  else if (estado.tipo === 'vazio') conteudo = textos.vazio;
  else if (estado.tipo === 'erro') conteudo = textos.erro;
  else {
    conteudo = (
      <ul className="mat-lista">
        {estado.pastas.map((p) => (
          <li key={p.id} className="mat-item" data-od-id={`material-pasta-${p.id}`}>
            <a
              href={`https://drive.google.com/drive/folders/${p.id}`}
              target="_blank"
              rel="noopener"
              data-od-id={`material-link-${p.id}`}
            >
              <span className="m-icon" aria-hidden="true">{'\ue2c7'}</span>
              <span className="mat-nome">{p.nome}</span>
              <span className="mat-qtd">{p.qtd + (p.qtd === 1 ? ' arquivo' : ' arquivos')}</span>
              <span className="m-icon m-icon--18" aria-hidden="true">{'\ue89e'}</span>
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Modal
      id="modal-materiais"
      odId="modal-materiais"
      tituloId="modal-materiais-titulo"
      aberto={aberto}
      onFechar={onFechar}
    >
      <h3 className="modal-titulo" id="modal-materiais-titulo">{textos.titulo}</h3>
      <div className="modal-texto" id="modal-materiais-lista">{conteudo}</div>
    </Modal>
  );
}
