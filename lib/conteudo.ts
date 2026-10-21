import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getPayload, type GlobalSlug } from 'payload';
import config from '@payload-config';
import { modelos } from '@/cms/modelos';
import { projetarDocumento } from '@/cms/projecao';
import type {
  InicioAgenda, InicioAtalhos, InicioFaq, InicioFormularios, InicioGuia,
  InicioHero, InicioHistorico, InicioLojinha, InicioOportunidades,
  InicioQuemSomos, InicioSeo, Integracoes, Llms, Navegacao, Oportunidades,
  PaginaGaleria, PaginaInstitucional, Rodape, Site,
} from '@/lib/tipos';

export interface Conteudo {
  site: Site;
  navegacao: Navegacao;
  rodape: Rodape;
  integracoes: Integracoes;
  llms: Llms;
  dadosOportunidades: Oportunidades;
  inicioSeo: InicioSeo;
  hero: InicioHero;
  agenda: InicioAgenda;
  quemSomos: InicioQuemSomos;
  historico: InicioHistorico;
  lojinha: InicioLojinha;
  guia: InicioGuia;
  oportunidadesTexto: InicioOportunidades;
  faq: InicioFaq;
  atalhos: InicioAtalhos;
  formularios: InicioFormularios;
  galeria: PaginaGaleria;
  paginas: { sobre: PaginaInstitucional; contato: PaginaInstitucional; privacidade: PaginaInstitucional };
}

const carregarConteudo = unstable_cache(async (): Promise<Conteudo> => {
  const payload = await getPayload({ config });
  const documentos = await Promise.all(modelos.map(async (modelo) => {
    const documento = await payload.findGlobal({
      slug: modelo.slug as GlobalSlug,
      depth: 1,
      overrideAccess: true,
    });
    return [modelo.chave, projetarDocumento(documento, modelo)] as const;
  }));
  const dados = Object.fromEntries(documentos);
  return {
    site: dados.site as unknown as Site,
    navegacao: dados.navegacao as unknown as Navegacao,
    rodape: dados.rodape as unknown as Rodape,
    integracoes: dados.integracoes as unknown as Integracoes,
    llms: dados.llms as unknown as Llms,
    dadosOportunidades: dados.dadosOportunidades as unknown as Oportunidades,
    inicioSeo: dados.inicioSeo as unknown as InicioSeo,
    hero: dados.hero as unknown as InicioHero,
    agenda: dados.agenda as unknown as InicioAgenda,
    quemSomos: dados.quemSomos as unknown as InicioQuemSomos,
    historico: dados.historico as unknown as InicioHistorico,
    lojinha: dados.lojinha as unknown as InicioLojinha,
    guia: dados.guia as unknown as InicioGuia,
    oportunidadesTexto: dados.oportunidadesTexto as unknown as InicioOportunidades,
    faq: dados.faq as unknown as InicioFaq,
    atalhos: dados.atalhos as unknown as InicioAtalhos,
    formularios: dados.formularios as unknown as InicioFormularios,
    galeria: dados.galeria as unknown as PaginaGaleria,
    paginas: {
      sobre: dados['paginas.sobre'] as unknown as PaginaInstitucional,
      contato: dados['paginas.contato'] as unknown as PaginaInstitucional,
      privacidade: dados['paginas.privacidade'] as unknown as PaginaInstitucional,
    },
  };
}, ['conteudo-cade'], { tags: ['conteudo-cade'], revalidate: 60 });

/** Uma leitura por render; alterações no CMS invalidam o cache compartilhado. */
export const getConteudo = cache(carregarConteudo);
