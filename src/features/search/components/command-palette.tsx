import { useState } from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { useSearch } from '../hooks'
import { entityLabel, entityRoute } from '../lib'
import { Highlighted } from './highlighted'

const groupClass =
  '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-muted'

function Item({ children, onSelect }: { children: ReactNode; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="cursor-pointer rounded-sm px-2 py-2 text-[13px] text-ink outline-none data-[selected=true]:bg-surface-2"
    >
      {children}
    </Command.Item>
  )
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const { data } = useSearch(q)

  function go(path: string) {
    onOpenChange(false)
    setQ('')
    navigate(path)
  }

  const acoes: { label: string; path: string }[] = [
    { label: 'Ir para Oportunidades', path: '/oportunidades' },
    { label: 'Ir para o Kanban', path: '/kanban' },
    { label: 'Ir para Lab & recursos', path: '/lab' },
    { label: 'Ir para Discovery', path: '/discovery' },
    { label: 'Ir para Templates', path: '/templates' },
  ]

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40" />
        <DialogPrimitive.Content className="fixed left-1/2 top-24 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-md border border-line bg-surface shadow-lg">
          <DialogPrimitive.Title className="sr-only">Busca e ações</DialogPrimitive.Title>
          <Command shouldFilter={false} className="flex flex-col">
            <div className="flex items-center gap-2 border-b border-line px-3">
              <Search className="size-4 text-muted" aria-hidden />
              <Command.Input
                value={q}
                onValueChange={setQ}
                placeholder="Buscar ou executar uma ação…"
                className="h-11 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                autoFocus
              />
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-2">
              <Command.Empty className="px-2 py-6 text-center text-[13px] text-muted">
                {q.trim().length < 2 ? 'Digite para buscar…' : 'Nada encontrado.'}
              </Command.Empty>

              <Command.Group heading="Ações" className={groupClass}>
                {acoes.map((a) => (
                  <Item key={a.path} onSelect={() => go(a.path)}>
                    {a.label}
                  </Item>
                ))}
              </Command.Group>

              {data && data.length > 0 ? (
                <Command.Group heading="Resultados" className={groupClass}>
                  {data.map((r) => (
                    <Item key={`${r.entity_type}-${r.entity_id}`} onSelect={() => go(entityRoute(r))}>
                      <div className="flex flex-col gap-0.5">
                        <span>
                          {r.titulo}{' '}
                          <span className="text-[12px] text-muted">· {entityLabel(r.entity_type)}</span>
                        </span>
                        <Highlighted trecho={r.trecho} />
                      </div>
                    </Item>
                  ))}
                </Command.Group>
              ) : null}
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
