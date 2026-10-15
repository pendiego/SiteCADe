import { describe, expect, it } from 'vitest';
import { DIAS, HORARIOS, descreverDisponibilidade, normalizarDisponibilidade } from '@/lib/disponibilidade';

describe('grade de disponibilidade', () => {
  it('vai de 09:00 a 17:30, de meia em meia hora, de segunda a sexta', () => {
    expect(HORARIOS).toHaveLength(18);
    expect(HORARIOS[0]).toBe('09:00');
    expect(HORARIOS[1]).toBe('09:30');
    expect(HORARIOS[17]).toBe('17:30');
    expect(DIAS.map((dia) => dia.id)).toEqual(['seg', 'ter', 'qua', 'qui', 'sex']);
  });
});

describe('normalizarDisponibilidade', () => {
  it('remove repetidos e ordena pela grade', () => {
    expect(normalizarDisponibilidade(['sex-10:00', 'seg-09:30', 'seg-09:00', 'seg-09:30'])).toEqual([
      'seg-09:00',
      'seg-09:30',
      'sex-10:00',
    ]);
  });

  it('recusa lista vazia, tipos errados e qualquer horário fora da grade', () => {
    expect(normalizarDisponibilidade([])).toBeNull();
    expect(normalizarDisponibilidade('seg-09:00')).toBeNull();
    expect(normalizarDisponibilidade(undefined)).toBeNull();
    expect(normalizarDisponibilidade(['seg-09:00', 42])).toBeNull();
    expect(normalizarDisponibilidade(['seg-09:00', 'seg-18:00'])).toBeNull();
    expect(normalizarDisponibilidade(['__proto__'])).toBeNull();
  });
});

describe('descreverDisponibilidade', () => {
  it('agrupa por dia, na ordem da semana, e omite dias sem horário', () => {
    expect(descreverDisponibilidade(['qua-14:30', 'seg-09:00', 'seg-09:30'])).toBe(
      'Segunda-feira: 09:00, 09:30\nQuarta-feira: 14:30',
    );
  });
});
