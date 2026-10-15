// Porta literal de middleware.js:26-46.
// Navegadores mandam `*/*` no fim e continuariam recebendo HTML.
export function preferMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false;

  const q: Record<string, number> = {};
  String(accept).split(',').forEach((parte) => {
    const bits = parte.trim().split(';');
    const tipo = (bits.shift() ?? '').trim().toLowerCase();
    if (!tipo) return;
    let peso = 1;
    bits.forEach((p) => {
      const m = /^\s*q=([0-9.]+)\s*$/i.exec(p);
      if (m) peso = parseFloat(m[1]);
    });
    if (!(tipo in q)) q[tipo] = isNaN(peso) ? 1 : peso;
  });

  const md = q['text/markdown'];
  if (md === undefined || md === 0) return false;
  const html = q['text/html'];
  return html === undefined ? true : md >= html;
}

// Porta literal de api/404.js:120-123.
// Só navegador, que manda text/html explícito, recebe a página estilizada.
export function wantsHtml(accept: string | null | undefined): boolean {
  if (!accept) return false;
  return preferMarkdown(accept) ? false : /\btext\/html\b/i.test(String(accept));
}
