import type { Field } from 'payload';
import type { ModeloConteudo } from '@/cms/modelos';
import { dataChave } from '@/lib/oportunidades';

/** Converte os documentos do CMS para o contrato público, sem metadados do Payload. */
export function projetarDocumento(documento: unknown, modelo: { slug: string; fields: readonly Field[] }): Record<string, unknown> {
  function projetar(campos: readonly Field[], valor: unknown, caminho: string): Record<string, unknown> {
    if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
      throw new Error(`Conteúdo ${caminho} não inicializado. Execute npm run cms:seed.`);
    }
    const fonte = valor as Record<string, unknown>;
    const resultado: Record<string, unknown> = {};
    for (const campo of campos) {
      if (!('name' in campo) || !campo.name || ['id', 'createdAt', 'updatedAt', '_status'].includes(campo.name)) continue;
      const nome = campo.name;
      const chave = nome === 'odId' ? 'id' : nome;
      const dado = fonte[nome];
      const local = `${caminho}.${nome}`;
      if (campo.type === 'group') {
        resultado[chave] = projetar(campo.fields, dado, local);
      } else if (campo.type === 'array') {
        if (dado != null && !Array.isArray(dado)) throw new Error(`Lista inválida em ${local}.`);
        const lista = (dado ?? []) as unknown[];
        const proprios = campo.fields.filter((f) => !('name' in f) || f.name !== 'id');
        const primitiva = proprios.length === 1 && 'name' in proprios[0] && proprios[0].name === 'valor';
        resultado[chave] = lista.map((item, i) => {
          const linha = projetar(campo.fields, item, `${local}[${i}]`);
          return primitiva ? linha.valor : linha;
        });
      } else if (campo.type === 'upload') {
        if (!dado || typeof dado !== 'object' || !('url' in dado) || typeof dado.url !== 'string' || !dado.url) {
          throw new Error(`Imagem não preenchida/populada em ${local}.`);
        }
        const url = new URL(dado.url, 'https://cadeufpel.com');
        resultado[chave] = url.pathname.startsWith('/api/cms/midia/file/') ? url.pathname + url.search : dado.url;
      } else if (campo.type === 'checkbox') {
        if (typeof dado !== 'boolean') throw new Error(`Booleano inválido em ${local}.`);
        resultado[chave] = dado;
      } else if (campo.type === 'number') {
        if (typeof dado !== 'number' || !Number.isFinite(dado)) throw new Error(`Número inválido em ${local}.`);
        resultado[chave] = dado;
      } else if (campo.type === 'date') {
        if (dado != null && typeof dado !== 'string') throw new Error(`Data inválida em ${local}.`);
        resultado[chave] = dado ? dataChave(dado) ?? '' : '';
      } else if (campo.type === 'text' || campo.type === 'textarea' || campo.type === 'select') {
        if (dado == null && !campo.required) resultado[chave] = '';
        else if (typeof dado === 'string') resultado[chave] = dado;
        else throw new Error(`Texto não preenchido em ${local}. Execute npm run cms:seed.`);
      }
    }
    return resultado;
  }
  return projetar(modelo.fields, documento, modelo.slug);
}
