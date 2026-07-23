import { Link } from 'react-router-dom'
import { Plus, Target, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusPill } from '@/components/shared/status-pill'
import { useOpportunities } from '../hooks'
import { OpportunityCreateDialog } from '../components/opportunity-create-dialog'
import { ClientCreateDialog } from '@/features/clients/components/client-create-dialog'
import { dueStatus, prioridadeLabel, prioridadeTone } from '../lib'
import { formatDateOnly } from '@/lib/format'

export function OpportunitiesPage() {
  const { data, isLoading, isError, refetch } = useOpportunities()

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <PageHeader
        title="Oportunidades"
        description="Cada oportunidade reúne arquivos, reservas e discovery de um cliente."
        actions={
          <div className="flex items-center gap-2">
            <ClientCreateDialog
              trigger={
                <Button variant="secondary" size="sm">
                  <UserPlus /> Novo cliente
                </Button>
              }
            />
            <OpportunityCreateDialog
              trigger={
                <Button size="sm">
                  <Plus /> Nova oportunidade
                </Button>
              }
            />
          </div>
        }
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          description="Não foi possível carregar as oportunidades. Verifique a conexão e tente de novo."
          onRetry={() => refetch()}
        />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<Target />}
          title="Nenhuma oportunidade ainda"
          description="Crie a primeira para começar a desenhar a solução."
          action={
            <OpportunityCreateDialog
              trigger={
                <Button size="sm">
                  <Plus /> Nova oportunidade
                </Button>
              }
            />
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {data.map((o) => {
            const due = dueStatus(o.due_date)
            return (
              <li key={o.id}>
                <Link
                  to={`/oportunidades/${o.id}`}
                  className="flex items-center gap-4 rounded-md border border-line bg-surface px-4 py-3 transition-colors hover:bg-surface-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-display text-[15px] font-medium text-ink">
                        {o.titulo}
                      </span>
                      <Badge tone={prioridadeTone(o.prioridade)}>
                        {prioridadeLabel[o.prioridade]}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[12px] text-muted">
                      <span className="font-mono">{o.client?.nome ?? '—'}</span>
                      <span aria-hidden>·</span>
                      <span>{o.column?.nome}</span>
                      {o.owner?.nome ? (
                        <>
                          <span aria-hidden>·</span>
                          <span>{o.owner.nome}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {due ? <StatusPill tone={due.tone}>{due.label}</StatusPill> : null}
                  <span className="hidden font-mono text-[12px] text-muted sm:inline">
                    {formatDateOnly(o.due_date)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
