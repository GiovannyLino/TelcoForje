import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import { BoardCard } from './board-card'
import type { BoardColumn as Col, OpportunityWithRefs } from '@/features/opportunities/hooks'

export function BoardColumn({ column, cards }: { column: Col; cards: OpportunityWithRefs[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className="flex w-72 shrink-0 flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-medium text-ink">{column.nome}</span>
        <span className="font-mono text-[12px] text-muted">{cards.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-24 flex-1 flex-col gap-2 rounded-md border border-line bg-paper p-2',
          isOver && 'border-signal',
        )}
      >
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((c) => (
            <BoardCard key={c.id} opp={c} />
          ))}
        </SortableContext>
        {cards.length === 0 ? (
          <p className="px-1 py-4 text-center text-[12px] text-muted">Sem cards</p>
        ) : null}
      </div>
    </div>
  )
}
