import { useMemo, useState } from 'react'
import { addDays, format, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FaixaOcupacao } from '@/components/shared/faixa-ocupacao'
import { blocosFromReservations, parseRange, toLocalInput } from '../lib'
import { useReservations, useResources } from '../hooks'
import { ReserveDialog } from './reserve-dialog'

export function LabCalendar() {
  const resources = useResources()
  const reservas = useReservations()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart])

  const doRecurso = (rid: string) =>
    (reservas.data ?? [])
      .filter((r) => r.resource_id === rid)
      .filter((r) => {
        const [i, f] = parseRange(r.periodo)
        return f > weekStart && i < weekEnd
      })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          aria-label="Semana anterior"
        >
          <ChevronLeft />
        </Button>
        <span className="font-mono text-[13px] text-ink">
          {format(weekStart, "dd 'de' MMM", { locale: ptBR })} –{' '}
          {format(addDays(weekStart, 6), "dd 'de' MMM", { locale: ptBR })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          aria-label="Próxima semana"
        >
          <ChevronRight />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
        >
          Hoje
        </Button>
      </div>

      {resources.isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="overflow-x-auto">
          <div className="flex min-w-[760px] flex-col gap-3">
            {resources.data?.map((r) => (
              <div key={r.id} className="grid grid-cols-[170px_1fr] items-center gap-3">
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-[13px] text-ink">{r.nome}</span>
                  <ReserveDialog
                    resourceId={r.id}
                    defaultInicio={toLocalInput(new Date(Math.max(weekStart.getTime(), Date.now())))}
                    trigger={
                      <Button variant="ghost" size="icon" aria-label={`Reservar ${r.nome}`}>
                        <Plus />
                      </Button>
                    }
                  />
                </div>
                <FaixaOcupacao
                  janelaInicio={weekStart}
                  janelaFim={weekEnd}
                  blocos={blocosFromReservations(doRecurso(r.id))}
                  agora={new Date()}
                  densidade="completa"
                  ticks={7}
                  formatoTick="dd/MM"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
