# Painel /admin mais intuitivo para editores leigos

## Context

Pedido: deixar o painel Payload em `/admin` mais intuitivo e bonito para quem não entende de sites. O caso comum é atualizar as informações rotativas, que o usuário definiu como **Oportunidades, Destaques do topo, Gestão (Quem somos) e Atalhos**. Nada é removido: as 21 globais, as coleções, os campos, as permissões e o banco ficam como estão. Muda só a apresentação: uma tela inicial guiada, a ordem e os grupos do menu, descrições em linguagem simples, rótulos de linha legíveis, o identificador técnico preenchido sozinho e a identidade visual do CADe. As configurações técnicas continuam visíveis para todos, no fim do menu, em "Configurações avançadas".

Stack: Payload 3.90.2 dentro de Next 16.4.0. Globais geradas de `cms/modelos.ts` via `cms/globals.ts`, campos construídos em `cms/campos.ts`. Nenhuma mudança pode alterar o esquema do banco: todas são de apresentação, e o passo 7 prova isso.

## Approach

### 1. Achatar campos de layout em quem percorre o esquema (pré-requisito dos passos 4 e 5)

Hoje `cms/projecao.ts` e `cms/importacao.ts` ignoram campos sem `name`. Um `collapsible` faria seus filhos sumirem do contrato público e do seed.

- Em `cms/campos.ts`, adicionar:
  ```ts
  // Campos de layout (collapsible, row) não guardam dados: os filhos ficam no mesmo nível.
  export const camposDeDados = (campos: readonly Field[]): Field[] =>
    campos.flatMap((c) => (c.type === 'collapsible' || c.type === 'row' ? camposDeDados(c.fields) : [c]))
  ```
  Não existe equivalente no repositório. `tabs` não entra porque o plano não usa abas.
- `cms/projecao.ts`:
  - linha 13: iterar `camposDeDados(campos)` em vez de `campos`;
  - linha 24: `const proprios = camposDeDados(campo.fields).filter(...)`.
  - Importar de `@/cms/campos`, que só importa tipos do `payload` e por isso é seguro em `lib/`.
- `cms/importacao.ts`: usar `camposDeDados(...)` em `ehListaDeValores` (linha 10), `temOdId` (linha 15) e no laço de `converterDados` (linha 61).
- Testes:
  - Em `test/projecao.test.ts`, um caso novo: modelo com `{ type: 'collapsible', label: 'x', fields: [{ name: 'titulo', type: 'text', required: true }] }` e um array cujas linhas têm `collapsible` em volta de `rotulo`. A saída tem `titulo` e `links[0].rotulo` no nível certo.
  - Criar `test/importacao.test.ts` com `converterDados` sobre os mesmos campos. Esperado: `{ titulo: 'A' }` preservado, e linha com `id: 'x'` vira `odId: 'x'` mesmo com `odId` dentro de `collapsible`.

### 2. Grupos, ordem e descrições das globais

- Em `cms/modelos.ts`:
  - acrescentar a `ModeloConteudo` os campos `grupo: GrupoPainel` e `descricao: string`;
  - exportar:
    ```ts
    export const gruposPainel = ['Atualize sempre', 'Página inicial', 'Outras páginas', 'Configurações avançadas'] as const
    export type GrupoPainel = (typeof gruposPainel)[number]
    ```
- Preencher cada modelo. Os rótulos marcados com "rótulo novo" substituem `rotulo`; os demais `rotulo` não mudam.

