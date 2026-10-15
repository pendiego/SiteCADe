import type { Metadata } from 'next';
import { site } from '@/lib/conteudo';
import type { Seo } from '@/lib/tipos';

// E-mail da coordenação aparece só no JSON-LD da página de contato (não é campo de site.json).
const EMAIL_COORDENACAO = 'design.ufpel@gmail.com';

const ENDERECO = {
  '@type': 'PostalAddress',
  streetAddress: site.endereco.rua,
  addressLocality: site.endereco.cidade,
  addressRegion: site.endereco.uf,
  addressCountry: site.endereco.pais,
};

const UNIVERSIDADE = {
  '@type': 'CollegeOrUniversity',
  name: site.universidade.nome,
  alternateName: site.universidade.sigla,
  url: site.universidade.url,
};

const SAME_AS = [site.instagramUrl, site.githubUrl];

const CONTATO_GERAL = {
  '@type': 'ContactPoint',
  contactType: 'geral',
  email: site.email,
  availableLanguage: ['pt-BR'],
};

export function metadados({ caminho, seo, md }: { caminho: string; seo: Seo; md: string }): Metadata {
  const url = new URL(caminho, site.url).toString();
  const imagem = `${site.url}${site.ogImagem}`;
  return {
    title: seo.titulo,
    description: seo.descricao,
    alternates: { canonical: caminho, types: { 'text/markdown': md } },
    openGraph: {
      type: 'website',
      url,
      siteName: site.nome,
      title: seo.tituloSocial,
      description: seo.descricao,
      images: [imagem],
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.tituloSocial,
      description: seo.descricao,
      images: [imagem],
    },
  };
}

export function ldInicio() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: site.nome,
        alternateName: site.nomeCompleto,
        url: `${site.url}/`,
        inLanguage: 'pt-BR',
        description: site.descricao,
        publisher: { '@id': `${site.url}/#organizacao` },
      },
      {
        '@type': 'Organization',
        '@id': `${site.url}/#organizacao`,
        name: site.nomeCompleto,
        alternateName: site.nomesAlternativos,
        url: `${site.url}/`,
        logo: `${site.url}/assets/logo-cade.svg`,
        image: `${site.url}${site.ogImagem}`,
        description: site.descricaoOrganizacao,
        email: site.email,
        address: ENDERECO,
        areaServed: { '@type': 'Place', name: site.endereco.regiao },
        parentOrganization: UNIVERSIDADE,
        sameAs: SAME_AS,
        contactPoint: [CONTATO_GERAL],
      },
    ],
  };
}

export function ldSobre() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: `${site.url}/sobre`,
    inLanguage: 'pt-BR',
    name: 'Sobre o CADe UFPel',
    mainEntity: {
      '@type': 'Organization',
      name: site.nomeCompleto,
      alternateName: site.nomesAlternativos.slice(0, 3),
      url: `${site.url}/`,
      logo: `${site.url}/assets/logo-cade.svg`,
      email: site.email,
      foundingLocation: { '@type': 'Place', name: site.endereco.regiao },
      address: ENDERECO,
      contactPoint: [CONTATO_GERAL],
      parentOrganization: UNIVERSIDADE,
      sameAs: SAME_AS,
    },
  };
}

export function ldContato() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url: `${site.url}/contato`,
    inLanguage: 'pt-BR',
    name: 'Contato — CADe UFPel',
    mainEntity: {
      '@type': 'Organization',
      name: site.nomeCompleto,
      alternateName: site.nomesAlternativos.slice(0, 2),
      url: `${site.url}/`,
      email: site.email,
      address: ENDERECO,
      contactPoint: [
        CONTATO_GERAL,
        {
          '@type': 'ContactPoint',
          contactType: 'coordenação do curso',
          email: EMAIL_COORDENACAO,
          availableLanguage: ['pt-BR'],
        },
      ],
      sameAs: SAME_AS,
    },
  };
}

export function ldPrivacidade() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${site.url}/privacidade`,
    inLanguage: 'pt-BR',
    name: 'Política de privacidade — CADe UFPel',
    dateModified: '2026-09-03',
    publisher: {
      '@type': 'Organization',
      name: site.nomeCompleto,
      alternateName: site.nomesAlternativos.slice(0, 2),
      url: `${site.url}/`,
      email: site.email,
      address: ENDERECO,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'privacidade',
          email: site.email,
          availableLanguage: ['pt-BR'],
        },
      ],
    },
  };
}

export function ldGaleria() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    url: `${site.url}/galeria`,
    inLanguage: 'pt-BR',
    name: 'Galeria — CADe UFPel',
    publisher: {
      '@type': 'Organization',
      name: site.nomeCompleto,
      alternateName: site.nomesAlternativos.slice(0, 2),
      url: `${site.url}/`,
      logo: `${site.url}/assets/logo-cade.svg`,
      email: site.email,
      address: ENDERECO,
      contactPoint: [CONTATO_GERAL],
    },
  };
}
