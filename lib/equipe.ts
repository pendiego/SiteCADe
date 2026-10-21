import type { Membro } from '@/lib/tipos';

// Separa a coordenação (marcada no CMS) dos demais membros, mantendo a ordem da lista do painel.
export function dividirEquipe(membros: Membro[]): { coordenacao: Membro[]; demais: Membro[] } {
  return {
    coordenacao: membros.filter((m) => m.coordenacao),
    demais: membros.filter((m) => !m.coordenacao),
  };
}

// Versão em Markdown da equipe, para /sobre.md (agentes).
export function equipeMd(membros: Membro[]): string {
  const { coordenacao, demais } = dividirEquipe(membros);
  const partes: string[] = [];
  if (coordenacao.length) {
    partes.push(
      '### Coordenação',
      '',
      ...coordenacao.map((m) => (m.cargo ? `- **${m.nome}** — ${m.cargo}` : `- **${m.nome}**`)),
    );
  }
  if (demais.length) {
    if (partes.length) partes.push('');
    partes.push('### Membros', '', demais.map((m) => m.nome).join(', ') + '.');
  }
  return partes.join('\n');
}
