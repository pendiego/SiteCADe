import { describe, expect, it } from 'vitest';
import { preferMarkdown, wantsHtml } from '@/lib/negociacao';

const CHROME = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';

describe('negociação (lib/negociacao)', () => {
  it.each([
    'text/markdown',
    'text/markdown, text/plain',
    'text/markdown;q=0.9, text/html;q=0.8',
    'text/markdown;q=0.8, text/html;q=0.8',
    '  TEXT/MARKDOWN  ',
    'text/markdown; charset=utf-8; q=0.9, text/html;q=0.5',
  ])('prefere markdown em %j', (accept) => {
    expect(preferMarkdown(accept)).toBe(true);
  });

  it.each([CHROME, '*/*', '', 'text/markdown;q=0.3, text/html;q=0.9', 'text/markdown;q=0', 'text/markdown;q=0, text/html'])(
    'não prefere markdown em %j',
    (accept) => {
      expect(preferMarkdown(accept)).toBe(false);
    },
  );

  it('não prefere markdown sem Accept', () => {
    expect(preferMarkdown(undefined as unknown as string)).toBe(false);
  });

  it.each(['', '*/*', 'text/markdown', 'application/json'])('não quer HTML em %j', (accept) => {
    expect(wantsHtml(accept)).toBe(false);
  });

  it('não quer HTML sem Accept', () => {
    expect(wantsHtml(undefined as unknown as string)).toBe(false);
  });

  it.each([CHROME, 'text/markdown;q=0.3, text/html;q=0.9'])('quer HTML em %j', (accept) => {
    expect(wantsHtml(accept)).toBe(true);
  });

  it('empate com markdown favorece markdown, então não quer HTML', () => {
    expect(wantsHtml('text/markdown, text/html;q=0.5')).toBe(false);
  });
});
