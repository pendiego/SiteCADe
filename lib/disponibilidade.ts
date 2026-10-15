// Disponibilidade para reunião: segunda a sexta, de 09:00 a 17:30, de meia em meia hora.
// Fonte única para a grade do formulário e para a validação em /api/enviar.
export const DIAS = [
  { id: 'seg', rotulo: 'Segunda-feira', curto: 'Seg' },
  { id: 'ter', rotulo: 'Terça-feira', curto: 'Ter' },
  { id: 'qua', rotulo: 'Quarta-feira', curto: 'Qua' },
  { id: 'qui', rotulo: 'Quinta-feira', curto: 'Qui' },
  { id: 'sex', rotulo: 'Sexta-feira', curto: 'Sex' },
] as const;

const PRIMEIRO_MINUTO = 9 * 60;
const ULTIMO_MINUTO = 17 * 60 + 30;

export const HORARIOS: readonly string[] = Array.from(
  { length: (ULTIMO_MINUTO - PRIMEIRO_MINUTO) / 30 + 1 },
  (_, i) => {
    const minutos = PRIMEIRO_MINUTO + i * 30;
    return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
  },
);

export const idHorario = (dia: string, horario: string): string => `${dia}-${horario}`;

const VALIDOS: Record<string, true> = Object.fromEntries(
  DIAS.flatMap((dia) => HORARIOS.map((horario) => [idHorario(dia.id, horario), true] as const)),
);

// Aceita só combinações dia-horário da grade; devolve sem repetição, na ordem da grade.
// Null se o valor não for uma lista não vazia de horários válidos.
export function normalizarDisponibilidade(valor: unknown): string[] | null {
  if (!Array.isArray(valor) || valor.length === 0) return null;
  const escolhidos: Record<string, true> = {};
  for (const item of valor) {
    if (typeof item !== 'string' || !Object.hasOwn(VALIDOS, item)) return null;
    escolhidos[item] = true;
  }
  return DIAS.flatMap((dia) => HORARIOS.map((horario) => idHorario(dia.id, horario))).filter((id) => escolhidos[id]);
}

// "Segunda-feira: 09:00, 09:30\nQuarta-feira: 14:00" — um dia por linha, só os dias marcados.
export function descreverDisponibilidade(ids: readonly string[]): string {
  return DIAS.flatMap((dia) => {
    const horarios = HORARIOS.filter((horario) => ids.includes(idHorario(dia.id, horario)));
    return horarios.length > 0 ? [`${dia.rotulo}: ${horarios.join(', ')}`] : [];
  }).join('\n');
}

// "Seg 09:00–10:00, 14:30 · Qua 14:00": horários seguidos viram faixa (do primeiro ao último horário marcado).
export function resumirDisponibilidade(ids: readonly string[]): string {
  return DIAS.flatMap((dia) => {
    const faixas: string[] = [];
    let inicio = -1;
    for (let i = 0; i <= HORARIOS.length; i++) {
      const marcado = i < HORARIOS.length && ids.includes(idHorario(dia.id, HORARIOS[i]));
      if (marcado && inicio < 0) inicio = i;
      if (!marcado && inicio >= 0) {
        faixas.push(i - 1 === inicio ? HORARIOS[inicio] : `${HORARIOS[inicio]}–${HORARIOS[i - 1]}`);
        inicio = -1;
      }
    }
    return faixas.length > 0 ? [`${dia.curto} ${faixas.join(', ')}`] : [];
  }).join(' · ');
}
