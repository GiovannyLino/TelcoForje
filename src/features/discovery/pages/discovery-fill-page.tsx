import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ErrorState } from '@/components/shared/error-state'
import { useDiscoveryResponse } from '../hooks'
import { DiscoveryForm } from '../components/discovery-form'
import { ResumoView } from '../components/resumo-view'
import type { ResumoMeta } from '../types'

export function DiscoveryFillPage() {
  const { id } = useParams<{ id: string }>()
  const resp = useDiscoveryResponse(id)

  if (resp.isLoading) {
    return (
      <div className="px-6 py-8">
        <Skeleton className="h-96 max-w-3xl" />
      </div>
    )
  }
  if (resp.isError || !resp.data) {
    return (
      <div className="px-6 py-8">
        <ErrorState
          description="Não foi possível carregar este discovery."
          onRetry={() => resp.refetch()}
        />
      </div>
    )
  }

  const r = resp.data
  const finalizado = r.status === 'finalizado'
  const meta: ResumoMeta = {
    cliente: r.opportunity?.client?.nome,
    oportunidade: r.opportunity?.titulo,
    engenheiro: r.engineer?.nome,
    data: new Date().toLocaleDateString('pt-BR'),
    template: r.template?.nome,
  }
  const fileName = `discovery-${(r.opportunity?.titulo ?? 'uplink')
    .toLowerCase()
    .replace(/\s+/g, '-')}.pdf`
  const rodape = [meta.cliente, meta.oportunidade, meta.engenheiro, meta.data, meta.template]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        to="/discovery"
        className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Discovery
      </Link>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <h1 className="font-display text-[24px] font-semibold text-ink">{r.template?.nome}</h1>
        <Badge tone={finalizado ? 'live' : 'neutral'}>
          {finalizado ? 'Finalizado' : 'Rascunho'}
        </Badge>
        {r.opportunity ? (
          <span className="text-[13px] text-muted">
            {r.opportunity.titulo} · <span className="font-mono">{r.opportunity.client?.nome}</span>
          </span>
        ) : null}
      </div>

      {finalizado && r.resumo_md ? (
        <ResumoView resumoMd={r.resumo_md} fileName={fileName} rodape={rodape} />
      ) : (
        <DiscoveryForm response={r} meta={meta} onFinalizado={() => void resp.refetch()} />
      )}
    </div>
  )
}
