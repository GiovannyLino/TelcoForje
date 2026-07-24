import { useState, type FormEvent, type ReactNode } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateFolder, type FolderVisibility } from '../hooks'

export function CreateFolderDialog({
  opportunityId,
  trigger,
}: {
  opportunityId: string
  trigger: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [visibility, setVisibility] = useState<FolderVisibility>('private')
  const create = useCreateFolder()

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (nome.trim().length < 2) {
      toast.error('Dê um nome à pasta.')
      return
    }
    try {
      await create.mutateAsync({ opportunityId, nome: nome.trim(), visibility })
      toast.success('Pasta criada')
      setNome('')
      setVisibility('private')
      setOpen(false)
    } catch {
      toast.error('Não foi possível criar a pasta.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nova pasta</DialogTitle>
          <DialogDescription>Privada (só você) ou do time (todos leem, você escreve).</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fld-nome">Nome</Label>
            <Input id="fld-nome" autoFocus value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Visibilidade</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as FolderVisibility)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Privada</SelectItem>
                <SelectItem value="team">Do time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={create.isPending}>
              Criar pasta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
