# CADe UFPel — landing page

Página única do Centro Acadêmico de Design da UFPel, migrada de um design Figma.

## Arquivos

- `app/` — Next.js 16.4.0, App Router e TypeScript. `page.tsx` é a home; rotas públicas `/sobre`, `/contato`, `/privacidade` e `/galeria` têm seu próprio `page.tsx`. `layout.tsx` importa CSS global e define fontes/metadados comuns.
- `components/` — markup React portado do site original. `'use client'` apenas para estado/efeitos; nenhuma IIFE legada.
- `content/**/*.json` — fonte única de copy e configuração editável no Sveltia CMS. `lib/tipos.ts` e `lib/conteudo.ts` tipam os imports estáticos.
- `lib/md-paginas.ts` e `app/*.md/route.ts` — representações Markdown geradas do conteúdo. `app/llms.txt/route.ts` usa `content/llms.json`.
- `app/styles/` — estilos globais mantidos: `base`, `nav`, `hero`, `agenda`, `secoes`, `componentes`, `icons`, `responsivo`, `institucional`, `galeria`, nessa ordem.
- `public/assets/` — marca e fontes self-hosted; imagens CMS em `uploads/{gestao,produtos,guia,hero}/`. Caminhos públicos absolutos `/assets/...`; nomes ASCII/kebab-case minúsculos. Gestão e produtos usam `next/image`, sem variantes manuais.
- `public/admin/` — Sveltia CMS via unpkg oficial e YAML das coleções. Backend `pendiego/SiteCADe@main`; os `name` de campos devem corresponder exatamente ao modelo JSON.
- `app/api/` — formulários Resend, oportunidades do CMS, 404 Markdown e OAuth GitHub. Credenciais só em env vars.
- `proxy.ts` — negociação de `Accept`; `next.config.ts` — redirects, headers e rewrite de `/admin`; `vercel.json` — preset `nextjs`.
- `scripts/patch-next-vary.cjs` — correção reproduzível do bug de Vary do Next 16.4.0 no postinstall; reavaliar antes de atualizar a versão.
- `test/` — contratos públicos e segurança, executados com `npm test` (Vitest).

Fonte do design: Figma `fFejL7f3oqdLNoPUqCwzD0` (arquivo "CADe - Landing Page"). Os textos oficiais vêm de lá — não invente copy.

## Regras

- **Idioma:** todo texto visível em pt-BR.
- **Tokens:** só as variáveis de `:root` (`--navy`, `--ciano`, `--verde`, `--amarelo`, `--rosa`, `--bg-*`, `--gut`, `--sec-y`, `--r-*`). Nunca hex solto no CSS novo.
- **Tipografia:** LT Superior (self-hosted em `public/assets/font/`, formato `.woff2`) para tudo.
- **`data-od-id`:** cada seção, heading, CTA, controle e card repetido tem um id kebab-case único. Mantenha ao editar e adicione em elementos novos.
- **Dependências:** Next.js, React, TypeScript e marked são a stack aprovada. Não adicione framework, CDN ou biblioteca de animação sem pedido; a única CDN de JS é o Sveltia em `/admin`. Node alvo: 24.x.
- **Ícones (Material Symbols):** todo ícone de UI é `<span className="m-icon" aria-hidden="true">{'\ue5c8'}</span>` com o codepoint PUA do subset self-hosted em `public/assets/font/`. Não use ligaduras de texto. Tamanho por `font-size` (`.m-icon` = 20px; modificadores `.m-icon--16`, `.m-icon--18`), nunca `width`/`height`. `aria-hidden` é obrigatório. Ícones são estáticos; cor padrão `currentColor`, marca fixa via token.
  - **Glifo novo:** o subset só traz os codepoints em uso. Adicionar ícone exige re-subsetar a fonte incluindo o novo codepoint, senão ele renderiza como retângulo vazio.
  - **Logos de marca** (GitHub, Instagram) não existem no Material Symbols: seguem SVG inline com `class="brand-icon"`.
