import { describe, expect, it } from 'vitest';
import { md, mdInline } from '@/lib/markdown';

describe('Markdown editável no CMS', () => {
  it('não executa HTML nem URLs JavaScript', () => {
    expect(md('<script>alert(1)</script>')).not.toContain('<script>');
    expect(mdInline('[abrir](javascript:alert%281%29)')).toBe('abrir');
    expect(mdInline('[abrir](//atacante.example)')).toBe('abrir');
  });

  it('distingue o domínio do site de prefixos parecidos e preserva âncoras', () => {
    expect(mdInline('[externo](https://cadeufpel.com.atacante.example/)'))
      .toContain('target="_blank" rel="noopener"');
    expect(mdInline('[FAQ](#faq)')).toBe('<a href="#faq">FAQ</a>');
    expect(mdInline('[interno](https://cadeufpel.com/sobre)'))
      .toBe('<a href="https://cadeufpel.com/sobre">interno</a>');
  });
});
