import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateFileTags, type FileRow } from '../hooks'

export function TagsDialog({
  file,
  open,
  onOpenChange,
}: {
  file: FileRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [value, setValue] = useState('')
  const update = useUpdateFileTags()

  useEffect(() => {
    if (file) setValue(file.tags?.join(', ') ?? '')
  }, [file])

  async function salvar() {
    if (!file) return
    const tags = Array.from(
      new Set(
        value
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    )
    try {
      await update.mutateAsync({ file, tags })
      toast.success('Tags atualizadas')
      onOpenChange(false)
    } catch {
      toast.error('Não foi possível salvar as tags.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Tags do arquivo</DialogTitle>
          <DialogDescription>Separe por vírgula.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tags-input">Tags</Label>
          <Input
            id="tags-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="topologia, sd-wan"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button onClick={salvar} disabled={update.isPending}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
