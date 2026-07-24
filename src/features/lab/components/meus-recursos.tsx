import { toast } from 'sonner'
import { CalendarClock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { formatDateTime } from '@/lib/format'
import { parseRange, toLocalInput } from '../lib'
import { useCancelReservation, useMyReservations } from '../hooks'
import { ReserveDialog } from './reserve-dialog'

export function MeusRecursos() {
  const { data, isLoading } = useMyReservations()
  const cancel = useCancelReservation()

  if (isLoading) return <Skeleton className="h-32" />
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock />}
        title="Você não tem nada reservado"
        description="Reserve um laboratório para a sua próxima demo."
        action={<ReserveDialog trigger={<Button size="sm">Reservar laboratório</Button>} />}
      />
    )
  }

  const ordenadas = [...data].sort(
    (a, b) => parseRange(a.periodo)[0].getTime() - parseRange(b.periodo)[0].getTime(),
  )

  async function cancelar(id: string) {
    try {
      await cancel.mutateAsync(id)
      toast.success('Reserva cancelada')
    } catch {
      toast.error('Não foi possível cancelar.')
    }
  }

  return (
    <ul className="flex flex-col gap-2">
      {ordenadas.map((r) => {
        const [ini, fim] = parseRange(r.periodo)
        return (
          <li
            key={r.id}
            className="flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-2 text-[13px]"
          >
            <div className="min-w-0 flex-1">
              <span className="font-medium text-ink">{r.resource?.nome}</span>
              <div className="font-mono text-[12px] text-muted">
                {formatDateTime(ini)} → {formatDateTime(fim)}
              </div>
            </div>
            <ReserveDialog
              reservation={r}
              defaultInicio={toLocalInput(ini)}
              defaultFim={toLocalInput(fim)}
              trigger={
                <Button variant="ghost" size="sm">
                  Reagendar
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cancelar reserva"
              onClick={() => void cancelar(r.id)}
            >
              <X />
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
