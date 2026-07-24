import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { FaixaOcupacao } from '@/components/shared/faixa-ocupacao'
import { daysUntil, formatDateOnly } from '@/lib/format'
import {
  blocosFromReservations,
  parseRange,
  resourceStatusLabel,
  resourceStatusTone,
  resourceTipoLabel,
} from '../lib'
import { useReservations, useResources } from '../hooks'
import { ReserveDialog } from './reserve-dialog'

function metaStr(meta: unknown): string {
  if (!meta || typeof meta !== 'object') return ''
  return Object.entries(meta as Record<string, unknown>)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join('  ·  ')
}

export function ResourceInventory() {
  const resources = useResources()
  const reservas = useReservations()
  const janelaInicio = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])
  const janelaFim = useMemo(() => new Date(janelaInicio.getTime() + 7 * 86_400_000), [janelaInicio])

  if (resources.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    )
  }
  if (resources.isError) {
    return (
      <ErrorState
        description="Não foi possível carregar os recursos."
        onRetry={() => resources.refetch()}
      />
    )
  }

  const doRecurso = (rid: string) =>
    (reservas.data ?? [])
      .filter((r) => r.resource_id === rid)
      .filter((r) => {
        const [i, f] = parseRange(r.periodo)
        return f > janelaInicio && i < janelaFim
      })

  return (
    <ul className="flex flex-col gap-2">
      {resources.data?.map((r) => {
        const venc = daysUntil(r.expira_em)
        const meta = metaStr(r.metadata)
        return (
          <li key={r.id} className="flex flex-col gap-2 rounded-md border border-line bg-surface p-3">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-[14px] font-medium text-ink">{r.nome}</span>
                  <Badge>{resourceTipoLabel[r.tipo]}</Badge>
                  <Badge tone={resourceStatusTone(r.status)}>{resourceStatusLabel[r.status]}</Badge>
                  {venc !== null && venc <= 7 ? (
                    <Badge tone="warn">vence {formatDateOnly(r.expira_em)}</Badge>
                  ) : null}
                </div>
                {meta ? <div className="mt-0.5 truncate font-mono text-[11px] text-muted">{meta}</div> : null}
              </div>
              <ReserveDialog
                resourceId={r.id}
                trigger={
                  <Button size="sm" variant="secondary">
                    <Plus /> Reservar
                  </Button>
                }
              />
            </div>
            <FaixaOcupacao
              janelaInicio={janelaInicio}
              janelaFim={janelaFim}
              blocos={blocosFromReservations(doRecurso(r.id))}
              agora={new Date()}
              densidade="mini"
            />
          </li>
        )
      })}
    </ul>
  )
}