| chave | grupo | rótulo novo | descricao |
|---|---|---|---|
| dadosOportunidades | Atualize sempre | Oportunidades | Vagas, bolsas e editais da seção 05. Desmarque "Publicado" para esconder sem apagar. No dia seguinte à data de "Expira em", ela sai do site sozinha. O site mostra no máximo 12. |
| hero | Atualize sempre | Destaques do topo | Os slides que abrem a página inicial: chamada, título, botão e mascote de cada um. |
| quemSomos | Atualize sempre | Gestão e quem somos | Texto da seção 02 e os membros da gestão. Para trocar uma foto, clique na foto do membro e envie outra. |
| atalhos | Atualize sempre | Atalhos | Links rápidos da seção 07. Marque "Abrir em nova aba" para sites de fora do CADe. |
| agenda | Página inicial | (mantém) | Títulos e mensagens da seção 01. Os eventos vêm do Google Agenda, não deste painel. |
| historico | Página inicial | (mantém) | Títulos e mensagens da seção 03 (histórico). |
| lojinha | Página inicial | (mantém) | Produtos e textos da lojinha, na página inicial. |
| guia | Página inicial | (mantém) | Seção 04, guia do calouro: foto, cartões e textos da lista de materiais. Os arquivos ficam na pasta do Google Drive. |
| oportunidadesTexto | Página inicial | (mantém) | Título, introdução e botão da seção 05. As oportunidades em si ficam em "Oportunidades". |
| faq | Página inicial | (mantém) | Perguntas e respostas da seção 06. |
| formularios | Página inicial | (mantém) | Rótulos, dicas e mensagens dos formulários da seção 08. |
| inicioSeo | Configurações avançadas | (mantém) | Título e descrição da página inicial no Google e nas redes sociais. |
| paginas.sobre | Outras páginas | (mantém) | Texto da página /sobre. |
| paginas.contato | Outras páginas | (mantém) | Texto da página /contato. |
| paginas.privacidade | Outras páginas | (mantém) | Texto da página /privacidade. |
| galeria | Outras páginas | (mantém) | Textos da página /galeria. As fotos vêm da pasta do Google Drive, não deste painel. |
| site | Configurações avançadas | (mantém) | Nome, e-mail, Instagram e endereço usados no site todo e na busca do Google. Mude só se esses dados mudarem. |
| navegacao | Configurações avançadas | (mantém) | Links do menu no topo do site. Um destino errado quebra a navegação. |
| rodape | Configurações avançadas | (mantém) | Textos e links do rodapé, no fim de todas as páginas. |
| integracoes | Configurações avançadas | (mantém) | Códigos do Google Agenda e das pastas do Drive. Eventos e fotos são editados no próprio Google. |
| llms | Configurações avançadas | (mantém) | Texto lido por assistentes de IA (llms.txt). Raramente muda. |

- `cms/globals.ts`:
  - mapear sobre `[...modelos].sort((a, b) => gruposPainel.indexOf(a.grupo) - gruposPainel.indexOf(b.grupo))`. A ordenação é estável e mantém a ordem relativa de `modelos`.
  - Motivo: o Payload (`@payloadcms/ui/dist/utilities/groupNavItems.js`) ordena os grupos pela primeira aparição, primeiro nas coleções e depois nas globais.
  - Acrescentar `admin: { group: modelo.grupo, description: modelo.descricao }`.
- `payload.config.ts`:
  - `collections: [Midia, Usuarios]`, nessa ordem, para o grupo da mídia vir primeiro no menu.
- `cms/collections/midia.ts`:
  - `labels: { singular: 'Imagem', plural: 'Imagens' }`;
  - `admin: { useAsTitle: 'filename', group: 'Atualize sempre', description: 'Fotos usadas no site. PNG, JPEG ou WebP até 4 MiB, nome em minúsculas com hífen (ex.: foto-gestao-2026.png). Viram WebP sozinhas.' }`.
- `cms/collections/usuarios.ts`: sem mudança (grupo `Acesso`).
- Menu resultante: Atualize sempre (Imagens, Oportunidades, Destaques do topo, Gestão e quem somos, Atalhos) → Acesso → Página inicial → Outras páginas → Configurações avançadas.

### 3. Listas legíveis: rótulo da linha e linhas recolhidas

