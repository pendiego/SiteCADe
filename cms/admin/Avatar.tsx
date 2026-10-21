import type { ServerProps } from 'payload'
import type { Midia, Usuario } from '@/payload-types'

const TAMANHO = 25

const urlDaFoto = (foto: Midia): string | undefined => foto.sizes?.thumbnail?.url ?? foto.url ?? undefined

// Substitui o Gravatar padrão (requisição a terceiro): foto do próprio CMS ou ícone local.
export async function Avatar({ payload, user }: ServerProps) {
  const ref: Usuario['foto'] = user?.collection === 'usuarios' ? (user as Usuario).foto : null
  let url: string | undefined
  if (typeof ref === 'object' && ref !== null) {
    url = urlDaFoto(ref)
  } else if (typeof ref === 'number') {
    const foto = await payload.findByID({ collection: 'midia', id: ref, depth: 0 }).catch(() => null)
    url = foto ? urlDaFoto(foto) : undefined
  }
  if (url) {
    return (
      <img
        src={url}
        alt=""
        width={TAMANHO}
        height={TAMANHO}
        style={{ borderRadius: '50%', objectFit: 'cover', display: 'block' }}
      />
    )
  }
  return (
    <svg width={TAMANHO} height={TAMANHO} viewBox="0 0 25 25" aria-hidden="true" fill="currentColor">
      <circle cx="12.5" cy="12.5" r="11.5" opacity=".2" />
      <circle cx="12.5" cy="10.73" r="3.98" />
      <path d="M12.5,24a11.44,11.44,0,0,0,7.66-2.94c-.5-2.71-3.73-4.8-7.66-4.8s-7.16,2.09-7.66,4.8A11.44,11.44,0,0,0,12.5,24Z" />
    </svg>
  )
}
