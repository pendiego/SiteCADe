'use client'
import { useRowLabel } from '@payloadcms/ui'
import { dataChave, hojeEmSaoPaulo } from '@/lib/oportunidades'

const CHAVES = ['titulo', 'nome', 'pergunta', 'rotulo', 'valor'] as const

export function RotuloLinha() {
  const { data, rowNumber } = useRowLabel<Record<string, unknown> | undefined>()
  const numero = String((rowNumber ?? 0) + 1).padStart(2, '0')
  const nome = CHAVES.map((c) => data?.[c]).find((v): v is string => typeof v === 'string' && v.trim() !== '')
  const avisos: string[] = []
  if (data?.publicado === false) avisos.push('oculta')
  const expira = typeof data?.expira === 'string' ? dataChave(data.expira) : null
  if (expira && expira < hojeEmSaoPaulo()) avisos.push('vencida')
  return <span>{`${numero} · ${nome ?? 'Sem título'}${avisos.length ? ` (${avisos.join(', ')})` : ''}`}</span>
}