- Criar `cms/admin/RotuloLinha.tsx`, componente cliente:
  ```tsx
  'use client'
  import { useRowLabel } from '@payloadcms/ui'
  import { dataChave, hojeEmSaoPaulo } from '@/lib/oportunidades'

  const CHAVES = ['titulo', 'nome', 'pergunta', 'rotulo', 'valor'] as const

  export function RotuloLinha() {
    const { data, rowNumber } = useRowLabel<Record<string, unknown> | undefined>()
    const numero = String((rowNumber ?? 0) + 1).padStart(2, '0')
    const nome = CHAVES.map((c) => data?.[c]).find((v): v is string => typeof v === 'string' && v.trim() !== '')
    const avisos: string[] = []
    if (data?.publicado === false) avisos.push('oculta')
    const expira = typeof data?.expira === 'string' ? dataChave(data.expira) : null
    if (expira && expira < hojeEmSaoPaulo()) avisos.push('vencida')
    return <span>{`${numero} · ${nome ?? 'Sem título'}${avisos.length ? ` (${avisos.join(', ')})` : ''}`}</span>
  }
  ```
  - `publicado` e `expira` só existem em Oportunidades, então nas demais listas os avisos nunca aparecem.
  - Reutiliza `dataChave` e `hojeEmSaoPaulo`, a mesma regra de vencimento de `oportunidadesPublicadas`.
- Em `cms/campos.ts`, nos construtores `lista` e `listaComId` (não em `listaTextos`, cujas linhas têm um campo só), acrescentar:
  ```ts
  admin: { initCollapsed: true, components: { RowLabel: '/cms/admin/RotuloLinha#RotuloLinha' } }
  ```

### 4. Identificador técnico automático e no fim do item

- Em `cms/campos.ts`, `identificador()` passa a ser:
  ```ts
  ({
    name: 'odId', type: 'text', label: 'Identificador técnico', required: true, unique: false,
    defaultValue: () => `item-${crypto.randomUUID().slice(0, 8)}`,
    admin: { readOnly: true, description: dicaIdentificador },
    validate: validarIdentificador,
  })
  ```
  - O valor gerado casa com `padraoIdentificador` (hex minúsculo).
  - `getDefaultValue` do Payload aceita função e é usado pelo form-state ao criar linha (`@payloadcms/ui/dist/forms/fieldSchemasToFormState/calculateDefaultValues`).
- Texto de `dicaIdentificador`: `'Preenchido automaticamente e usado pelo site. Não precisa mexer.'`.
- Em `listaComId`: `fields: [...fields, identificador()]`. O identificador vai para o fim do item.
- Itens existentes mantêm o valor. O `readOnly` impede alterar pelo painel, o que reforça a regra do AGENTS.md.

### 5. Telas das globais rotativas: conteúdo primeiro, textos fixos recolhidos

- Em `cms/campos.ts`, adicionar:
  ```ts
  export const secao = (rotulo: string, fields: Field[]): CollapsibleField => ({
    type: 'collapsible', label: rotulo, admin: { initCollapsed: true }, fields,
  })
  ```
  Importar `CollapsibleField` de `payload`.
- Em `cms/modelos.ts`, sem mudar a ordem relativa dos campos:
  - `quemSomos`: envolver `eyebrow, titulo, texto, gestaoTitulo` em `secao('Título e texto da seção', [...])`; `membros` continua depois.
  - `atalhos`: envolver `eyebrow, titulo` em `secao('Título da seção', [...])`; `itens` continua depois.
  - `hero` e `dadosOportunidades`: sem `secao`; já são só a lista.
- Dicas de campo: novo helper em `cms/campos.ts`:
  ```ts
  export const comDica = <T extends Field>(campo: T, descricao: string): T =>
    ({ ...campo, admin: { ...campo.admin, description: descricao } }) as T
  ```
  Aplicar nos campos abaixo, sem mudar nomes nem tipos:
  - Oportunidades:
    - `publicado`: "Desmarque para esconder do site sem apagar."
    - `titulo`: "Até 140 caracteres."
    - `tag`: "Palavra curta acima do título, ex.: BOLSA. Vazio vira OPORTUNIDADE."
    - `resumo`: "Uma ou duas frases no cartão."
    - `texto`: "Texto completo ao abrir os detalhes. Vazio usa o resumo."
    - `cta`: "Texto do botão. Vazio vira \"Quero essa oportunidade\"."
    - `link`: "Começa com https:// ou mailto:. Vazio leva ao Instagram do CADe."
    - `expira`: "No dia seguinte a esta data, sai do site. Vazio: não expira."
  - Destaques:
    - `acento`: "Cor do detalhe do slide."
    - `ctaHref`: "Para onde o botão leva: /sobre, #area-dicas ou https://…"
    - `mascoteLargura` e `mascoteAltura`: "Medida da imagem em pixels; mantenha a proporção da mascote."
  - Gestão: `enquadramento`: "Ex.: Presidência, Comunicação."
  - Atalhos: `href`: "Para onde o atalho leva: /sobre, #area-dicas ou https://…"

