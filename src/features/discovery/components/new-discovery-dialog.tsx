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
import { useCreateResponse, useDiscoveryTemplates } from '../hooks'

export function NewDiscoveryDialog({
  trigger,
  opportunityId,
}: {
  trigger: ReactNode
  opportunityId?: string
}) {
  const [open, setOpen] = useState(false)
  const [oppId, setOppId] = useState(opportunityId ?? '')
  const [templateId, setTemplateId] = useState('')
  const opps = useOpportunities()
  const templates = useDiscoveryTemplates()
  const create = useCreateResponse()
  const navigate = useNavigate()

  async function iniciar() {
    if (!oppId || !templateId) {
      toast.error('Escolha a oportunidade e o template.')
      return
    }
    const tpl = templates.data?.find((t) => t.id === templateId)
    if (!tpl) return
    try {
      const resp = await create.mutateAsync({
        templateId: tpl.id,
        templateVersao: tpl.versao,
        opportunityId: oppId,
      })
      setOpen(false)
      navigate(`/discovery/${resp.id}`)
    } catch {
      toast.error('Não foi possível iniciar o discovery.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo discovery</DialogTitle>
          <DialogDescription>Checklist técnico para preencher em reunião.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {!opportunityId ? (
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
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label>Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {templates.data?.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button onClick={() => void iniciar()} disabled={create.isPending}>
            Começar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
