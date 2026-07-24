import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDiscoveryResponses } from '../hooks'
import { NewDiscoveryDialog } from '../components/new-discovery-dialog'

export function DiscoveryListPage() {
  const { data, isLoading, isError, refetch } = useDiscoveryResponses()
  const [fEng, setFEng] = useState('todos')
  const [fCliente, setFCliente] = useState('todos')

  const engenheiros = useMemo(() => {
    const m = new Map<string, string>()
    data?.forEach((d) => {
      if (d.engineer) m.set(d.engineer_id, d.engineer.nome)
    })
    return Array.from(m, ([id, nome]) => ({ id, nome }))
  }, [data])

  const clientes = useMemo(() => {
    const s = new Set<string>()
    data?.forEach((d) => {
      const c = d.opportunity?.client?.nome
      if (c) s.add(c)
    })
    return Array.from(s)
  }, [data])

  const list = data?.filter(
    (d) =>
      (fEng === 'todos' || d.engineer_id === fEng) &&
      (fCliente === 'todos' || d.opportunity?.client?.nome === fCliente),
  )

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <PageHeader
        title="Discovery"
        description="Checklists técnicos preenchidos em reunião, por cliente e engenheiro."
        actions={
          <NewDiscoveryDialog
            trigger={
              <Button size="sm">
                <Plus /> Novo discovery
              </Button>
            }
          />
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={fCliente} onValueChange={setFCliente}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os clientes</SelectItem>
            {clientes.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={fEng} onValueChange={setFEng}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Engenheiro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {engenheiros.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState description="Não foi possível carregar os discoveries." onRetry={() => refetch()} />
      ) : !list || list.length === 0 ? (
        <EmptyState
          icon={<ClipboardList />}
          title="Nenhum discovery ainda"
          description="Comece um checklist técnico com o cliente."
          action={
            <NewDiscoveryDialog
              trigger={
                <Button size="sm">
                  <Plus /> Novo discovery
                </Button>
              }
            />
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((d) => (
            <li key={d.id}>
              <Link
                to={`/discovery/${d.id}`}
                className="flex items-center gap-4 rounded-md border border-line bg-surface px-4 py-3 hover:bg-surface-2"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-display text-[14px] font-medium text-ink">
                    {d.template?.nome}
                  </span>
                  <div className="mt-0.5 flex items-center gap-2 text-[12px] text-muted">
                    <span className="font-mono">{d.opportunity?.client?.nome ?? '—'}</span>
                    <span aria-hidden>·</span>
                    <span>{d.opportunity?.titulo}</span>
                    <span aria-hidden>·</span>
                    <span>{d.engineer?.nome}</span>
                  </div>
                </div>
                <span className="font-mono text-[12px] text-muted">{d.completude}%</span>
                <Badge tone={d.status === 'finalizado' ? 'live' : 'neutral'}>
                  {d.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
