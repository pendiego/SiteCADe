import { describe, expect, it } from 'vitest';
import { validarConfiguracaoEmail } from '@/cms/email';

describe('validarConfiguracaoEmail (cms/email)', () => {
  it('em produção exige chave e remetente: sem eles "Esqueceu a senha?" quebraria para os editores', () => {
    expect(() => validarConfiguracaoEmail({ NODE_ENV: 'production' })).toThrow(/RESEND_API_KEY/);
    expect(() => validarConfiguracaoEmail({ NODE_ENV: 'production', RESEND_API_KEY: 're_x' })).toThrow(
      /CMS_EMAIL_REMETENTE/,
    );
    expect(() =>
      validarConfiguracaoEmail({ NODE_ENV: 'production', RESEND_API_KEY: 're_x', CMS_EMAIL_REMETENTE: 'cms@cadeufpel.com' }),
    ).not.toThrow();
  });

  it('em desenvolvimento não exige e-mail, salvo se a verificação de cadastro for ligada', () => {
    expect(() => validarConfiguracaoEmail({ NODE_ENV: 'development' })).not.toThrow();
    expect(() => validarConfiguracaoEmail({ NODE_ENV: 'development', CMS_VERIFICACAO_EMAIL: 'true' })).toThrow(
      /RESEND_API_KEY/,
    );
  });
});
