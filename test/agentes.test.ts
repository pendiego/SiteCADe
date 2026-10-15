import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { NextRequest } from 'next/server';
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parse } from 'yaml';
import { GET as get404 } from '@/app/api/404/route';
import { GET as getAuth } from '@/app/api/cms/auth/route';
import { GET as getCallback } from '@/app/api/cms/callback/route';
import { GET as getEnviar, POST as postEnviar } from '@/app/api/enviar/route';
import nextConfig from '@/next.config';
import { preferMarkdown, wantsHtml } from '@/lib/negociacao';
import { oportunidadesPublicadas } from '@/lib/oportunidades';
import * as md from '@/lib/md-paginas';
import * as seo from '@/lib/seo';
import type { Oportunidade } from '@/lib/tipos';
import { ARQUIVOS, PAGINAS_MD, proxy } from '@/proxy';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const lerTexto = (arquivo: string) => readFileSync(path.join(raiz, arquivo), 'utf8');
const lerJson = (arquivo: string) => JSON.parse(lerTexto(arquivo));

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

function oportunidade(parcial: Partial<Oportunidade>): Oportunidade {
  return {
    publicado: true,
    titulo: '',
    tag: '',
    cor: 'verde',
    resumo: '',
    texto: '',
    cta: '',
    link: '',
    expira: '',
    ...parcial,
  } as Oportunidade;
}

const INSTAGRAM = 'https://www.instagram.com/cadesignufpel';

describe('oportunidades (lib/oportunidades)', () => {
  const itens = [
    oportunidade({ publicado: false, titulo: 'Rascunho', tag: 'bolsa' }),
    oportunidade({ publicado: false, titulo: 'Não publicado', tag: 'bolsa' }),
    oportunidade({
      tag: 'bolsa',
      cor: 'invalida' as Oportunidade['cor'],
      titulo: 'Título igual',
      resumo: 'Resumo A',
      link: 'sem-esquema',
      expira: '11/09/2026',
    }),
    oportunidade({
      tag: '',
      cor: 'ciano',
      titulo: 'Título igual',
      texto: 'Texto B',
      cta: 'Abrir',
      link: 'https://exemplo.test',
    }),
    oportunidade({ tag: 'edital', cor: 'amarelo', titulo: '' }),
    oportunidade({ tag: 'edital', titulo: 'Expirada', expira: '2026-09-09' }),
  ];

  it('publica só itens válidos, com ids únicos e fallbacks', () => {
    const resultado = oportunidadesPublicadas(itens, '2026-09-10', INSTAGRAM);
    expect(resultado).toHaveLength(2);
    expect(resultado.map((o) => o.id)).toEqual(['titulo-igual', 'titulo-igual-2']);
    expect(resultado[0].cor).toBe('verde');
    expect(resultado[0].link).toBe(INSTAGRAM);
    expect(resultado[1].cor).toBe('ciano');
    expect(resultado[1].texto).toBe('Texto B');
    expect(resultado.map((o) => o.titulo)).not.toContain('Expirada');
  });

  it('limita a 12 itens', () => {
    const muitos = Array.from({ length: 13 }, (_, i) => oportunidade({ titulo: `Oportunidade ${i + 1}` }));
    expect(oportunidadesPublicadas(muitos, '2026-09-10', INSTAGRAM)).toHaveLength(12);
  });

  it('expira com hora ainda conta como o próprio dia', () => {
    const resultado = oportunidadesPublicadas(
      [oportunidade({ titulo: 'Prazo hoje', expira: '2026-09-11T00:00' })],
      '2026-09-10',
      INSTAGRAM,
    );
    expect(resultado.map((o) => o.titulo)).toEqual(['Prazo hoje']);
  });
});

const pedido = (caminho: string, accept?: string) =>
  new NextRequest(`https://cadeufpel.com${caminho}`, { headers: accept ? { accept } : {} });

