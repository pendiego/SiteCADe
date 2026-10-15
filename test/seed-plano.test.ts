import { describe, expect, it } from 'vitest';
import { lerCredenciaisAdmin, planejarSeed } from '@/cms/seed-plano';
import { modelos } from '@/cms/modelos';

const CHAVES = modelos.map((m) => m.chave);

describe('planejarSeed (cms/seed-plano)', () => {
  it('num banco vazio cria todos os globais e o administrador', () => {
    const plano = planejarSeed({ globaisExistentes: [], adminExiste: false });
    expect(plano.criarGlobais).toEqual(CHAVES);
    expect(plano.criarAdmin).toBe(true);
  });

  it('é idempotente: após aplicar o plano, a segunda execução não cria nada', () => {
    const primeiro = planejarSeed({ globaisExistentes: [], adminExiste: false });
    expect(primeiro.criarGlobais).toEqual(CHAVES);
    const segundo = planejarSeed({ globaisExistentes: [...primeiro.criarGlobais], adminExiste: true });
    expect(segundo.criarGlobais).toEqual([]);
    expect(segundo.criarAdmin).toBe(false);
  });

  it('não sobrescreve globais já existentes, só cria os que faltam', () => {
    const existentes = ['site', 'hero'];
    const plano = planejarSeed({ globaisExistentes: existentes, adminExiste: true });
    expect(plano.criarGlobais).toEqual(CHAVES.filter((chave) => !existentes.includes(chave)));
    expect(plano.criarAdmin).toBe(false);
  });
});

describe('lerCredenciaisAdmin', () => {
  it('lê e-mail e senha do ambiente', () => {
    expect(lerCredenciaisAdmin({ CMS_ADMIN_EMAIL: 'admin@cadeufpel.com.br', CMS_ADMIN_PASSWORD: 'segredo-longo' })).toEqual({
      email: 'admin@cadeufpel.com.br',
      senha: 'segredo-longo',
    });
  });

  it('falha sem e-mail, sem padrão', () => {
    expect(() => lerCredenciaisAdmin({ CMS_ADMIN_PASSWORD: 'x' })).toThrow(/CMS_ADMIN_EMAIL/);
  });

  it('falha sem senha, sem padrão', () => {
    expect(() => lerCredenciaisAdmin({ CMS_ADMIN_EMAIL: 'admin@cadeufpel.com.br' })).toThrow(/CMS_ADMIN_PASSWORD/);
  });
});
