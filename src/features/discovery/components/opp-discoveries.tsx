import { Link } from 'react-router-dom'
import { ClipboardList, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { useDiscoveryResponsesByOpportunity } from '../hooks'
import { NewDiscoveryDialog } from './new-discovery-dialog'

export function OppDiscoveries({ oppId }: { oppId: string }) {
  const { data, isLoading } = useDiscoveryResponsesByOpportunity(oppId)

  if (isLoading) return <Skeleton className="h-24" />

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList />}
        title="Nenhum discovery nesta oportunidade"
        description="Comece um checklist técnico com o cliente."
        action={
          <NewDiscoveryDialog
            opportunityId={oppId}
            trigger={
              <Button size="sm">
                <Plus /> Novo discovery
              </Button>
            }
          />
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <NewDiscoveryDialog
          opportunityId={oppId}
          trigger={
            <Button size="sm">
              <Plus /> Novo discovery
            </Button>
          }
        />
      </div>
      <ul className="flex flex-col gap-1">
        {data.map((r) => (
          <li key={r.id}>
            <Link
              to={`/discovery/${r.id}`}
              className="flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-2 text-[13px] hover:bg-surface-2"
            >
              <span className="min-w-0 flex-1 truncate text-ink">{r.template?.nome}</span>
              <span className="font-mono text-muted">{r.completude}%</span>
              <Badge tone={r.status === 'finalizado' ? 'live' : 'neutral'}>
                {r.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
              </Badge>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
