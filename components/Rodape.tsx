import { resolverHref } from '@/lib/links';
import { mdInline } from '@/lib/markdown';
import type { Rodape as RodapeConteudo, Site } from '@/lib/tipos';

interface RodapeProps {
  rodape: RodapeConteudo;
  site: Site;
  naHome: boolean;
}

export default function Rodape({ rodape, site, naHome }: RodapeProps) {
  return (
    <footer className="footer sobre-navy" data-od-id="footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-marca">
            <img src="/assets/logo-footer.svg" alt="CADe UFPel" width={209} height={64} />
            <p>{rodape.tagline}</p>
          </div>

          <div className="footer-col">
            <b>{rodape.contatoTitulo.toLocaleUpperCase('pt-BR')}</b>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <a href={site.instagramUrl}>{site.instagramUsuario}</a>
          </div>

          {rodape.colunas.map((coluna) => (
            <nav key={coluna.titulo} className="footer-col" aria-label={coluna.titulo}>
              <b>{coluna.titulo.toLocaleUpperCase('pt-BR')}</b>
              {coluna.links.map((link) => (
                <a key={`${link.href}-${link.rotulo}`} href={resolverHref(link.href, naHome)}>
                  {link.rotulo}
                </a>
              ))}
            </nav>
          ))}
        </div>

        <div className="footer-rule" />

        <div className="footer-bottom">
          <p>{rodape.copyright}</p>
          <p dangerouslySetInnerHTML={{ __html: mdInline(rodape.notaPrivacidade) }} />
          <a className="footer-github" href={site.githubUrl} target="_blank" rel="noopener">
            <svg
              className="brand-icon"
              viewBox="0 0 24 24"
              width={18}
              height={18}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            {rodape.githubRotulo}
          </a>
        </div>
      </div>
    </footer>
  );
}
