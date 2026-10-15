import type { Metadata } from 'next';
import { getConteudo } from '@/lib/conteudo';
import type { Seo, Site } from '@/lib/tipos';

// E-mail da coordenação aparece só no JSON-LD da página de contato (não é campo de site.json).
const EMAIL_COORDENACAO = 'design.ufpel@gmail.com';

function endereco(site: Site) {
  return {
    '@type': 'PostalAddress',
    streetAddress: site.endereco.rua,
    addressLocality: site.endereco.cidade,
    addressRegion: site.endereco.uf,
    addressCountry: site.endereco.pais,
  };
}

function sameAs(site: Site) {
  return [site.instagramUrl, site.githubUrl];
}

function contatoGeral(site: Site) {
  return {
    '@type': 'ContactPoint',
    contactType: 'geral',
    email: site.email,
    availableLanguage: ['pt-BR'],
  };
}

export async function metadados({ caminho, seo, md }: { caminho: string; seo: Seo; md: string }): Promise<Metadata> {
  const { site } = await getConteudo();
  const url = new URL(caminho, site.url).toString();
  const imagem = new URL(site.ogImagem, site.url).href;
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

export async function ldInicio() {
  const { site } = await getConteudo();
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
        image: new URL(site.ogImagem, site.url).href,
        description: site.descricaoOrganizacao,
        email: site.email,
        address: endereco(site),
        areaServed: { '@type': 'Place', name: site.endereco.regiao },
        parentOrganization: {
          '@type': 'CollegeOrUniversity',
          name: site.universidade.nome,
          alternateName: site.universidade.sigla,
          url: site.universidade.url,
        },
        sameAs: sameAs(site),
        contactPoint: [contatoGeral(site)],
      },
    ],
  };
}

export async function ldSobre() {
  const { site } = await getConteudo();
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
      address: endereco(site),
      contactPoint: [contatoGeral(site)],
      parentOrganization: {
        '@type': 'CollegeOrUniversity',
        name: site.universidade.nome,
        alternateName: site.universidade.sigla,
        url: site.universidade.url,
      },
      sameAs: sameAs(site),
    },
  };
}

export async function ldContato() {
  const { site } = await getConteudo();
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
      address: endereco(site),
      contactPoint: [
        contatoGeral(site),
        {
          '@type': 'ContactPoint',
          contactType: 'coordenação do curso',
          email: EMAIL_COORDENACAO,
          availableLanguage: ['pt-BR'],
        },
      ],
      sameAs: sameAs(site),
    },
  };
}

export async function ldPrivacidade() {
  const { site } = await getConteudo();
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
      address: endereco(site),
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

export async function ldGaleria() {
  const { site } = await getConteudo();
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
      address: endereco(site),
      contactPoint: [contatoGeral(site)],
    },
  };
}
