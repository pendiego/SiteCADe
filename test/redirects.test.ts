import { describe, expect, it } from 'vitest';
import nextConfig from '@/next.config';

describe('next.config.ts (redirects)', () => {
  it('redireciona hosts antigos para o domínio canônico sem www', async () => {
    const regras = (await nextConfig.redirects?.()) ?? [];
    const hosts = regras.flatMap((r) => (r.has ?? []).map((h) => h.value));
    expect(hosts).toContain('www.cadeufpel.com');
    expect(hosts).toContain('cade.diegoruas.com.br');
    for (const regra of regras) {
      expect(String(regra.destination)).not.toContain('www.');
    }
  });

  it.each([
    ['/about', '/sobre'],
    ['/contact', '/contato'],
    ['/privacy', '/privacidade'],
    ['/index.html', '/'],
  ])('%s redireciona para %s', async (origem, destino) => {
    const regras = (await nextConfig.redirects?.()) ?? [];
    const regra = regras.find((r) => r.source === origem);
    expect(regra?.destination).toBe(destino);
    expect(regra?.permanent).toBe(true);
  });
});
