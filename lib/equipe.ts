import type { InicioQuemSomos, Membro } from '@/lib/tipos';

// Títulos editáveis no painel; vazio mantém o texto original.
export function titulosEquipe(q: InicioQuemSomos): { coordenacao: string; membros: string } {
  return { coordenacao: q.equipeCoordenacaoTitulo || 'Coordenação', membros: q.equipeMembrosTitulo || 'Membros' };
}

// Separa a coordenação (marcada no CMS) dos demais membros, mantendo a ordem da lista do painel.
export function dividirEquipe(membros: Membro[]): { coordenacao: Membro[]; demais: Membro[] } {
  return {
    coordenacao: membros.filter((m) => m.coordenacao),
    demais: membros.filter((m) => !m.coordenacao),
  };
}

// Versão em Markdown da equipe, para /sobre.md (agentes).
export function equipeMd(q: InicioQuemSomos): string {
  const titulos = titulosEquipe(q);
  const { coordenacao, demais } = dividirEquipe(q.membros);
  const partes: string[] = [];
  if (coordenacao.length) {
    partes.push(
      `### ${titulos.coordenacao}`,
      '',
      ...coordenacao.map((m) => (m.cargo ? `- **${m.nome}** — ${m.cargo}` : `- **${m.nome}**`)),
    );
  }
  if (demais.length) {
    if (partes.length) partes.push('');
    partes.push(`### ${titulos.membros}`, '', demais.map((m) => m.nome).join(', ') + '.');
  }
  return partes.join('\n');
}
