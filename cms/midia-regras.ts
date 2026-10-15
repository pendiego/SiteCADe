// 4 MiB: abaixo do limite de 4,5 MB do corpo de requisições das funções da Vercel, para o erro ser nosso e claro.
export const limiteTamanhoBytes = 4 * 1024 * 1024
export const limiteDimensaoPx = 2048

const tiposAceitos: Record<string, readonly string[]> = {
  'image/png': ['png'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/webp': ['webp'],
}

const padraoNomeKebab = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const normalizarNomeArquivo = (nome: string): string => {
  const semExtensao = nome.replace(/\.[^.]+$/, '')
  return semExtensao
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const validarUpload = (arquivo: { nome: string; mimeType: string; tamanho: number }): string | null => {
  if (!(arquivo.mimeType in tiposAceitos)) {
    return 'Formato não aceito. Envie PNG, JPEG ou WebP.'
  }
  const partes = arquivo.nome.split('.')
  const extensao = partes.length > 1 ? (partes[partes.length - 1] ?? '').toLowerCase() : ''
  const base = partes.slice(0, -1).join('.')
  if (!(tiposAceitos[arquivo.mimeType] ?? []).includes(extensao)) {
    return 'A extensão do arquivo não corresponde ao tipo enviado.'
  }
  if (!padraoNomeKebab.test(base)) {
    return 'Use nome em ASCII minúsculo com letras, números e hífen (kebab-case).'
  }
  if (arquivo.tamanho > limiteTamanhoBytes) {
    return 'O arquivo excede 4 MiB.'
  }
  return null
}

export const limiteDimensoes = (largura: number, altura: number): { largura: number; altura: number } => {
  const maior = Math.max(largura, altura)
  if (maior <= limiteDimensaoPx) return { largura, altura }
  const escala = limiteDimensaoPx / maior
  return {
    largura: Math.round(largura * escala),
    altura: Math.round(altura * escala),
  }
}