- **Não use `scrollIntoView`** — quebra o preview embutido.
- **`body{overflow-x:clip}`** é deliberado: `hidden` mataria o `position:sticky` da nav.
- **Sem telemetria nem analytics:** o site não usa ferramentas de analytics (nem Vercel Web Analytics nem Speed Insights), nem pixels, nem cookies de terceiros ou de rastreamento. Não adicione scripts externos, coletores de eventos (`cadeMedir`), inicializadores de telemetria (`window.va`, `window.si`) ou beacons.

## Estrutura

Quatro `div.area` com fundo próprio, cada uma com uma `.faixa` colorida no topo:

| Área | id | Seções |
|---|---|---|
| CADe | `#area-cade` | hero, 01 agenda, 02 quem somos, 03 histórico, lojinha |
| Calouros | `#area-calouros` | 04 guia do calouro (foto à esquerda + 4 cards) |
| Dicas | `#area-dicas` | 05 oportunidades (`content/oportunidades.json`, editável pelo CMS), 06 FAQ, 07 atalhos |
| Formulários | `#area-formularios` | 08 fale com a gente (dois forms) |

A nav marca a área ativa via `aria-current="page"` (bolinha rosa em `::before`), calculada por listener de scroll com a constante `FOLGA` como margem de erro para áreas curtas.

## Ao alterar

1. Edite o arquivo no lugar; não reconstrua de memória.
2. Mude só o que foi pedido — o resto da copy e dos tokens é contrato.
3. Cheque os breakpoints existentes: 1180px, 900px, 720px e 400px. Sem scroll horizontal no mobile.
4. Estados `hover`/`focus-visible` sempre com par fundo+texto definido; contraste nunca cai.
5. **Sem telemetria:** não reintroduza bibliotecas, coletores de eventos ou scripts analíticos.
6. **Verificação:** execute `npm test`, `npm run typecheck` e `npm run build`. Exercite o build com `npm start`: HTML deve preservar `Vary: Accept`, negociação Markdown e status 404. Testes isolados do proxy não detectam sobrescritas de headers pelo Next.

## CodeGraph para agentes

O repositório inclui `codegraph.config.json` como configuração de descoberta. Ela
mantém no grafo HTML, CSS, JavaScript, TypeScript/TSX e Markdown, e exclui
`public/assets/`, `.next/`, fontes, imagens, binários, `.env*`, `node_modules/`,
`.vercel/`, `.codegraph/` e `scratch/`. O `.gitignore` continua sendo aplicado.
Leia configurações e arquivos públicos de rota ao vivo quando necessários.

Antes de uma consulta, confirme a versão e a sintaxe realmente instaladas:

```sh
codegraph version
codegraph --help
```

Na CLI 2.3.20 observada durante a migração, consultas usam `--root .`, por exemplo:

```sh
codegraph orient --root . --budget small --json
codegraph explore "Accept markdown proxy 404" --root .
codegraph deps app/api/enviar/route.ts --root .
codegraph rdeps app/page.tsx --root .
```

Prefira MCP quando disponível. Consultas são evidência estrutural, não prova de runtime.

`codegraph init`/`index` criam ou atualizam estado em `.codegraph/`; só execute
isso quando a tarefa pedir indexação. Consultas são somente leitura. Verifique
`analysis.mode`/`backend` (ou `freshness` via MCP) e trate resultados
`reduced`, `mixed` ou `stale` como evidência limitada.

## Codex e Claude Code

A integração MCP de Codex e Claude Code é configuração do ambiente do agente,
não deste site. Não edite arquivos fora do repositório a partir de uma tarefa
do site. Para pré-visualizar a configuração, sem gravar nada:

```sh
codegraph install --print-config codex
codegraph install --print-config claude
```

Se a equipe autorizar a instalação no ambiente do agente, faça primeiro um
dry-run e confirme a versão que oferece essa opção:

```sh
codegraph install --target codex,claude --dry-run
```

Use MCP por stdio para manter o servidor no repositório correto; não exponha
uma porta pública. Reinicie o cliente Codex/Claude após instalar ou atualizar
o CodeGraph. O agente ainda deve ler os arquivos ao vivo para copy e configuração
(`codegraph file`/`get_file` na CLI moderna) antes de tomar decisões.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