### 6. Tela inicial guiada e identidade visual

- Criar `cms/admin/PainelInicio.tsx`, componente de servidor:
  - Assinatura: `export async function PainelInicio({ payload, user }: ServerProps)`, com `import type { ServerProps } from 'payload'`.
  - Dados: `payload.findGlobal({ slug: 'oportunidades-dados', depth: 0 })` e `payload.findGlobal({ slug: 'configuracao-site', depth: 0 })`.
  - Contagem de Oportunidades, com `hoje = hojeEmSaoPaulo()` e `expira = item.expira ? dataChave(item.expira) : null`:
    - `ocultas` = itens com `publicado === false`;
    - `vencidas` = itens publicados com `expira < hoje`;
    - `noSite` = publicados, não vencidos e com `titulo.trim()` não vazio (sem o limite de 12).
    - Texto: as partes não nulas, em ordem, unidas por " · ": `N no site`, `N vencida(s)`, `N oculta(s)`. Lista vazia: "Nenhuma cadastrada".
  - Markup (classes com prefixo `cade-painel`; `data-od-id` em seção, título e cartões):
    - `<section className="cade-painel" data-od-id="painel-inicio">`.
    - `<h2 data-od-id="painel-titulo">`: `Olá, ${primeiroNome}. O que você quer atualizar hoje?`. `primeiroNome` = primeira palavra de `user.nome`. Sem nome: "Olá. O que você quer atualizar hoje?".
    - `<p>`: "Escolha um cartão, mude o que precisar e clique em Salvar. O site mostra a mudança logo depois."
    - Link "Abrir o site" para `site.url`, com `target="_blank" rel="noopener noreferrer"`.
    - Grade com 5 cartões `next/link`. Cada cartão tem faixa colorida, título, descrição e, no rodapé fixo, o texto "Abrir". `href` = `${payload.config.routes.admin}/globals/<slug>` ou `/collections/midia`:

      | ordem | cartão | slug | faixa | descrição |
      |---|---|---|---|---|
      | 1 | Oportunidades | `oportunidades-dados` | `--verde` | "Vagas, bolsas e editais." + a contagem acima |
      | 2 | Destaques do topo | `inicio-hero` | `--ciano` | "Os slides que abrem a página inicial." |
      | 3 | Gestão e quem somos | `inicio-quem-somos` | `--amarelo` | "Nomes e fotos dos membros da gestão." |
      | 4 | Atalhos | `inicio-atalhos` | `--rosa` | "Links rápidos da seção 07." |
      | 5 | Imagens | `midia` (coleção) | `--azul` | "Envie fotos antes de usar ou direto no campo de foto." |

    - Nota final: "O resto (textos das seções, outras páginas e configurações) continua no menu. Em \"Configurações avançadas\", só mexa se souber o que está fazendo."
- Criar `cms/admin/Marca.tsx` com dois componentes:
  - `Logo`: `<img src="/assets/logo-cade.svg" alt="CADe UFPel" width={150} height={72} />`;
  - `Icone`: `<img src="/assets/logo-cade.svg" alt="" width={50} height={24} />`.
- `payload.config.ts`, dentro de `admin`:
  ```ts
  components: {
    beforeDashboard: ['/cms/admin/PainelInicio#PainelInicio'],
    graphics: { Logo: '/cms/admin/Marca#Logo', Icon: '/cms/admin/Marca#Icone' },
  },
  meta: { titleSuffix: ' · Painel CADe', icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/assets/favicon.svg' }] },
  ```
  - Os cartões padrão do Payload continuam abaixo da tela guiada.
  - `theme` fica no padrão: o modo escuro continua existindo.
