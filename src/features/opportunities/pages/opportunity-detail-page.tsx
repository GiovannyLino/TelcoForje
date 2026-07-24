import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Activity, ArrowLeft, CalendarClock, FileText, MoreHorizontal, Trash2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { EmptyState } from '@/components/shared/empty-state'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ContextRail } from '../components/context-rail'
import { useBoardColumns, useDeleteOpportunity, useOpportunity, useUpdateOpportunity } from '../hooks'
import { dueStatus, prioridadeLabel, prioridadeTone } from '../lib'
import { formatDateOnly } from '@/lib/format'
import { WorkspacePanel } from '@/features/workspace/components/workspace-panel'
import { OppDiscoveries } from '@/features/discovery/components/opp-discoveries'
import { useDocumentsByOpportunity } from '@/features/documents/hooks'
import { useReservations } from '@/features/lab/hooks'
import { parseRange } from '@/features/lab/lib'
import { useActivityByOpportunity, frase } from '@/features/activity/hooks'
import { StatusPill, type StatusTone } from '@/components/shared/status-pill'
import { formatDateTime, formatRelative } from '@/lib/format'

function OppDocumentos({ oppId }: { oppId: string }) {
  const docs = useDocumentsByOpportunity(oppId)
  if (docs.isLoading) return <Skeleton className="h-24" />
  if (!docs.data || docs.data.length === 0) {
    return (
      <EmptyState
        icon={<FileText />}
        title="Nenhum documento"
        description="Use um template da biblioteca para criar um documento aqui."
      />
    )
  }
  return (
    <ul className="flex flex-col gap-1">
      {docs.data.map((d) => (
        <li
          key={d.id}
          className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink"
        >
          {d.titulo}
        </li>
      ))}
    </ul>
  )
}

const reservaTone: Record<string, StatusTone> = {
  ativa: 'signal',
  concluida: 'live',
  cancelada: 'neutral',
}
const reservaLabel: Record<string, string> = {
  ativa: 'Ativa',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}

function OppReservas({ oppId }: { oppId: string }) {
  const reservas = useReservations()
  if (reservas.isLoading) return <Skeleton className="h-24" />
  const doOpp = (reservas.data ?? []).filter((r) => r.opportunity_id === oppId)
  if (doOpp.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock />}
        title="Nenhuma reserva"
        description="Reserve recursos de laboratório para esta demanda na aba Lab & recursos."
      />
    )
  }
  return (
    <ul className="flex flex-col gap-2">
      {doOpp.map((r) => {
        const [ini, fim] = parseRange(r.periodo)
        return (
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-surface/60 px-3 py-2 text-[13px]"
          >
            <div className="flex flex-col">
              <span className="text-ink">{r.resource?.nome ?? '—'}</span>
              {r.finalidade ? <span className="text-[12px] text-muted">{r.finalidade}</span> : null}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[12px] text-muted">
                {formatDateTime(ini)} → {formatDateTime(fim)}
              </span>
              <StatusPill tone={reservaTone[r.status] ?? 'neutral'}>
                {reservaLabel[r.status] ?? r.status}
              </StatusPill>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function OppAtividade({ oppId }: { oppId: string }) {
  const atividade = useActivityByOpportunity(oppId)
  if (atividade.isLoading) return <Skeleton className="h-24" />
  if (!atividade.data || atividade.data.length === 0) {
    return (
      <EmptyState
        icon={<Activity />}
        title="Sem atividade ainda"
        description="As ações do time nesta oportunidade aparecerão aqui."
      />
    )
  }
  return (
    <ul className="flex flex-col gap-3">
      {atividade.data.map((a) => (
        <li key={a.id} className="flex items-start gap-2.5 text-[13px]">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-signal" aria-hidden />
          <div className="flex flex-col">
            <span className="text-ink">{frase(a)}</span>
            <span className="text-[11px] text-muted">{formatRelative(a.created_at)}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const opp = useOpportunity(id)
  const columns = useBoardColumns()
  const update = useUpdateOpportunity()
  const del = useDeleteOpportunity()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (opp.isLoading) {
    return (
      <div className="px-6 py-8">
        <Skeleton className="h-40 max-w-3xl" />
      </div>
    )
  }
  if (opp.isError || !opp.data) {
    return (
      <div className="px-6 py-8">
        <ErrorState
          description="Não foi possível carregar esta oportunidade."
          onRetry={() => opp.refetch()}
        />
      </div>
    )
  }

  const o = opp.data
  const due = dueStatus(o.due_date)

  async function mudarColuna(columnId: string) {
    try {
      await update.mutateAsync({ id: o.id, patch: { column_id: columnId } })
      toast.success('Coluna atualizada')
    } catch {
      toast.error('Não foi possível mover a oportunidade.')
    }
  }

  async function excluir() {
    try {
      await del.mutateAsync(o.id)
      toast.success('Oportunidade excluída')
      navigate('/oportunidades')
    } catch {
      toast.error('Não foi possível excluir.')
    }
  }

  return (
    <div className="flex">
      <div className="min-w-0 flex-1 px-6 py-8">
        <Link
          to="/oportunidades"
          className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" /> Oportunidades
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[28px] font-semibold leading-none text-ink">
                {o.titulo}
              </h1>
              <Badge tone={prioridadeTone(o.prioridade)}>{prioridadeLabel[o.prioridade]}</Badge>
              {due ? <Badge tone={due.tone}>{due.label}</Badge> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
              <span className="font-mono text-ink">{o.client?.nome}</span>
              <span aria-hidden>·</span>
              <span>dono {o.owner?.nome ?? '—'}</span>
              <span aria-hidden>·</span>
              <span>prazo {formatDateOnly(o.due_date)}</span>
            </div>
            {o.tags?.length ? (
              <div className="flex flex-wrap gap-1">
                {o.tags.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Select value={o.column_id} onValueChange={mudarColuna}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {columns.data?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Ações da oportunidade">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setConfirmOpen(true)}>
                  <Trash2 /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {o.descricao ? <p className="mt-3 max-w-2xl text-[14px] text-ink">{o.descricao}</p> : null}

        <div className="mt-6">
          <Tabs defaultValue="arquivos">
            <TabsList>
              <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
              <TabsTrigger value="discoveries">Discoveries</TabsTrigger>
              <TabsTrigger value="reservas">Reservas</TabsTrigger>
              <TabsTrigger value="atividade">Atividade</TabsTrigger>
            </TabsList>
            <TabsContent value="arquivos">
              <WorkspacePanel opportunityId={o.id} />
            </TabsContent>
            <TabsContent value="documentos">
              <OppDocumentos oppId={o.id} />
            </TabsContent>
            <TabsContent value="discoveries">
              <OppDiscoveries oppId={o.id} />
            </TabsContent>
            <TabsContent value="reservas">
              <OppReservas oppId={o.id} />
            </TabsContent>
            <TabsContent value="atividade">
              <OppAtividade oppId={o.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {id ? <ContextRail oppId={id} /> : null}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir oportunidade?</DialogTitle>
            <DialogDescription>
              Isto remove “{o.titulo}” e não pode ser desfeito.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button variant="danger" onClick={excluir} disabled={del.isPending}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
