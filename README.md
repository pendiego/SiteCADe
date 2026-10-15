<p align="center"><img src="public/assets/logo-cade.svg" alt="CADe UFPel" width="140"></p>

# CADe UFPel

Site do Centro Acadêmico de Design da UFPel, migrado do Figma. Next.js 16.4.0 (App Router), React e TypeScript, com o CSS global original e conteúdo editável pelo Sveltia CMS.

**Ao vivo:** [cadeufpel.com](https://cadeufpel.com). A migração é desenvolvida na branch `next-cms`; a publicação depende da revisão e do merge em `main`.

## Desenvolvimento

Requer Node.js **24.x**.

```sh
npm ci
npm run dev
```

Abra `http://localhost:3000`. Para verificar a versão de produção:

```sh
npm test
npm run typecheck
npm run build
npm start
```

O `postinstall` aplica uma correção específica ao Next 16.4.0 para preservar o `Vary: Accept` do proxy nas respostas HTML. O bug upstream está descrito no [PR #92058](https://github.com/vercel/next.js/pull/92058). `scripts/patch-next-vary.cjs` trata os templates CommonJS e ESM usados pelo runtime Node, é idempotente e falha se a versão ou o template mudar. Antes de atualizar o Next, reavalie a correção com uma requisição HTTP real; não basta testar `proxy()` isoladamente. O projeto não usa runtime Edge nas páginas.

## Estrutura

| Caminho | Responsabilidade |
|---|---|
| `app/page.tsx` | Home com quatro áreas e as seções originais |
| `app/{sobre,contato,privacidade,galeria}/page.tsx` | Páginas públicas |
| `components/` | Markup React e interatividade; componentes cliente apenas onde necessário |
| `app/styles/` | CSS global na ordem original da cascata |
| `content/**/*.json` | Copy, SEO, navegação, integrações, membros, produtos e oportunidades |
| `lib/conteudo.ts`, `lib/tipos.ts` | Imports estáticos tipados; conteúdo incompatível impede o build |
| `lib/md-paginas.ts`, `app/*.md/route.ts` | Representações Markdown geradas a partir do mesmo conteúdo |
| `proxy.ts` | Negociação de `Accept` e 404 Markdown para clientes programáticos |
| `app/api/` | Formulários Resend, oportunidades públicas, 404 e OAuth GitHub |
| `public/admin/` | Sveltia CMS e configuração das coleções |
| `public/assets/` | Fontes, marca e imagens; uploads organizados por gestão, produtos e guia |
| `public/robots.txt`, `public/sitemap.xml` | Arquivos públicos de indexação |
| `next.config.ts`, `vercel.json` | Redirects, headers, `/admin` e preset Next.js da Vercel |
| `test/` | Contratos públicos, conteúdo/CMS e segurança de Markdown/OAuth |

As fontes LT Superior e Material Symbols continuam self-hosted. Fotos da gestão e produtos usam `next/image`; o Google Calendar e o Google Drive continuam sendo consultados no navegador. A chave Google é pública e restrita por referenciador, como antes; não é credencial OAuth.

## Conteúdo e CMS

Abra `/admin`. O Sveltia é carregado pelo script oficial do unpkg, sem build separado. As coleções são Configurações, Página inicial, Oportunidades e Páginas. Os rótulos dos campos estão em pt-BR.

- **GitHub:** o CMS grava em `pendiego/SiteCADe`, branch `main`. Editores precisam de permissão **Write**. Um salvamento gera commit e aciona o deploy da Vercel.
- **Local:** no Chrome/Edge, use “Work with Local Repository” e selecione a raiz deste repositório. Com `npm run dev` ativo, os JSON salvos são refletidos no HTML e no Markdown. A escolha da pasta exige o diálogo nativo do navegador.
- **Preview da Vercel:** o popup OAuth entrega tokens apenas para `https://cadeufpel.com`. Use “Sign In Using Access Token” no preview, com um PAT de acesso ao repositório.
- **Imagens:** uploads são limitados a 5 MiB, nomes convertidos para slug e imagens raster transformadas em WebP (qualidade 85, até 2048 × 2048). Pastas específicas por campo: gestão, produtos, guia e hero.
- **IDs:** não altere identificadores técnicos de itens existentes; eles são os `data-od-id` públicos. `mascoteAlt` pode ficar vazio para imagens decorativas, preservando a acessibilidade original.

Markdown editável aceita negrito, itálico e links. HTML bruto é escapado e links executáveis são recusados. As representações `/index.md`, `/sobre.md`, `/contato.md`, `/privacidade.md` e `/galeria.md` são geradas do conteúdo; `/llms.txt` vem de `content/llms.json`.

## Oportunidades

Edite a coleção **Oportunidades**, que salva `content/oportunidades.json`. A origem deixou de ser uma planilha. Foi migrada uma oportunidade publicada; como o endpoint antigo não expõe a data de expiração, o campo `expira` começa vazio.

| Campo | Regra |
|---|---|
| `publicado` | Desmarcado: item não aparece |
| `titulo` | Obrigatório; até 140 caracteres na resposta pública |
| `tag` | Até 24 caracteres, em maiúsculas; vazio vira `OPORTUNIDADE` |
| `cor` | `verde`, `amarelo` ou `ciano` |
| `resumo` / `texto` | Texto do card e popup; popup usa o resumo se vazio |
| `cta` / `link` | Rótulo e destino do botão; vazio/inválido usa os padrões públicos |
| `expira` | Data inclusiva, comparada ao dia em São Paulo; vazio não expira |

Home e `/index.md` revalidam a cada hora. `/api/oportunidades` mantém o contrato JSON `{ atualizado, oportunidades }`, limitado a 12 itens, com cache CDN de 5 minutos.

## Formulários e OAuth

Variáveis de ambiente configuradas na Vercel, nunca versionadas:

| Variável | Uso |
|---|---|
| `RESEND_API_KEY` | Obrigatória para enviar formulários |
| `RESEND_TO` | Destinatário; padrão `cadesignufpel@gmail.com` |
| `RESEND_FROM` | Remetente; padrão `CADe UFPel <naoresponda@cadeufpel.com>` (domínio verificado no Resend) |
| `GITHUB_CLIENT_ID` | OAuth App do CMS |
| `GITHUB_CLIENT_SECRET` | Segredo do OAuth App do CMS |

Os formulários mantêm honeypot, envio anônimo, validação e mensagens originais. O OAuth usa cookie CSRF HttpOnly, Secure, SameSite=Lax e expiração de 10 minutos. O token não é registrado no servidor e só é entregue ao popup com a origem de produção.

## Publicação — ações do dono do projeto

1. Criar um GitHub OAuth App: Homepage `https://cadeufpel.com`; callback `https://cadeufpel.com/api/cms/callback`.
2. Configurar `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` em Production e Preview da Vercel. Manter `RESEND_*` e remover a variável da planilha antiga.
3. Conceder Write aos editores em `pendiego/SiteCADe`.
4. Abrir PR `next-cms` → `main`; validar o preview, incluindo upload WebP e edição local do CMS; só então fazer merge.
5. Em produção, entrar com GitHub em `/admin`, salvar um texto e confirmar commit e novo deploy. Estes passos não são realizados automaticamente pelo agente.

O `vercel.json` seleciona o preset `nextjs`. Os aliases e hosts antigos continuam redirecionando para o domínio canônico sem `www`. Se a otimização de imagens da Vercel estiver indisponível, configure `images: { unoptimized: true }` no Next apenas após confirmar essa limitação.

## Verificação

A suíte cobre negociação, oportunidades e expiração, redirects, SEO, arquivos públicos, correspondência recursiva entre CMS e JSON, envio e OAuth. Além dela, exercite o build servido por `npm start`:

```sh
curl -i -H "Accept: text/markdown" http://localhost:3000/sobre
curl -I -H "Accept: text/html" http://localhost:3000/sobre
curl -i http://localhost:3000/nao-existe
curl -I http://localhost:3000/admin
```

HTML deve conter `Vary: Accept` (também pode incluir headers internos do Next), link alternativo Markdown e ajuda para agentes. Caminho inexistente retorna 404, em Markdown por padrão ou HTML quando solicitado.

Confira os breakpoints 1180, 900, 720 e 400px, além de 390px, sem overflow horizontal. Verifique hero, navegação sem hash, FAQ, modais e devolução de foco, agenda, galeria, gestão e estados dos formulários. Capturas da migração ficam em `scratch/baseline/` e `scratch/next/`, ignoradas pelo Git.

## Contribuição e CodeGraph

Leia `AGENTS.md`. Copy oficial vem do Figma e deve ser preservada; use os tokens, Material Symbols por codepoint e identificadores estáveis. Não adicione analytics, pixels, beacons ou scripts externos de telemetria.

`codegraph.config.json` inclui HTML, CSS, JavaScript, TypeScript/TSX e Markdown, excluindo assets públicos, `.next/`, dependências, segredos e scratch. Confirme `codegraph version` e `codegraph --help` antes de consultar. Use MCP/CLI somente leitura, sem `init`/`index` sem autorização; confira `analysis`/`freshness`. A configuração MCP é do ambiente do agente e não deve ser alterada por uma tarefa do site.
