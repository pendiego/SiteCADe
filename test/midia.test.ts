import { describe, expect, it } from 'vitest';
import { limiteDimensoes, limiteTamanhoBytes, validarUpload } from '@/cms/midia-regras';

const arquivo = (parcial: Partial<{ nome: string; mimeType: string; tamanho: number }>) => ({
  nome: 'logo-cade.png',
  mimeType: 'image/png',
  tamanho: 1024,
  ...parcial,
});

describe('validarUpload (cms/midia-regras)', () => {
  it.each([
    ['logo-cade.png', 'image/png'],
    ['foto-evento.jpg', 'image/jpeg'],
    ['foto-evento.jpeg', 'image/jpeg'],
    ['banner-2026.webp', 'image/webp'],
  ])('aceita %s (%s)', (nome, mimeType) => {
    expect(validarUpload(arquivo({ nome, mimeType }))).toBeNull();
  });

  it('rejeita SVG, mesmo com extensão de imagem válida', () => {
    expect(validarUpload(arquivo({ nome: 'mascote.svg', mimeType: 'image/svg+xml' }))).not.toBeNull();
    expect(validarUpload(arquivo({ nome: 'mascote.png', mimeType: 'image/svg+xml' }))).not.toBeNull();
  });

  it('rejeita tipos que não são raster aceito', () => {
    expect(validarUpload(arquivo({ nome: 'documento.pdf', mimeType: 'application/pdf' }))).not.toBeNull();
    expect(validarUpload(arquivo({ nome: 'gif-animado.gif', mimeType: 'image/gif' }))).not.toBeNull();
  });

  it('rejeita extensão que não corresponde ao tipo declarado', () => {
    expect(validarUpload(arquivo({ nome: 'foto.webp', mimeType: 'image/png' }))).not.toBeNull();
  });

  it.each(['Logo-CADe.png', 'logo_cade.png', 'logo cade.png', 'logo--cade-.png', 'logo.final.png', 'ação.png'])(
    'rejeita nome fora do kebab-case: %s',
    (nome) => {
      expect(validarUpload(arquivo({ nome }))).not.toBeNull();
    },
  );

  it('aceita exatamente 5 MiB e rejeita um byte a mais', () => {
    expect(limiteTamanhoBytes).toBe(5 * 1024 * 1024);
    expect(validarUpload(arquivo({ tamanho: limiteTamanhoBytes }))).toBeNull();
    expect(validarUpload(arquivo({ tamanho: limiteTamanhoBytes + 1 }))).not.toBeNull();
  });
});

describe('limiteDimensoes', () => {
  it('mantém imagens até 2048 px no maior lado', () => {
    expect(limiteDimensoes(2048, 1500)).toEqual({ largura: 2048, altura: 1500 });
  });

  it('reduz proporcionalmente quando o maior lado passa de 2048 px', () => {
    expect(limiteDimensoes(4096, 1024)).toEqual({ largura: 2048, altura: 512 });
    expect(limiteDimensoes(1000, 4000)).toEqual({ largura: 512, altura: 2048 });
  });
});
