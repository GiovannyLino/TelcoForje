import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const atalhos: { tecla: string; descricao: string }[] = [
  { tecla: 'Ctrl / ⌘ + K', descricao: 'Abrir busca e ações' },
  { tecla: '?', descricao: 'Mostrar esta ajuda' },
  { tecla: 'Esc', descricao: 'Fechar diálogos' },
]

export function HelpSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Atalhos</DialogTitle>
          <DialogDescription>Para navegar mais rápido.</DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-2">
          {atalhos.map((a) => (
            <li key={a.tecla} className="flex items-center justify-between gap-4 text-[13px]">
              <span className="text-ink">{a.descricao}</span>
              <kbd className="rounded-sm border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[12px] text-muted">
                {a.tecla}
              </kbd>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
