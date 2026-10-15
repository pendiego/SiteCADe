import { NextRequest, NextResponse } from 'next/server';
import { preferMarkdown, wantsHtml } from '@/lib/negociacao';

const SITE = 'https://cadeufpel.com';
const VARY = 'Accept, Accept-Encoding';

export const PAGINAS_MD: Record<string, string> = {
  '/': '/index.md',
  '/sobre': '/sobre.md',
  '/contato': '/contato.md',
  '/privacidade': '/privacidade.md',
  '/galeria': '/galeria.md',
};

export const ARQUIVOS: Record<string, true> = {
  '/index.md': true, '/sobre.md': true, '/contato.md': true,
  '/privacidade.md': true, '/galeria.md': true, '/llms.txt': true,
  '/robots.txt': true, '/sitemap.xml': true,
};

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const accept = request.headers.get('accept') ?? '';

  if (Object.hasOwn(PAGINAS_MD, pathname)) {
    const md = PAGINAS_MD[pathname];

    if (preferMarkdown(accept)) {
      return NextResponse.rewrite(new URL(md, request.url), {
        headers: {
          Vary: VARY,
          'Cache-Control': 'public, max-age=0, must-revalidate',
          Link: `<${SITE}${pathname}>; rel="canonical"`,
        },
      });
    }

    return NextResponse.next({
      headers: {
        Vary: VARY,
        Link: `<${md}>; rel="alternate"; type="text/markdown"`,
      },
    });
  }

  if (Object.hasOwn(ARQUIVOS, pathname)) {
    return NextResponse.next();
  }

  if (!wantsHtml(accept)) {
    return NextResponse.rewrite(new URL('/api/404', request.url));
  }

  return NextResponse.next({ headers: { Vary: VARY } });
}

export const config = {
  matcher: ['/((?!_next/|api/|assets/|admin(?:/|$)).*)'],
};
