import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/error-state'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { daysUntil } from '@/lib/format'
import { useBoardColumns, useOpportunities } from '@/features/opportunities/hooks'
import { useClients } from '@/features/clients/hooks'
import { PRIORIDADES } from '@/features/opportunities/schemas'
import { prioridadeLabel } from '@/features/opportunities/lib'
import { useMoveOpportunity } from '../hooks'
import { cardsInColumn, computePosition } from '../lib'
import { BoardColumn } from '../components/board-column'
import { BoardCardOverlay } from '../components/board-card'

export function BoardPage() {
  const columns = useBoardColumns()
  const opps = useOpportunities()
  const clients = useClients()
  const move = useMoveOpportunity()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [fCliente, setFCliente] = useState('todos')
  const [fPrioridade, setFPrioridade] = useState('todas')
  const [fResp, setFResp] = useState('todos')
  const [fVencendo, setFVencendo] = useState(false)

  const owners = useMemo(() => {
    const map = new Map<string, string>()
    opps.data?.forEach((o) => {
      if (o.owner) map.set(o.owner.id, o.owner.nome)
    })
    return Array.from(map, ([id, nome]) => ({ id, nome }))
  }, [opps.data])

  const filtered = useMemo(() => {
    let list = opps.data ?? []
    if (fCliente !== 'todos') list = list.filter((o) => o.client_id === fCliente)
    if (fPrioridade !== 'todas') list = list.filter((o) => o.prioridade === fPrioridade)
    if (fResp !== 'todos') list = list.filter((o) => o.owner_id === fResp)
    if (fVencendo)
      list = list.filter((o) => {
        const d = daysUntil(o.due_date)
        return d !== null && d <= 3
      })
    return list
  }, [opps.data, fCliente, fPrioridade, fResp, fVencendo])

  const columnIds = columns.data?.map((c) => c.id) ?? []
  const findColumn = (idOrCol: string) =>
    columnIds.includes(idOrCol) ? idOrCol : filtered.find((o) => o.id === idOrCol)?.column_id

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)
    if (activeId === overId) return
    const overCol = findColumn(overId)
    if (!overCol) return
    const target = cardsInColumn(filtered, overCol).filter((o) => o.id !== activeId)
    let index = overId === overCol ? target.length : target.findIndex((o) => o.id === overId)
    if (index < 0) index = target.length
    const before = index > 0 ? target[index - 1].position : null
    const after = index < target.length ? target[index].position : null
    move.mutate(
      { id: activeId, column_id: overCol, position: computePosition(before, after) },
      {
        onError: () =>
          toast.error('Não foi possível mover. Você só move oportunidades das quais é dono.'),
      },
    )
  }

  const activeOpp = activeId ? (filtered.find((o) => o.id === activeId) ?? null) : null

  return (
    <div className="flex h-full flex-col px-6 py-8">
      <PageHeader title="Kanban" description="Cada card é uma oportunidade. Arraste pelo ícone à esquerda." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={fCliente} onValueChange={setFCliente}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os clientes</SelectItem>
            {clients.data?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={fResp} onValueChange={setFResp}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {owners.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={fPrioridade} onValueChange={setFPrioridade}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Toda prioridade</SelectItem>
            {PRIORIDADES.map((p) => (
              <SelectItem key={p} value={p}>
                {prioridadeLabel[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="button"
          onClick={() => setFVencendo((v) => !v)}
          className={cn(
            'rounded-md border px-3 py-1.5 text-[13px]',
            fVencendo
              ? 'border-warn/40 bg-warn-weak text-warn'
              : 'border-line text-muted hover:bg-surface-2',
          )}
        >
          Vencendo (≤3d)
        </button>
      </div>

      {opps.isLoading || columns.isLoading ? (
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-72" />
          ))}
        </div>
      ) : opps.isError ? (
        <ErrorState description="Não foi possível carregar o board." onRetry={() => opps.refetch()} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="flex flex-1 gap-3 overflow-x-auto pb-4">
            {columns.data?.map((col) => (
              <BoardColumn key={col.id} column={col} cards={cardsInColumn(filtered, col.id)} />
            ))}
          </div>
          <DragOverlay>{activeOpp ? <BoardCardOverlay opp={activeOpp} /> : null}</DragOverlay>
        </DndContext>
      )}
    </div>
  )
}
