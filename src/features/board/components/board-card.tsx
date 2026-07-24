import type { ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Link } from 'react-router-dom'
import { GripVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StatusPill } from '@/components/shared/status-pill'
import { dueStatus, prioridadeLabel, prioridadeTone } from '@/features/opportunities/lib'
import type { OpportunityWithRefs } from '@/features/opportunities/hooks'
import { cn } from '@/lib/utils'

function CardBody({
  opp,
  grip,
  className,
}: {
  opp: OpportunityWithRefs
  grip: ReactNode
  className?: string
}) {
  const due = dueStatus(opp.due_date)
  return (
    <div
      className={cn(
        'flex items-start gap-1 rounded-md border border-line bg-surface p-2.5',
        due?.tone === 'halt' && 'border-l-2 border-l-halt',
        className,
      )}
    >
      {grip}
      <Link to={`/oportunidades/${opp.id}`} className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[13px] font-medium text-ink">{opp.titulo}</span>
          <Badge tone={prioridadeTone(opp.prioridade)}>{prioridadeLabel[opp.prioridade]}</Badge>
        </div>
        <div className="flex items-center justify-between gap-2 text-[12px] text-muted">
          <span className="truncate font-mono">{opp.client?.nome}</span>
          {due ? <StatusPill tone={due.tone}>{due.label}</StatusPill> : null}
        </div>
      </Link>
    </div>
  )
}

const gripClass = 'mt-0.5 cursor-grab touch-none text-muted hover:text-ink active:cursor-grabbing'

export function BoardCardOverlay({ opp }: { opp: OpportunityWithRefs }) {
  return (
    <CardBody
      opp={opp}
      className="shadow-lg"
      grip={
        <span className={gripClass} aria-hidden>
          <GripVertical className="size-4" />
        </span>
      }
    />
  )
}

export function BoardCard({ opp }: { opp: OpportunityWithRefs }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: opp.id,
  })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'opacity-40')}
    >
      <CardBody
        opp={opp}
        grip={
          <button {...attributes} {...listeners} aria-label="Mover card" className={gripClass}>
            <GripVertical className="size-4" />
          </button>
        }
      />
    </div>
  )
}