describe('proxy (negociação por Accept)', () => {
  it('/sobre com text/markdown reescreve para o .md e anuncia Vary', () => {
    const res = proxy(pedido('/sobre', 'text/markdown'));
    expect(res.headers.get('x-middleware-rewrite')).toMatch(/\/sobre\.md$/);
    expect(res.headers.get('vary')).toContain('Accept');
  });

  it('/sobre com Accept de navegador não reescreve e anuncia o alternate', () => {
    const res = proxy(pedido('/sobre', CHROME));
    expect(res.headers.get('x-middleware-rewrite')).toBeNull();
    const link = res.headers.get('link') ?? '';
    expect(link).toContain('rel="alternate"');
    expect(link).toContain('text/markdown');
  });

  it('rota inexistente com */* reescreve para /api/404', () => {
    const res = proxy(pedido('/nao-existe', '*/*'));
    expect(res.headers.get('x-middleware-rewrite')).toMatch(/\/api\/404$/);
  });

  it('rota inexistente com Accept de navegador segue para not-found sem reescrita', () => {
    const res = proxy(pedido('/nao-existe', CHROME));
    expect(res.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('toda página e rota de app/ está em PAGINAS_MD ou ARQUIVOS', () => {
    const app = path.join(raiz, 'app');
    const paginas = listarArquivos(app, 'page.tsx');
    const handlers = readdirSync(app, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name !== 'api')
      .map((e) => path.join(app, e.name, 'route.ts'))
      .filter((arquivo) => existsSync(arquivo));
    const rotas = [...paginas, ...handlers].map((arquivo) => {
      const rel = path.relative(app, path.dirname(arquivo)).split(path.sep).join('/');
      return `/${rel}`;
    });

    for (const rota of rotas) {
      expect(Object.hasOwn(PAGINAS_MD, rota) || Object.hasOwn(ARQUIVOS, rota), rota).toBe(true);
    }
  });
});

function listarArquivos(dir: string, nome: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = path.join(dir, entrada.name);
    if (entrada.isDirectory()) return listarArquivos(caminho, nome);
    return entrada.name === nome ? [caminho] : [];
  });
}

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

describe('markdown (lib/md-paginas)', () => {
  const saidas = {
    inicio: md.mdInicio(new Date('2026-09-10T12:00:00-03:00')),
    sobre: md.mdInstitucional('sobre'),
    contato: md.mdInstitucional('contato'),
    privacidade: md.mdInstitucional('privacidade'),
    galeria: md.mdGaleria(),
  };

  it.each(Object.entries(saidas))('%s aponta para llms.txt e sitemap, sem links relativos', (_nome, texto) => {
    expect(texto).toContain('/llms.txt');
    expect(texto).toContain('/sitemap.xml');
    expect(texto).not.toContain('](/');
    expect(texto).not.toContain('](#');
  });

  it('mdInicio mostra a gestão atual do conteúdo real', () => {
    expect(saidas.inicio).toContain('Gestão atual:** 17 alunos eleitos');
    const membros = lerJson('content/inicio/quem-somos.json').membros;
    expect(membros).toHaveLength(17);
  });
});

describe('SEO (lib/seo)', () => {
  const jsonLds = {
    inicio: seo.ldInicio(),
    sobre: seo.ldSobre(),
    contato: seo.ldContato(),
    privacidade: seo.ldPrivacidade(),
  };

  function organizacoes(no: unknown): Record<string, unknown>[] {
    if (Array.isArray(no)) return no.flatMap(organizacoes);
    if (!no || typeof no !== 'object') return [];
    const objeto = no as Record<string, unknown>;
    const achados = objeto['@type'] === 'Organization' ? [objeto] : [];
    return [...achados, ...Object.values(objeto).flatMap(organizacoes)];
  }

  it.each(Object.keys(jsonLds) as (keyof typeof jsonLds)[])('JSON-LD de %s: organizações completas', (pagina) => {
    const ld = jsonLds[pagina];
    const json = typeof ld === 'string' ? JSON.parse(ld) : ld;
    for (const org of organizacoes(json)) {
      if (Object.keys(org).length <= 2) continue;
      const contatos = ([] as unknown[]).concat(org.contactPoint as unknown);
      expect(contatos.length, 'contactPoint').toBeGreaterThan(0);
      for (const contato of contatos as Record<string, unknown>[]) {
        expect(contato.contactType).toBeTruthy();
        expect(contato.email || contato.telephone).toBeTruthy();
      }
      const endereco = org.address as Record<string, unknown>;
      expect(endereco['@type']).toBe('PostalAddress');
      expect(endereco.addressLocality).toBeTruthy();
      expect(endereco.addressCountry).toBeTruthy();
    }
  });

  it('canonical resolve para o domínio sem www', () => {
    const meta = seo.metadados({
      caminho: '/sobre',
      seo: lerJson('content/paginas/sobre.json').seo,
      md: '/sobre.md',
    });
    const canonical = new URL(String(meta.alternates?.canonical), lerJson('content/site.json').url);
    expect(canonical.href.startsWith('https://cadeufpel.com/')).toBe(true);
    expect(canonical.href).not.toContain('www.');
    expect(meta.alternates?.types?.['text/markdown']).toBe('/sobre.md');
  });
});

describe('arquivos públicos', () => {
  it('sitemap lista as páginas canônicas sem www', () => {
    const xml = lerTexto('public/sitemap.xml');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const pagina of ['/', '/sobre', '/contato', '/privacidade', '/galeria']) {
      expect(locs).toContain(`https://cadeufpel.com${pagina}`);
    }
    for (const url of locs) expect(new URL(url).origin).toBe('https://cadeufpel.com');
  });

  it('robots aponta para o sitemap e para o llms.txt', () => {
    const robots = lerTexto('public/robots.txt');
    expect(robots).toContain('Sitemap: https://cadeufpel.com/sitemap.xml');
    expect(robots).toContain('/llms.txt');
  });
});

