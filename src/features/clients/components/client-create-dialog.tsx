import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { FieldError } from '@/components/shared/field-error'
import { clientSchema, type ClientInput } from '../schemas'
import { useCreateClient } from '../hooks'

export function ClientCreateDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const create = useCreateClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientInput>({ resolver: zodResolver(clientSchema) })

  async function onSubmit(values: ClientInput) {
    try {
      await create.mutateAsync(values)
      toast.success('Cliente criado')
      reset()
      setOpen(false)
    } catch {
      toast.error('Não foi possível criar o cliente.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Novo cliente</DialogTitle>
          <DialogDescription>O cliente aparece ao criar oportunidades.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cli-nome">Nome</Label>
            <Input id="cli-nome" autoFocus {...register('nome')} />
            <FieldError message={errors.nome?.message} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cli-seg">Segmento</Label>
            <Input id="cli-seg" placeholder="Telecom, Varejo…" {...register('segmento')} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando…' : 'Criar cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
