export interface Link { rotulo: string; href: string }
export interface Seo { titulo: string; tituloSocial: string; descricao: string }
export interface Agentes { titulo: string; resumo: string } // resumo = markdown

// content/site.json
export interface Site {
  url: string;
  nome: string;
  nomeCompleto: string;
  nomesAlternativos: string[];
  descricao: string;
  descricaoOrganizacao: string;
  email: string;
  instagramUrl: string;
  instagramUsuario: string;
  githubUrl: string;
  endereco: { rua: string; cidade: string; uf: string; pais: string; regiao: string; texto: string };
  universidade: { nome: string; sigla: string; url: string };
  ogImagem: string;
}

// content/navegacao.json
export interface Navegacao { links: Link[]; cta: Link }

// content/rodape.json
export interface Rodape {
  tagline: string;
  contatoTitulo: string;
  colunas: { titulo: string; links: Link[] }[];
  copyright: string;
  notaPrivacidade: string;
  githubRotulo: string;
}

// content/integracoes.json
export interface Integracoes {
  googleCalendarId: string;
  calendarioAssinarUrl: string;
  drivePastaGaleria: string;
  drivePastaMateriais: string;
}

// content/llms.json
export interface Llms { texto: string }

// content/inicio/seo.json
export interface InicioSeo { seo: Seo; agentes: Agentes }

// content/inicio/hero.json
export interface HeroSlide {
  id: string;
  acento: string;
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  ctaRotulo: string;
  ctaHref: string;
  mascote: string;
  mascoteAlt: string;
  mascoteLargura: number;
  mascoteAltura: number;
}
export interface InicioHero { slides: HeroSlide[] }

// content/inicio/agenda.json
export interface InicioAgenda {
  eyebrow: string;
  titulo: string;
  ctaRotulo: string;
  rotuloDetalhe: string;
  carregando: string;
  noscript: string;
  mensagens: {
    semTitulo: string;
    semDescricao: string;
    nenhumFuturo: string;
    proximoEvento: string;
    ultimoEvento: string;
    semEventosData: string;
    semEventosTitulo: string;
    semEventosDesc: string;
    diaSemEventoTitulo: string;
    diaSemEventoDesc: string;
    indisponivelTitulo: string;
    indisponivelDesc: string;
  };
}

// content/inicio/quem-somos.json
export interface Membro { nome: string; foto: string; enquadramento: string; cargo?: string | null; coordenacao?: boolean }
export interface InicioQuemSomos {
  eyebrow: string;
  titulo: string;
  texto: string;
  gestaoTitulo: string;
  contagemRotulo: string;
  linkSobreRotulo: string;
  equipeCoordenacaoTitulo: string;
  equipeMembrosTitulo: string;
  membros: Membro[];
}

// content/inicio/historico.json
export interface InicioHistorico {
  eyebrow: string;
  titulo: string;
  lead: string;
  nota: string;
  noscript: string;
  verTudoRotulo: string;
  mensagens: { carregando: string; vazio: string; erro: string };
}

// content/inicio/lojinha.json
export interface Produto { id: string; titulo: string; subtitulo: string; imagem: string; alt: string; href: string }
export interface InicioLojinha {
  eyebrow: string;
  titulo: string;
  lead: string;
  badgeRotulo: string;
  badgeHref: string;
  hoverRotulo: string;
  produtos: Produto[];
  cta: { titulo: string; subtitulo: string; href: string };
  nota: string;
}

// content/inicio/guia.json
export interface CardGuia { id: string; tipo: string; titulo: string; texto: string; href: string }
export interface InicioGuia {
  eyebrow: string;
  titulo: string;
  lead: string;
  foto: string;
  fotoLegenda: string;
  cards: CardGuia[];
  materiais: { titulo: string; carregando: string; vazio: string; erro: string };
}

// content/inicio/oportunidades.json
export interface InicioOportunidades {
  eyebrow: string;
  titulo: string;
  lead: string;
  ctaRotulo: string;
  ctaHref: string;
  vazio: string;
  verDetalhes: string;
}

// content/inicio/faq.json
export interface FaqItem { id: string; pergunta: string; resposta: string; aberto: boolean }
export interface InicioFaq { eyebrow: string; titulo: string; texto: string; itens: FaqItem[] }

// content/inicio/atalhos.json
export interface Atalho { id: string; titulo: string; subtitulo: string; href: string; novaAba: boolean }
export interface InicioAtalhos { eyebrow: string; titulo: string; itens: Atalho[] }

// content/inicio/formularios.json
export interface TipoFalar { rotulo: string; nota: string }
export interface InicioFormularios {
  eyebrow: string;
  titulo: string;
  participar: {
    titulo: string;
    texto: string;
    nomeRotulo: string;
    nomePlaceholder: string;
    emailRotulo: string;
    emailPlaceholder: string;
    semestreRotulo: string;
    semestres: string[];
    areaRotulo: string;
    areas: string[];
    disponibilidadeRotulo: string;
    disponibilidadeAjuda: string;
    disponibilidadeErro: string;
    selecione: string;
    enviarRotulo: string;
    nota: string;
  };
  falar: {
    titulo: string;
    tipoRotulo: string;
    tipos: { reclamacao: TipoFalar; sugestao: TipoFalar; elogio: TipoFalar; oportunidade: TipoFalar };
    assuntoRotulo: string;
    assuntoPlaceholder: string;
    mensagemRotulo: string;
    mensagemPlaceholder: string;
    anonimoRotulo: string;
    contatoRotulo: string;
    contatoPlaceholder: string;
    notaAnonimo: string;
    enviarRotulo: string;
  };
  mensagens: { enviando: string; sucesso: string; erro: string };
}

// content/paginas/{sobre,contato,privacidade}.json
export interface SecaoInstitucional { titulo: string; estilo: string; corpo: string }
export interface PaginaInstitucional {
  seo: Seo;
  eyebrow: string;
  titulo: string;
  lead: string;
  secoes: SecaoInstitucional[];
  nota: string;
  agentes: Agentes;
}

// content/paginas/galeria.json
export interface PaginaGaleria {
  seo: Seo;
  eyebrow: string;
  titulo: string;
  lead: string;
  nota: string;
  driveRotulo: string;
  carregando: string;
  noscript: string;
  mensagens: {
    vazio: string;
    carregandoFotos: string;
    emBreve: string;
    verMais: string;
    erroCategoria: string;
    erroGeral: string;
  };
  agentes: Agentes;
}

// content/oportunidades.json
export interface Oportunidade {
  publicado: boolean;
  titulo: string;
  tag: string;
  cor: string;
  resumo: string;
  texto: string;
  cta: string;
  link: string;
  expira: string;
}
export interface Oportunidades { itens: Oportunidade[] }

// lib/oportunidades.ts
export interface OportunidadePublica {
  id: string;
  tag: string;
  cor: 'verde' | 'amarelo' | 'ciano';
  titulo: string;
  resumo: string;
  texto: string;
  cta: string;
  link: string;
}
