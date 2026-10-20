import { describe, expect, it } from 'vitest';
import { md, mdInline, secaoHtml } from '@/lib/markdown';

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

  describe('seção de estilo "lista"', () => {
    const secao = (corpo: string, estilo = 'lista') => ({ titulo: 'O que fazemos', estilo, corpo });

    it('separa título e descrição, sem o travessão, e capitaliza a descrição', () => {
      const html = secaoHtml(secao('- **Lojinha** — adesivos e camisetas, cuja receita financia os eventos.'));
      expect(html).toContain('<ul class="inst-lista">');
      expect(html).toContain('<li><b>Lojinha</b><span>Adesivos e camisetas, cuja receita financia os eventos.</span></li>');
      expect(html).not.toContain('—');
    });

    it('mantém links da descrição e não executa HTML', () => {
      const html = secaoHtml(secao('- **Guia** — veja o [guia](/#guia) <script>x</script>'));
      expect(html).toContain('<a href="/#guia">guia</a>');
      expect(html).not.toContain('<script>');
    });

    it('item sem travessão continua como item comum, sem quebrar a lista', () => {
      const html = secaoHtml(secao('- **Só título**\n- **Outro** — com descrição'));
      expect(html).toContain('<li><b>Só título</b></li>');
      expect(html).toContain('<li><b>Outro</b><span>Com descrição</span></li>');
    });

    it('só o estilo lista é transformado', () => {
      const corpo = '- **A** — b';
      expect(secaoHtml(secao(corpo, 'texto'))).toContain('<li><b>A</b> — b</li>');
      expect(secaoHtml(secao(corpo, 'canais'))).toContain('<ul class="inst-canais">');
    });
  });
});