- Criar `app/(payload)/painel.css` e importar em `app/(payload)/layout.tsx` logo após `import '@payloadcms/next/css'`. Conteúdo:
  - `@font-face` de LTSuperior nos pesos 400, 600 e 700, com as mesmas URLs de `app/styles/base.css` (linhas 4–19).
  - Um `:root` com o comentário "espelha app/styles/base.css", só com os tokens usados: `--navy`, `--navy-hover`, `--ciano`, `--verde`, `--amarelo`, `--azul`, `--rosa`, `--bg-cade`, `--r-card`. Fora desse `:root`, nenhum hex solto.
  - `:root{--font-body:'LTSuperior',system-ui,sans-serif}`.
  - `html[data-theme='light']{--theme-bg:var(--bg-cade);--theme-text:var(--navy);--theme-elevation-800:var(--navy);--theme-elevation-900:var(--navy-hover);--theme-elevation-1000:var(--navy)}`.
  - O CSS do Payload está em `@layer payload-default`, então estas regras sem camada vencem.
  - `.cade-painel`:
    - `max-width:1100px`, `margin-bottom:48px`;
    - título 28px peso 700, `letter-spacing:-.01em`, `text-wrap:balance`;
    - parágrafo e nota final: `max-width:62ch`, `font-size:16px`, `line-height:1.5`, `color:var(--theme-elevation-800)`, `opacity:.8` (funciona nos dois temas).
  - Grade dos cartões:
    - `display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px`.
  - Cartão:
    - `background:var(--theme-elevation-0);color:var(--theme-text);border:1px solid var(--theme-elevation-150);border-radius:var(--r-card)`;
    - `display:flex;flex-direction:column;gap:8px;padding:20px;text-decoration:none`;
    - faixa: `::before` com 6px de altura, cor da variável `--faixa` definida por modificador de classe (`.cade-painel__card--verde{--faixa:var(--verde)}` etc.);
    - "Abrir" com `margin-top:auto` e peso 700.
  - Estados (sempre par fundo+texto):
    - hover: `border-color:var(--theme-elevation-800)` + `transform:translateY(-2px)`, `transition:transform .2s ease,border-color .2s ease`;
    - `:active` com `translateY(0)`;
    - `:focus-visible` com `outline:3px solid var(--theme-elevation-800);outline-offset:2px`;
    - `@media (prefers-reduced-motion:reduce)` sem transform.

### 7. Arquivos gerados e prova de que o esquema não mudou

Depois dos passos 1–6:
- `npm run cms:importmap`: atualiza `app/(payload)/admin/importMap.js` com `RotuloLinha`, `PainelInicio`, `Logo` e `Icone`. Não editar à mão.
- `npm run cms:types`: diferença esperada em `payload-types.ts` = nenhuma ou só a ordem do `odId`. Versionar o que sair.
- `npm run cms:migrate:create` contra um banco já migrado: esperado "No schema changes detected".

## Critical files & anchors

- `cms/campos.ts` — construtores `lista`, `listaComId`, `identificador` e o novo `camposDeDados`/`secao`/`comDica`. Afetam as 21 globais de uma vez.
- `cms/projecao.ts:13,24` e `cms/importacao.ts:10,15,61` — laços que hoje descartam campos sem `name`.
- `cms/globals.ts` — mapeamento modelo → `GlobalConfig`; ordenação por grupo.
- `payload.config.ts` — `admin.components`, `admin.meta`, ordem de `collections`.
- `app/(payload)/layout.tsx` — import do `painel.css`.

## Verification

Diretório: raiz do repo. Node 24. PostgreSQL local descartável, no mesmo padrão já usado neste projeto:
- `@embedded-postgres/windows-x64` instalado em `scratch/pg`, `initdb`, `postgres.exe -p 55433`;
- launcher `scratch/pg/run.mjs` que injeta `DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55433/cade`, `PAYLOAD_SECRET` de 40 caracteres, `PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000`, `BLOB_READ_WRITE_TOKEN=''`, `CMS_UPLOAD_LOCAL=true`, `RESEND_API_KEY=re_fake`, `CMS_EMAIL_REMETENTE=cms@cadeufpel.com`, `CMS_ADMIN_EMAIL`/`CMS_ADMIN_PASSWORD` de teste, e chama `node_modules/next/dist/bin/next` ou `node_modules/payload/bin.js`.
- Nunca usar o `.env.local`, que tem valores de produção.

