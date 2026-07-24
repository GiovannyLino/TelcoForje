import { useState, type ReactNode } from 'react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useOpportunities } from '@/features/opportunities/hooks'
import { useUseTemplate, type Template } from '../hooks'

export function UseTemplateDialog({
  template,
  trigger,
}: {
  template: Template
  trigger: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [oppId, setOppId] = useState('')
  const opps = useOpportunities()
  const use = useUseTemplate()
  const navigate = useNavigate()

  async function usar() {
    if (!oppId) {
      toast.error('Escolha uma oportunidade.')
      return
    }
    try {
      const doc = await use.mutateAsync({ template, opportunityId: oppId })
      toast.success('Documento criado na oportunidade')
      setOpen(false)
      navigate(`/oportunidades/${doc.opportunity_id}`)
    } catch {
      toast.error('Não foi possível usar o template.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Usar este template</DialogTitle>
          <DialogDescription>
            Cria uma cópia editável de “{template.titulo}” dentro da oportunidade.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label>Oportunidade</Label>
          <Select value={oppId} onValueChange={setOppId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {opps.data?.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.titulo} · {o.client?.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button onClick={usar} disabled={use.isPending}>
            Usar este template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