describe('CMS (public/admin/config.yml) ↔ conteúdo', () => {
  type Campo = {
    name: string;
    widget: string;
    required?: boolean;
    pattern?: [string, string];
    fields?: Campo[];
  };
  type Arquivo = { name: string; file: string; editor: unknown; fields: Campo[] };
  const cms = parse(lerTexto('public/admin/config.yml')) as {
    collections: { name: string; files: Arquivo[] }[];
  };

  const TIPOS_JSON: Record<string, string> = {
    string: 'string',
    text: 'string',
    richtext: 'string',
    select: 'string',
    image: 'string',
    datetime: 'string',
    number: 'number',
    boolean: 'boolean',
  };

  function conferir(campos: Campo[], objeto: Record<string, unknown>, onde: string) {
    expect(Object.keys(objeto).sort(), onde).toEqual(campos.map((c) => c.name).sort());
    for (const campo of campos) {
      const valor = objeto[campo.name];
      const local = `${onde}.${campo.name}`;
      if (campo.widget === 'object') {
        conferir(campo.fields ?? [], valor as Record<string, unknown>, local);
      } else if (campo.widget === 'list' && campo.fields) {
        for (const [i, item] of (valor as Record<string, unknown>[]).entries()) {
          conferir(campo.fields, item, `${local}[${i}]`);
        }
      } else {
        const esperado = TIPOS_JSON[campo.widget];
        if (esperado) expect(typeof valor, local).toBe(esperado);
        if (campo.pattern) expect(new RegExp(campo.pattern[0]).test(String(valor)), local).toBe(true);
      }
    }
  }

  for (const colecao of cms.collections) {
    for (const arquivo of colecao.files) {
      it(`${colecao.name}/${arquivo.name} → ${arquivo.file}`, () => {
        expect(arquivo.editor).toEqual({ preview: false });
        expect(existsSync(path.join(raiz, arquivo.file)), arquivo.file).toBe(true);
        conferir(arquivo.fields, lerJson(arquivo.file), arquivo.file);
      });
    }
  }
});

