import { GOOGLE_API_KEY } from '@/lib/google';

const API = 'https://www.googleapis.com/drive/v3/files';

// Lista todos os arquivos seguindo `nextPageToken`. `campos` são os campos de `files(...)`.
export async function listarArquivos<T = Record<string, unknown>>(q: string, campos: string): Promise<T[]> {
  const arquivos: T[] = [];
  let token = '';
  do {
    let url =
      `${API}?q=${encodeURIComponent(q)}&pageSize=1000` +
      `&fields=${encodeURIComponent(`nextPageToken,files(${campos})`)}` +
      `&key=${GOOGLE_API_KEY}`;
    if (token) url += `&pageToken=${encodeURIComponent(token)}`;

    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = (await r.json()) as { files?: T[]; nextPageToken?: string };
    if (!Array.isArray(j.files)) throw new Error('Resposta inválida');

    arquivos.push(...j.files);
    token = j.nextPageToken ?? '';
  } while (token);
  return arquivos;
}

// O chamador calcula o tamanho dos cards; o lightbox pede a versão de 2400px.
export function miniaturaUrl(id: string, largura: number): string {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w${largura}`;
}

// Nome de pasta "praia-do-cade_2025" → "Praia Do Cade 2025".
export function tituloPasta(nome: string): string {
  return nome.replace(/[-_]+/g, ' ').replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}
