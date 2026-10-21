const fs = require('node:fs');
const path = require('node:path');

// Next 16.4.0 sobrescreve o Vary do proxy nas páginas App Router.
// Correção upstream: https://github.com/vercel/next.js/pull/92058
const pacote = require.resolve('next/package.json');
const versao = JSON.parse(fs.readFileSync(pacote, 'utf8')).version;
if (versao !== '16.4.0') {
  throw new Error(`Reavalie a correção de Vary antes de usar Next ${versao}.`);
}
const original = "res.setHeader('Vary', varyHeader);";
const corrigido = "res.setHeader('Vary', [...new Set([].concat(res.getHeader('Vary') || [], varyHeader).join(',').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean))].join(', '));";
for (const relativo of ['dist/build/templates/app-page-runtime.js', 'dist/esm/build/templates/app-page-runtime.js']) {
  const arquivo = path.join(path.dirname(pacote), relativo);
  const fonte = fs.readFileSync(arquivo, 'utf8');
  if (fonte.includes(corrigido)) continue;
  if (fonte.split(original).length !== 2) {
    throw new Error(`Template Next inesperado (${relativo}): correção de Vary não aplicada.`);
  }
  fs.writeFileSync(arquivo, fonte.replace(original, corrigido));
}
console.log('Next 16.4.0: Vary do proxy preservado nas páginas App Router (Node).');