1. **Contrato público intacto**, antes de editar (commit atual):
   - criar banco `cade`, `run.mjs payload migrate`, `run.mjs payload run scripts/cms-seed.ts`, `run.mjs next build`, `run.mjs next start`;
   - salvar `curl -s -H 'Accept: text/markdown' localhost:3000/` em `scratch/antes.md` e `curl -s localhost:3000/api/oportunidades` em `scratch/antes.json`.
   - Depois das mudanças, mesmo banco: rebuild e start, gerar `depois.*`. Esperado: `diff` vazio nos dois.
2. **Esquema**: `run.mjs payload migrate:create checagem` → "No schema changes detected". Nenhum arquivo novo em `cms/migrations/`.
3. **Testes**: `npm test` (inclui os casos novos do passo 1) e `npm run typecheck`, ambos verdes. `npm run build` com as env do launcher passa.
4. **Painel no navegador** (1280px e 390px), após login com o admin do seed:
   - `/admin` mostra "Olá. O que você quer atualizar hoje?" e 5 cartões na ordem da tabela do passo 6, cada `href` abre a tela certa.
   - O cartão Oportunidades mostra a contagem real: conferir com o seed; ex.: se todas publicadas e não vencidas, "N no site".
   - Sem rolagem horizontal em 390px. Fonte computada do `body` contém `LTSuperior`.
   - Menu na ordem: Atualize sempre, Acesso, Página inicial, Outras páginas, Configurações avançadas. Nenhuma das 21 globais nem das 2 coleções sumiu (contar 23 links).
   - Em Oportunidades:
     - linhas recolhidas com "01 · <título>";
     - desmarcar "Publicado" de um item → rótulo ganha "(oculta)";
     - pôr "Expira em" no passado → "(vencida)";
     - salvar e conferir que `/api/oportunidades` não lista mais o item.
     - Reverter.
   - Em Atalhos:
     - "Título da seção" recolhido;
     - "Adicionar Atalho" cria linha com "Identificador técnico" já preenchido `item-xxxxxxxx` e somente leitura;
     - preencher título, subtítulo e destino `/sobre` e salvar sem erro;
     - a home tem `data-od-id="item-xxxxxxxx"`.
     - Remover a linha e salvar.
   - Modo escuro (perfil → tema escuro): cartões legíveis, texto e fundo vindos das variáveis do Payload.
5. **AGENTS.md item 6** em `next start`:
   - `/` com `Accept: text/html` → 200 e `Vary` contendo `accept`;
   - `/` com `Accept: text/markdown` → 200 `text/markdown`;
   - `/rota-inexistente` → 404 em HTML e em Markdown.

## Assumptions & contingencies

- Se o passo de verificação 2 gerar migração por causa da nova posição do `odId` (passo 4): apagar os arquivos gerados, voltar para `fields: [identificador(), ...fields]` e repetir. A dica e o `readOnly` continuam.
- Se uma linha nova de Atalhos vier com o identificador vazio ou o salvamento falhar com "Identificador" obrigatório:
  1. primeiro tirar `readOnly` (mantendo `defaultValue`) e testar de novo;
  2. se ainda vier vazio, acrescentar a `identificador()` `hooks: { beforeValidate: [({ value }) => value || \`item-${crypto.randomUUID().slice(0, 8)}\`] }`.
- Se `html[data-theme='light']` não existir no DOM do admin (conferir no passo de verificação 4): aplicar as mesmas variáveis em `:root` e manter `[data-theme='dark']` sem override.
- Agenda e fotos da galeria não ganham cartão próprio (o usuário não as escolheu como rotativas). As descrições das globais Agenda e Galeria dizem que o conteúdo vem do Google.
