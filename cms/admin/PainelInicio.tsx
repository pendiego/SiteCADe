import Link from 'next/link'
import type { ServerProps } from 'payload'
import { dataChave, hojeEmSaoPaulo } from '@/lib/oportunidades'

interface Cartao {
  id: string
  titulo: string
  descricao: string
  caminho: string
  cor: 'verde' | 'ciano' | 'amarelo' | 'rosa' | 'azul'
}

const plural = (n: number, singular: string, pluralTexto: string) => `${n} ${n === 1 ? singular : pluralTexto}`

export async function PainelInicio({ payload, user }: ServerProps) {
  const [oportunidades, site] = await Promise.all([
    payload.findGlobal({ slug: 'oportunidades-dados', depth: 0 }),
    payload.findGlobal({ slug: 'configuracao-site', depth: 0 }),
  ])

  const hoje = hojeEmSaoPaulo()
  let noSite = 0
  let vencidas = 0
  let ocultas = 0
  for (const item of oportunidades.itens ?? []) {
    if (item.publicado === false) {
      ocultas++
      continue
    }
    const expira = item.expira ? dataChave(item.expira) : null
    if (expira && expira < hoje) vencidas++
    else if (item.titulo?.trim()) noSite++
  }
  const partes = [
    noSite > 0 ? `${noSite} no site` : null,
    vencidas > 0 ? plural(vencidas, 'vencida', 'vencidas') : null,
    ocultas > 0 ? plural(ocultas, 'oculta', 'ocultas') : null,
  ].filter((p): p is string => p !== null)
  const contagem = partes.length ? partes.join(' · ') : 'Nenhuma cadastrada'

  const admin = payload.config.routes.admin
  const cartoes: Cartao[] = [
    {
      id: 'oportunidades',
      titulo: 'Oportunidades',
      descricao: 'Vagas, bolsas e editais.',
      caminho: `${admin}/globals/oportunidades-dados`,
      cor: 'verde',
    },
    {
      id: 'destaques',
      titulo: 'Destaques do topo',
      descricao: 'Os slides que abrem a página inicial.',
      caminho: `${admin}/globals/inicio-hero`,
      cor: 'ciano',
    },
    {
      id: 'gestao',
      titulo: 'Gestão e quem somos',
      descricao: 'Nomes e fotos dos membros da gestão.',
      caminho: `${admin}/globals/inicio-quem-somos`,
      cor: 'amarelo',
    },
    {
      id: 'atalhos',
      titulo: 'Atalhos',
      descricao: 'Links rápidos da seção 07.',
      caminho: `${admin}/globals/inicio-atalhos`,
      cor: 'rosa',
    },
    {
      id: 'imagens',
      titulo: 'Imagens',
      descricao: 'Envie fotos antes de usar ou direto no campo de foto.',
      caminho: `${admin}/collections/midia`,
      cor: 'azul',
    },
  ]

  const primeiroNome = typeof user?.nome === 'string' ? user.nome.trim().split(/\s+/)[0] : ''

  return (
    <section className="cade-painel" data-od-id="painel-inicio">
      <h2 data-od-id="painel-titulo">{`Olá${primeiroNome ? `, ${primeiroNome}` : ''}. O que você quer atualizar hoje?`}</h2>
      <p>Escolha um cartão, mude o que precisar e clique em Salvar. O site mostra a mudança logo depois.</p>
      <p>
        <a href={site.url} target="_blank" rel="noopener noreferrer" data-od-id="painel-abrir-site">
          Abrir o site
        </a>
      </p>
      <div className="cade-painel__grade">
        {cartoes.map((c) => (
          <Link
            key={c.id}
            href={c.caminho}
            className={`cade-painel__card cade-painel__card--${c.cor}`}
            data-od-id={`painel-card-${c.id}`}
          >
            <strong>{c.titulo}</strong>
            <span>{c.descricao}</span>
            {c.id === 'oportunidades' ? <span>{contagem}</span> : null}
            <span className="cade-painel__abrir">Abrir</span>
          </Link>
        ))}
      </div>
      <p className="cade-painel__nota">
        O resto (textos das seções, outras páginas e configurações) continua no menu. Em "Configurações avançadas", só
        mexa se souber o que está fazendo.
      </p>
    </section>
  )
}
