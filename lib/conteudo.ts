import type {
  InicioAgenda,
  InicioAtalhos,
  InicioFaq,
  InicioFormularios,
  InicioGuia,
  InicioHero,
  InicioHistorico,
  InicioLojinha,
  InicioOportunidades,
  InicioQuemSomos,
  InicioSeo,
  Integracoes,
  Llms,
  Navegacao,
  Oportunidades,
  PaginaGaleria,
  PaginaInstitucional,
  Rodape,
  Site,
} from '@/lib/tipos';

import siteJson from '@/content/site.json';
import navegacaoJson from '@/content/navegacao.json';
import rodapeJson from '@/content/rodape.json';
import integracoesJson from '@/content/integracoes.json';
import llmsJson from '@/content/llms.json';
import oportunidadesJson from '@/content/oportunidades.json';
import inicioSeoJson from '@/content/inicio/seo.json';
import heroJson from '@/content/inicio/hero.json';
import agendaJson from '@/content/inicio/agenda.json';
import quemSomosJson from '@/content/inicio/quem-somos.json';
import historicoJson from '@/content/inicio/historico.json';
import lojinhaJson from '@/content/inicio/lojinha.json';
import guiaJson from '@/content/inicio/guia.json';
import oportunidadesTextoJson from '@/content/inicio/oportunidades.json';
import faqJson from '@/content/inicio/faq.json';
import atalhosJson from '@/content/inicio/atalhos.json';
import formulariosJson from '@/content/inicio/formularios.json';
import sobreJson from '@/content/paginas/sobre.json';
import contatoJson from '@/content/paginas/contato.json';
import privacidadeJson from '@/content/paginas/privacidade.json';
import galeriaJson from '@/content/paginas/galeria.json';

// A tipagem faz o `next build` falhar se o CMS gravar um arquivo com forma errada.
export const site: Site = siteJson;
export const navegacao: Navegacao = navegacaoJson;
export const rodape: Rodape = rodapeJson;
export const integracoes: Integracoes = integracoesJson;
export const llms: Llms = llmsJson;
export const dadosOportunidades: Oportunidades = oportunidadesJson;

export const inicioSeo: InicioSeo = inicioSeoJson;
export const hero: InicioHero = heroJson;
export const agenda: InicioAgenda = agendaJson;
export const quemSomos: InicioQuemSomos = quemSomosJson;
export const historico: InicioHistorico = historicoJson;
export const lojinha: InicioLojinha = lojinhaJson;
export const guia: InicioGuia = guiaJson;
export const oportunidadesTexto: InicioOportunidades = oportunidadesTextoJson;
export const faq: InicioFaq = faqJson;
export const atalhos: InicioAtalhos = atalhosJson;
export const formularios: InicioFormularios = formulariosJson;

export const galeria: PaginaGaleria = galeriaJson;
export const paginas: {
  sobre: PaginaInstitucional;
  contato: PaginaInstitucional;
  privacidade: PaginaInstitucional;
} = {
  sobre: sobreJson,
  contato: contatoJson,
  privacidade: privacidadeJson,
};
