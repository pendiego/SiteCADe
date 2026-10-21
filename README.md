<p align="center"><img src="public/assets/logo-cade.svg" alt="CADe UFPel" width="140"></p>

# CADe UFPel

Site do Centro Acadêmico de Design da UFPel, migrado do Figma. Next.js 16.4.0 (App Router), React e TypeScript, com o CSS global original e conteúdo editável pelo **Payload CMS** (`/admin`) com login individual por e-mail e senha.

**Ao vivo:** [cadeufpel.com](https://cadeufpel.com). A migração é desenvolvida na branch `next-cms`; a publicação depende da revisão e do merge em `main`.

## Como o conteúdo funciona

O painel e o site rodam no **mesmo projeto Next.js**. Todo o texto editável vive no **PostgreSQL**; imagens enviadas vão para o **Vercel Blob**. Ao salvar no painel o cache é invalidado e o site, o Markdown (`/index.md`, `/sobre.md`…), os metadados e `/api/oportunidades` mudam na hora. **Salvar não gera commit no GitHub.** O código (campos, permissões, componentes) continua versionado neste repositório.

Os arquivos `cms/seed/**/*.json` são só a **carga inicial**: `npm run cms:seed` importa esse conteúdo para um banco vazio e não toca em nada que já exista. Depois disso, edite pelo painel, não pelos JSON.

### Gestão: home e /sobre leem da mesma lista

A lista **Membros da gestão** (painel → *Gestão e quem somos*) alimenta o carrossel da home, a seção da página `/sobre` e o `/sobre.md`. Cada membro tem nome, foto, enquadramento, **Cargo** (opcional) e **Faz parte da coordenação**. Quem está marcado aparece em "Coordenação" (foto grande e cargo); os demais, em "Membros". A ordem é a da lista no painel: arraste para reordenar.

Em `/sobre`, o bloco aparece depois da seção cujo **Estilo** é `Gestão` (painel → *Sobre* → Seções). Em um banco que já existe, o seed não roda de novo: depois de `npm run cms:migrate`, escolha o estilo `Gestão` nessa seção, marque a coordenação e preencha os cargos no painel. Enquanto ninguém estiver marcado, todos aparecem em "Membros".

Estilos de seção nas páginas institucionais (painel → *Sobre*, *Contato* ou *Privacidade* → Seções → Estilo): `Texto` (padrão), `Canais` (lista de contatos com filete rosa), `Lista` (itens `- **Título** — descrição` viram título à esquerda e descrição à direita, sem o travessão) e `Gestão` (acrescenta a coordenação e os membros depois do texto da seção). Em bancos existentes, escolha o estilo no painel depois do `npm run cms:migrate`.

## Desenvolvimento

Requer Node.js **24.x** e um PostgreSQL acessível.

```sh
npm ci
cp .env.example .env.local     # ou defina as variáveis abaixo no ambiente
npm run cms:migrate            # cria as tabelas
npm run cms:seed               # importa o conteúdo inicial e cria o 1º administrador
npm run dev
```

Painel: `http://localhost:3000/admin`. Verificação completa:

```sh
npm test && npm run typecheck && npm run build && npm start
```

O `postinstall` aplica uma correção específica ao Next 16.4.0 para preservar o `Vary: Accept` do proxy ([PR #92058](https://github.com/vercel/next.js/pull/92058)); ele falha se a versão ou o template do Next mudar. Reavalie com uma requisição HTTP real antes de atualizar o Next.

### Variáveis de ambiente

| Variável | Obrigatória | Uso |
|---|---|---|
| `DATABASE_URL` | sim | Conexão PostgreSQL |
| `PAYLOAD_SECRET` | sim | Segredo longo e aleatório (sessões/JWT). Sem valor padrão |
| `PAYLOAD_PUBLIC_SERVER_URL` | produção | Origem canônica (`https://cadeufpel.com`); defina **só em Production**. No preview da Vercel (`VERCEL_ENV=preview`) é ignorada e vale a `VERCEL_URL`, para que links de e-mail e URLs do admin apontem para o próprio preview. Em dev, `http://localhost:3000` |
| `BLOB_READ_WRITE_TOKEN` | produção | Armazenamento de imagens. Sem ele, o upload falha em produção |
| `CMS_ADMIN_EMAIL`, `CMS_ADMIN_PASSWORD` | só no seed | Primeiro administrador. Sem padrões; o seed nunca altera uma conta existente |
| `CMS_UPLOAD_LOCAL` | dev | `true` grava imagens em `cms/media-local/` (ignorado pelo Git e proibido em produção) |
| `RESEND_API_KEY` | produção | Chave do Resend: formulários (`/api/enviar`) e e-mails do CMS (recuperação de senha). Em produção o boot falha sem ela |
| `CMS_EMAIL_REMETENTE` | produção | Remetente **verificado no Resend** dos e-mails do CMS (ex.: `cms@cadeufpel.com`). Em produção o boot falha sem ele |
| `RESEND_TO`, `RESEND_FROM` | não | Destinatário (padrão `cadesignufpel@gmail.com`) e remetente (padrão `CADe UFPel <naoresponda@cadeufpel.com>`) dos formulários |
| `CMS_VERIFICACAO_EMAIL` | não | `true` exige verificação de e-mail em novas contas (por padrão as contas são criadas por um administrador) |

### Formulários (`/api/enviar`)

| Proteção | Comportamento |
|---|---|
| Origem | Só aceita POST com `Origin` ou `Referer` do mesmo host; senão 403. Barreira leve: um script pode forjar o cabeçalho |
| Tamanho | Corpo acima de 20.000 caracteres dá 413, checado pelo `Content-Length` e também pelo corpo já lido (cobre POST sem `Content-Length`) |
| Campos | Limites: nome 120, e-mail 254, semestre 40, área 200, tipo 30, assunto 150, mensagem 5.000, contato 200. Excesso, tipo errado ou e-mail inválido dão 400. Os `maxLength` de `components/Formularios.tsx` espelham esses valores |
| Taxa | 5 envios por IP a cada 10 minutos; o 6º dá 429 com `Retry-After`. Contador em memória por instância serverless: freia abuso simples, não um ataque distribuído. Para isso, configure uma regra de rate limit no Firewall da Vercel para `/api/enviar` |
| Honeypot | Campo `empresa` preenchido finge sucesso e não envia |
| Saída | Todos os campos passam por `escapeHtml`; quebras de linha são removidas do assunto |

Os testes estão em `test/api-enviar.test.ts`.

### Chaves públicas do Google

A home e `/galeria` carregam Agenda (Calendar) e galeria (Drive) direto do navegador com uma chave `AIzaSy…`, visível a qualquer visitante. No Google Cloud Console, mantenha essa chave restrita a referenciadores `cadeufpel.com/*` e `www.cadeufpel.com/*` e apenas às APIs Calendar e Drive. Se ela vazar sem restrição, gere outra.

## Acesso e permissões

- Login **individual** por e-mail e senha (sessões revogáveis, cookie `HttpOnly`, bloqueio de 15 min após 5 falhas, JWT fora do corpo das respostas). Sem GitHub, Google ou tokens compartilhados.
- **Não existe cadastro público.** Só administradores criam usuários, no painel (Acesso → Usuários).
- **Administrador:** edita conteúdo, gerencia usuários, papéis e ativação.
- **Editor:** edita conteúdo e mídia e o próprio perfil; não vê outros usuários, não promove papel, não cria contas.
- Desativar um usuário derruba as sessões e bloqueia novo login. Conteúdo e imagens públicas são de leitura aberta; qualquer escrita exige conta ativa.
- **Recuperação de senha:** o link "Esqueceu a senha?" envia um e-mail pelo Resend (válido por 1 h, um pedido por minuto). Por isso `RESEND_API_KEY` e `CMS_EMAIL_REMETENTE` são obrigatórios em produção; sem eles o link não funcionaria. Em desenvolvimento sem chave, o envio falha de forma explícita.
- Uploads: PNG, JPEG ou WebP, até **4 MiB**, nome em `kebab-case`, convertidos para WebP e limitados a 2048 × 2048. SVG é recusado. Todo upload passa pelo servidor (validação e conversão); as imagens são servidas por URL direta do Blob. **Limite da plataforma:** a Vercel rejeita corpos de requisição acima de ~4,5 MB (HTTP 413) antes de o Payload rodar. Entre 4 MiB e ~4,5 MB o painel mostra a nossa mensagem clara; acima disso o erro é genérico. Fotos de celular costumam passar disso: reduza ou exporte em WebP antes de enviar.

## Estrutura

| Caminho | Responsabilidade |
|---|---|
| `app/(site)/` | Site público: home, `/sobre`, `/contato`, `/privacidade`, `/galeria`, Markdown, `llms.txt`, APIs públicas |
| `app/(payload)/` | Painel `/admin` e REST do CMS em `/api/cms` (layout raiz isolado) |
| `app/global-not-found.tsx` | 404 do site (HTML; Markdown para clientes programáticos via `proxy.ts`) |
| `components/` | Markup React portado do site original |
| `app/styles/` | CSS global na ordem original da cascata |
| `payload.config.ts`, `cms/` | Configuração, 21 globais estruturadas, usuários, mídia, acesso, seed, migrações |
| `cms/seed/` | Carga inicial (somente leitura pelo seed) |
| `cms/migrations/` | Migrações do PostgreSQL (versionadas) |
| `lib/conteudo.ts` | Lê as globais no banco, valida e projeta para o contrato público; cache com tag `conteudo-cade` |
| `lib/md-paginas.ts`, `lib/seo.ts` | Markdown para agentes e SEO gerados do mesmo conteúdo |
| `proxy.ts`, `next.config.ts`, `vercel.json` | Negociação de `Accept`, redirects, headers e preset Next.js |
| `public/assets/` | Fontes, marca e imagens estáticas |
| `test/` | Contratos públicos, autorização, mídia, seed e projeção (Vitest) |

Google Calendar e Drive continuam sendo consultados no navegador com a chave pública já restrita por referenciador.

## Oportunidades

Edite **Oportunidades** no painel. Cada item tem `publicado`, `titulo`, `tag`, `cor`, `resumo`, `texto`, `cta`, `link` e `expira` (data inclusiva, dia de São Paulo; vazio não expira). A resposta pública (`/api/oportunidades`) lista até 12 itens publicados e vigentes.

## Publicação — ações do dono do projeto

1. **Banco:** crie um PostgreSQL (por exemplo Neon, pela Vercel Marketplace) e defina `DATABASE_URL`.
2. **Blob:** crie um Vercel Blob **público** (Access: Public; um store privado faz todo upload falhar com "Cannot use public access on a private store", e o acesso não pode ser mudado depois) e conecte-o ao projeto com **token estático**, que define `BLOB_READ_WRITE_TOKEN`. Pela CLI: `vercel blob create-store cade-blob-public --access public --region gru1`, e se a conexão cair no modo OIDC, `vercel storage update <store_id> --auth token --add-rw-token`. A conexão não pode coexistir com um `BLOB_READ_WRITE_TOKEN` antigo no mesmo ambiente: remova o antigo antes.
3. **Variáveis na Vercel**: `DATABASE_URL`, `PAYLOAD_SECRET` (aleatório, ≥ 32 caracteres; valor diferente em cada ambiente), `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY` e `CMS_EMAIL_REMETENTE` (remetente de um domínio verificado no Resend), em Production e Preview; `PAYLOAD_PUBLIC_SERVER_URL=https://cadeufpel.com` **só em Production**; mais `RESEND_TO`/`RESEND_FROM` se quiser mudar os padrões. O build falha em produção sem `RESEND_API_KEY` e `CMS_EMAIL_REMETENTE`, e sem `PAYLOAD_PUBLIC_SERVER_URL` fora do preview. Remova `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET`, se existirem. **Só depois do merge** remova `SHEET_OPORTUNIDADES_CSV`: o site atual ainda a usa.
4. **Esquema e conteúdo iniciais**, uma vez, contra o banco de produção. Use **Node 24** (`engines.node` é `24.x`; confira com `node -v`): os comandos `cms:*` só foram verificados nele. Eles carregam a configuração do Payload, então leem um `.env.local` (Git ignorado; apague-o depois). **Não defina `NODE_ENV=production`** no shell: em produção o boot exige também `RESEND_API_KEY` e `CMS_EMAIL_REMETENTE`.
   - **Só a migração** (`npm run cms:migrate`) precisa apenas de `DATABASE_URL` (o **de produção**, copiado do painel do provedor) e `PAYLOAD_SECRET` (qualquer valor com ≥ 32 caracteres; o comando não assina sessões). Não precisa do token do Blob: sem ele o plugin fica desligado e o esquema é o mesmo (`alwaysInsertFields`). Foi assim que foi testada.
   - **O seed** (`npm run cms:seed`, só em banco vazio) precisa também de `PAYLOAD_PUBLIC_SERVER_URL` e de `BLOB_READ_WRITE_TOKEN` (o **do Blob de produção**, copiado de Storage → Blob → `.env.local` no painel). Ele envia as imagens iniciais ao Blob; sem o token se recusa a rodar, porque gravaria imagens no banco sem arquivo (e uma segunda execução não corrige, pois pula imagens já cadastradas).
   
   Não use `vercel env pull` para obter essas variáveis: as do tipo Secret/Sensitive não são baixadas.
   ```sh
   npm run cms:migrate
   ```
   Depois crie o primeiro administrador. O comando pergunta o e-mail e a senha, para não haver valor de exemplo a colar e a senha não ficar no histórico do shell. Use um e-mail que você abre (ele recebe a recuperação de senha) e uma senha longa e única. No bash:
   ```sh
   read -rp 'E-mail: ' CMS_ADMIN_EMAIL; read -rsp 'Senha: ' CMS_ADMIN_PASSWORD; echo; export CMS_ADMIN_EMAIL CMS_ADMIN_PASSWORD; npm run cms:seed; unset CMS_ADMIN_EMAIL CMS_ADMIN_PASSWORD
   ```
   No PowerShell:
   ```powershell
   $env:CMS_ADMIN_EMAIL = Read-Host 'E-mail'; $env:CMS_ADMIN_PASSWORD = Read-Host 'Senha' -MaskInput; npm run cms:seed; Remove-Item Env:CMS_ADMIN_EMAIL, Env:CMS_ADMIN_PASSWORD
   ```
   Confirme que o `DATABASE_URL` do `.env.local` é o do banco de produção antes de rodar. Depois do seed, abra Mídias no painel e confirme que a URL de uma imagem aponta para `*.public.blob.vercel-storage.com`. Troque a senha no primeiro acesso e crie os editores em Acesso → Usuários.
5. Abra o PR `next-cms` → `main` e **valide no preview o que não foi possível testar localmente** (precisa do Blob e do Resend reais):
   - Upload de um PNG grande: deve virar WebP ≤ 2048 px, e a URL da imagem salva deve apontar direto para `*.public.blob.vercel-storage.com`.
   - Um nome de arquivo fora do padrão deve ser recusado com mensagem clara. Teste **dois** tamanhos: um arquivo de ~4,2 MB (deve mostrar a mensagem de limite) e um de 6 MB ou mais (a Vercel rejeita com 413; anote o que o painel mostra).
   - "Esqueceu a senha?": o e-mail chega, o link redefine a senha e o login seguinte funciona.
   - Login de um editor de teste: edita conteúdo, mas não cria usuário nem altera papel.
6. **Antes do merge**, rode `npm run cms:migrate` de novo contra o banco de produção (mesmo ambiente do passo 4). A migração `disponibilidade` adiciona três colunas à global de formulários e preenche os textos; o site publicado sem ela não consegue ler essa global e a home falha. Ela é segura com a linha já existente e pode ser repetida (migrações aplicadas são puladas). Preview e produção dividem o banco, então o preview atual continua funcionando depois dela.
   A migração `gestao_cargo_lista` também precisa rodar **antes** do merge: ela adiciona `cargo` e `coordenacao` aos membros da gestão e os estilos `Gestão` e `Lista` das seções. O código novo consulta essas colunas, então sem a migração a leitura dos membros deve falhar (como ocorre com a `disponibilidade`). Em um banco que já tinha conteúdo, depois dela escolha no painel o estilo `Lista` na seção "O que fazemos" e `Gestão` na seção da gestão (em `/sobre`), e marque a coordenação e os cargos em *Gestão e quem somos*. Em um banco novo, o seed já cria tudo com esses estilos.
7. Depois da validação, faça o merge.
8. Em mudanças futuras de campos, gere e versione uma migração (`npm run cms:migrate:create`) e rode `npm run cms:migrate` antes de publicar. Em coluna `NOT NULL` nova de uma global que já tem linha, a migração precisa adicionar a coluna nulável, preencher e só então exigir `NOT NULL` (veja `cms/migrations/*_disponibilidade.ts`).

O `vercel.json` seleciona o preset `nextjs`. Hosts e aliases antigos continuam redirecionando para o domínio canônico sem `www`.

## Verificação

A suíte cobre negociação, oportunidades, redirects, SEO e Markdown, formulários, autorização (anônimo, editor, administrador, conta desativada), regras de mídia, idempotência do seed e projeção do conteúdo. Complete com requisições reais ao build (`npm start`):

```sh
curl -i -H "Accept: text/markdown" http://localhost:3000/sobre
curl -I -H "Accept: text/html" http://localhost:3000/sobre
curl -i http://localhost:3000/nao-existe
```

HTML deve conter `Vary: Accept`, link alternativo Markdown e ajuda para agentes; caminho inexistente retorna 404. Confira 1180, 900, 720, 400 e 390 px sem overflow horizontal.

## Contribuição e CodeGraph

Leia `AGENTS.md`. A copy oficial vem do Figma; use os tokens, Material Symbols por codepoint e identificadores estáveis. Não adicione analytics, pixels, beacons ou scripts externos de telemetria (o Payload está com `telemetry: false`).

`codegraph.config.json` inclui HTML, CSS, JavaScript, TypeScript/TSX e Markdown, excluindo assets, `.next/`, dependências, mídia local, migrações, segredos e scratch. Confirme `codegraph version` e `codegraph --help` antes de consultar; use somente leitura e verifique `analysis`/`freshness`. A configuração MCP é do ambiente do agente.
