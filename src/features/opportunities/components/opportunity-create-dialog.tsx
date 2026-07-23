import { useState, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldError } from '@/components/shared/field-error'
import { opportunitySchema, PRIORIDADES, type OpportunityInput } from '../schemas'
import { useBoardColumns, useCreateOpportunity } from '../hooks'
import { prioridadeLabel } from '../lib'
import { useClients } from '@/features/clients/hooks'

export function OpportunityCreateDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const clients = useClients()
  const columns = useBoardColumns()
  const create = useCreateOpportunity()
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OpportunityInput>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: { prioridade: 'media' },
  })

  async function onSubmit(values: OpportunityInput) {
    try {
      const opp = await create.mutateAsync(values)
      toast.success('Oportunidade criada')
      reset()
      setOpen(false)
      navigate(`/oportunidades/${opp.id}`)
    } catch {
      toast.error('Não foi possível criar a oportunidade.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova oportunidade</DialogTitle>
          <DialogDescription>Um cliente e uma demanda técnica.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="opp-titulo">Título</Label>
            <Input id="opp-titulo" autoFocus {...register('titulo')} />
            <FieldError message={errors.titulo?.message} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Cliente</Label>
              <Controller
                control={control}
                name="client_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.data?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.client_id?.message} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Coluna</Label>
              <Controller
                control={control}
                name="column_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.data?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.column_id?.message} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Prioridade</Label>
              <Controller
                control={control}
                name="prioridade"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORIDADES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {prioridadeLabel[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="opp-due">Prazo</Label>
              <Input id="opp-due" type="date" {...register('due_date')} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="opp-desc">Descrição</Label>
            <Textarea id="opp-desc" {...register('descricao')} />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando…' : 'Criar oportunidade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