describe('api/404', () => {
  it('responde 404 em markdown com Link para sitemap e llms', async () => {
    const res = get404();
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
    expect(res.headers.get('link')).toContain('rel="sitemap"');
    expect(await res.text()).toMatch(/^# 404 — Página não encontrada/);
  });
});

describe('api/enviar', () => {
  const ENV = { ...process.env };
  let fetchMock: Mock;

  beforeEach(() => {
    process.env = { ...ENV, RESEND_API_KEY: 're_teste', RESEND_TO: undefined, RESEND_FROM: undefined };
    fetchMock = vi.fn(async () => new Response('{"id":"x"}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    process.env = ENV;
    vi.unstubAllGlobals();
  });

  const json = (corpo: unknown) =>
    new Request('https://cadeufpel.com/api/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });

  it('GET responde 405', async () => {
    expect((await getEnviar()).status).toBe(405);
  });

  it('sem RESEND_API_KEY responde 500 sem enviar', async () => {
    process.env.RESEND_API_KEY = '';
    const res = await postEnviar(json({ formulario: 'participar', nome: 'Ana', email: 'a@b.com' }));
    expect(res.status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('honeypot preenchido finge sucesso e não envia', async () => {
    const res = await postEnviar(json({ formulario: 'falar', empresa: 'bot', assunto: 'x', mensagem: 'y' }));
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('participar sem nome responde 400', async () => {
    const res = await postEnviar(json({ formulario: 'participar', email: 'a@b.com' }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('aceita corpo form-urlencoded e envia pelo Resend', async () => {
    const req = new Request('https://cadeufpel.com/api/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'formulario=participar&nome=Ana&email=a%40b.com',
    });
    const res = await postEnviar(req);
    expect(res.status).toBe(200);
    const enviado = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(enviado.subject).toBe('[CADe] Quero participar — Ana');
    expect(enviado.to).toEqual(['cadesignufpel@gmail.com']);
  });

  it('destinatário com aspas curvas cai no padrão ASCII', async () => {
    process.env.RESEND_TO = '“contato@exemplo.com”';
    await postEnviar(json({ formulario: 'falar', assunto: 'Oi', mensagem: 'Texto', anonimo: true }));
    const enviado = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(enviado.to).toEqual(['cadesignufpel@gmail.com']);
    expect(enviado.html).toContain('Envio anônimo');
  });

  it('falha do Resend responde 502', async () => {
    fetchMock.mockResolvedValueOnce(new Response('erro', { status: 500 }));
    const res = await postEnviar(json({ formulario: 'participar', nome: 'Ana', email: 'a@b.com' }));
    expect(res.status).toBe(502);
  });
});

describe('api/cms (OAuth GitHub)', () => {
  const ENV = { ...process.env };
  const CSRF = 'a'.repeat(32);

  beforeEach(() => {
    process.env = { ...ENV, GITHUB_CLIENT_ID: 'cid', GITHUB_CLIENT_SECRET: 'segredo' };
  });

  afterEach(() => {
    process.env = ENV;
    vi.unstubAllGlobals();
  });

  const pedidoCallback = (query: string, cookie?: string) =>
    new Request(`https://cadeufpel.com/api/cms/callback?${query}`, {
      headers: cookie ? { cookie } : {},
    });

  function executarPopup(html: string) {
    let receber!: (evento: { data: string; origin: string }) => void;
    const enviar = vi.fn();
    const script = /<script>([\s\S]*?)<\/script>/.exec(html)![1];
    runInNewContext(script, {
      window: {
        opener: { postMessage: enviar },
        addEventListener: (_tipo: string, listener: typeof receber) => { receber = listener; },
      },
    });
    return { receber, enviar };
  }

  it('auth recusa provider diferente de github', async () => {
    const res = getAuth(new Request('https://cadeufpel.com/api/cms/auth?provider=gitlab'));
    expect(await res.text()).toContain('UNSUPPORTED_BACKEND');
  });

  it('auth sem credenciais informa MISCONFIGURED_CLIENT', async () => {
    delete process.env.GITHUB_CLIENT_SECRET;
    const res = getAuth(new Request('https://cadeufpel.com/api/cms/auth?provider=github'));
    expect(await res.text()).toContain('MISCONFIGURED_CLIENT');
  });

  it('auth redireciona ao GitHub com state igual ao cookie e escopo padrão para pedido inválido', () => {
    const res = getAuth(new Request('https://cadeufpel.com/api/cms/auth?provider=github&scope=delete_repo'));
    expect(res.status).toBe(302);
    const destino = new URL(res.headers.get('location') ?? '');
    expect(destino.origin + destino.pathname).toBe('https://github.com/login/oauth/authorize');
    expect(destino.searchParams.get('client_id')).toBe('cid');
    expect(destino.searchParams.get('scope')).toBe('repo,user');
    const csrf = destino.searchParams.get('state') ?? '';
    expect(csrf).toMatch(/^[0-9a-f]{32}$/);
    const cookie = res.headers.get('set-cookie') ?? '';
    expect(cookie).toContain(`csrf-token=github_${csrf}`);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
  });

  it('auth mantém escopos permitidos pedidos pelo CMS', () => {
    const res = getAuth(new Request('https://cadeufpel.com/api/cms/auth?provider=github&scope=repo,public_repo'));
    const destino = new URL(res.headers.get('location') ?? '');
    expect(destino.searchParams.get('scope')).toBe('repo,public_repo');
  });

  it('callback sem cookie de CSRF recusa como não suportado', async () => {
    const res = await getCallback(pedidoCallback('code=a&state=b'));
    expect(await res.text()).toContain('UNSUPPORTED_BACKEND');
  });

  it.each([
    `outro-csrf-token=github_${CSRF}`,
    `csrf-token=github_${CSRF}-invalido`,
  ])('callback ignora cookies parecidos ou valores malformados: %s', async (cookie) => {
    const trocar = vi.fn(async () => Response.json({ access_token: 'nao-deve-ser-emitido' }));
    vi.stubGlobal('fetch', trocar);
    const res = await getCallback(pedidoCallback(`code=c&state=${CSRF}`, cookie));
    expect(await res.text()).toContain('UNSUPPORTED_BACKEND');
    expect(trocar).not.toHaveBeenCalled();
  });

  it('callback com state diferente do cookie aborta sem trocar o código', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const res = await getCallback(pedidoCallback('code=a&state=outro', `csrf-token=github_${CSRF}`));
    expect(await res.text()).toContain('CSRF_DETECTED');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('callback sem code informa AUTH_CODE_REQUEST_FAILED', async () => {
    const res = await getCallback(pedidoCallback(`state=${CSRF}`, `csrf-token=github_${CSRF}`));
    expect(await res.text()).toContain('AUTH_CODE_REQUEST_FAILED');
  });

  it('popup entrega token só à origem de produção e apaga o cookie', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ access_token: 'tok123' })));
    const res = await getCallback(pedidoCallback(`code=c&state=${CSRF}`, `csrf-token=github_${CSRF}`));
    const { receber, enviar } = executarPopup(await res.text());
    expect(enviar.mock.calls).toEqual([['authorizing:github', '*']]);
    receber({ data: 'authorizing:github', origin: 'https://atacante.example' });
    receber({ data: 'outra-mensagem', origin: 'https://cadeufpel.com' });
    expect(enviar.mock.calls).toEqual([['authorizing:github', '*']]);
    receber({ data: 'authorizing:github', origin: 'https://cadeufpel.com' });
    expect(enviar.mock.calls[1]).toEqual([
      'authorization:github:success:{"provider":"github","token":"tok123"}',
      'https://cadeufpel.com',
    ]);
    expect(res.headers.get('set-cookie')).toContain('Max-Age=0');
  });

  it('falha de rede no token responde TOKEN_REQUEST_FAILED', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('offline'))));
    const res = await getCallback(pedidoCallback(`code=c&state=${CSRF}`, `csrf-token=github_${CSRF}`));
    expect(await res.text()).toContain('TOKEN_REQUEST_FAILED');
  });

  it('resposta não JSON responde MALFORMED_RESPONSE', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>', { status: 200 })));
    const res = await getCallback(pedidoCallback(`code=c&state=${CSRF}`, `csrf-token=github_${CSRF}`));
    expect(await res.text()).toContain('MALFORMED_RESPONSE');
  });

  it('erro hostil permanece dado no protocolo do popup', async () => {
    const erro = '</script><script>alert(1)</script>';
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: erro })));
    const res = await getCallback(pedidoCallback(`code=c&state=${CSRF}`, `csrf-token=github_${CSRF}`));
    const { receber, enviar } = executarPopup(await res.text());
    receber({ data: 'authorizing:github', origin: 'http://localhost:3000' });
    expect(enviar.mock.calls[1]).toEqual([
      'authorization:github:error:' + JSON.stringify({ provider: 'github', error: erro }),
      'http://localhost:3000',
    ]);
  });
});
