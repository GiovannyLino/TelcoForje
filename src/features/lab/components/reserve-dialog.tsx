import { useState, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { TriangleAlert } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldError } from '@/components/shared/field-error'
import { formatDateTime } from '@/lib/format'
import { reservationSchema, type ReservationInput } from '../schemas'
import {
  findConflict,
  useCreateReservation,
  useRescheduleReservation,
  useResources,
  type Conflito,
  type ReservationWithRefs,
} from '../hooks'

type Props = {
  trigger: ReactNode
  resourceId?: string
  opportunityId?: string
  reservation?: ReservationWithRefs
  defaultInicio?: string
  defaultFim?: string
}

export function ReserveDialog({
  trigger,
  resourceId,
  opportunityId,
  reservation,
  defaultInicio,
  defaultFim,
}: Props) {
  const [open, setOpen] = useState(false)
  const [conflito, setConflito] = useState<Conflito | null>(null)
  const resources = useResources()
  const create = useCreateReservation()
  const reschedule = useRescheduleReservation()
  const isReschedule = Boolean(reservation)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      resource_id: reservation?.resource_id ?? resourceId ?? '',
      inicio: defaultInicio ?? '',
      fim: defaultFim ?? '',
      finalidade: reservation?.finalidade ?? '',
      opportunity_id: opportunityId ?? '',
    },
  })

  async function onSubmit(values: ReservationInput) {
    setConflito(null)
    try {
      if (isReschedule && reservation) {
        await reschedule.mutateAsync({ id: reservation.id, inicio: values.inicio, fim: values.fim })
        toast.success('Reserva reagendada')
      } else {
        await create.mutateAsync(values)
        toast.success('Laboratório reservado')
      }
      reset()
      setOpen(false)
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code === '23P01') {
        setConflito(await findConflict(values.resource_id, values.inicio, values.fim))
      } else {
        toast.error('Não foi possível concluir a reserva.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isReschedule ? 'Reagendar reserva' : 'Reservar laboratório'}</DialogTitle>
          <DialogDescription>O banco impede sobreposição no mesmo recurso.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Recurso</Label>
            <Controller
              control={control}
              name="resource_id"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={Boolean(resourceId) || isReschedule}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.data?.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.resource_id?.message} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="res-inicio">Início</Label>
              <Input id="res-inicio" type="datetime-local" {...register('inicio')} />
              <FieldError message={errors.inicio?.message} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="res-fim">Fim</Label>
              <Input id="res-fim" type="datetime-local" {...register('fim')} />
              <FieldError message={errors.fim?.message} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="res-final">Finalidade</Label>
            <Input id="res-final" placeholder="PoC, demo, teste…" {...register('finalidade')} />
          </div>

          {conflito ? (
            <div className="flex items-start gap-2 rounded-md border border-halt/30 bg-halt-weak p-3 text-[13px] text-ink">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-halt" aria-hidden />
              <p>
                Conflito: já reservado por <strong>{conflito.nome}</strong> até{' '}
                <span className="font-mono">{formatDateTime(conflito.fim)}</span>. Escolha outro
                horário ou recurso.
              </p>
            </div>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isReschedule ? 'Reagendar' : 'Reservar laboratório'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
