import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FilePlus, FileText, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTemplates } from '../hooks'
import { TEMPLATE_TIPOS, tipoLabel } from '../schemas'
import { UseTemplateDialog } from '../components/use-template-dialog'

export function TemplatesPage() {
  const { data, isLoading, isError, refetch } = useTemplates()
  const [filtro, setFiltro] = useState<string>('todos')
  const list = data?.filter((t) => filtro === 'todos' || t.tipo === filtro)

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <PageHeader
        title="Templates"
        description="Respostas de RFP, modelos de PoC e blocos de proposta curados pelo time."
        actions={
          <Button asChild size="sm">
            <Link to="/templates/novo">
              <FilePlus /> Novo template
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1">
        {['todos', ...TEMPLATE_TIPOS].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFiltro(t)}
            className={cn(
              'rounded-md px-2.5 py-1 text-[13px]',
              filtro === t ? 'bg-signal-weak text-signal' : 'text-muted hover:bg-surface-2',
            )}
          >
            {t === 'todos' ? 'Todos' : tipoLabel[t]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          description="Não foi possível carregar os templates. Tente de novo."
          onRetry={() => refetch()}
        />
      ) : !list || list.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="Nenhum template ainda"
          description="Crie um modelo reutilizável de RFP, PoC ou proposta."
          action={
            <Button asChild size="sm">
              <Link to="/templates/novo">
                <FilePlus /> Novo template
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((t) => (
            <div key={t.id} className="flex flex-col gap-2 rounded-md border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-[15px] font-medium text-ink">{t.titulo}</h3>
                <Badge tone="signal">{tipoLabel[t.tipo]}</Badge>
              </div>
              {t.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {t.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              ) : null}
              <div className="mt-1 flex items-center gap-2">
                <UseTemplateDialog
                  template={t}
                  trigger={<Button size="sm">Usar este template</Button>}
                />
                <Button asChild variant="ghost" size="sm">
                  <Link to={`/templates/${t.id}`}>
                    <Pencil /> Editar
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
