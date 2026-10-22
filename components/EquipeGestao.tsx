import Image from 'next/image';
import { dividirEquipe, titulosEquipe } from '@/lib/equipe';
import type { InicioQuemSomos, Membro } from '@/lib/tipos';

interface Props {
  quemSomos: InicioQuemSomos;
}

function slug(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ids únicos mesmo com nomes repetidos (data-od-id é obrigatório e não pode colidir)
function idsUnicos(membros: Membro[], prefixo: string): string[] {
  const usados = new Set<string>();
  return membros.map((m) => {
    const base = `${prefixo}-${slug(m.nome) || 'pessoa'}`;
    let id = base;
    for (let n = 2; usados.has(id); n++) id = `${base}-${n}`;
    usados.add(id);
    return id;
  });
}

export default function EquipeGestao({ quemSomos }: Props) {
  const titulos = titulosEquipe(quemSomos);
  const { coordenacao, demais } = dividirEquipe(quemSomos.membros);
  const idsCoord = idsUnicos(coordenacao, 'sobre-coord');
  const idsDemais = idsUnicos(demais, 'sobre-membro');

  return (
    <div className="equipe" data-od-id="sobre-equipe">
      {coordenacao.length > 0 && (
        <>
          <h3>{titulos.coordenacao}</h3>
          <ul className="equipe-coord" data-od-id="sobre-coordenacao">
            {coordenacao.map((m, i) => (
              <li key={idsCoord[i]} data-od-id={idsCoord[i]}>
                <Image
                  src={m.foto}
                  alt={`Foto de ${m.nome}`}
                  width={128}
                  height={128}
                  sizes="64px"
                  style={{ objectPosition: m.enquadramento }}
                />
                <b>{m.nome}</b>
                {m.cargo ? <span>{m.cargo}</span> : null}
              </li>
            ))}
          </ul>
        </>
      )}
      {demais.length > 0 && (
        <>
          <h3>{titulos.membros}</h3>
          <ul className="equipe-membros" data-od-id="sobre-membros">
            {demais.map((m, i) => (
              <li key={idsDemais[i]} data-od-id={idsDemais[i]}>
                <Image
                  src={m.foto}
                  alt={`Foto de ${m.nome}`}
                  width={88}
                  height={88}
                  sizes="44px"
                  style={{ objectPosition: m.enquadramento }}
                />
                <span>{m.nome}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
