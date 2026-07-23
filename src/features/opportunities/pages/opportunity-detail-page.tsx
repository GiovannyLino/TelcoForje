import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, FileText, MoreHorizontal, Paperclip, Trash2 } from 'lucide-react'
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
import { formatBytes, formatDateOnly } from '@/lib/format'
import { useFilesByOpportunity } from '@/features/workspace/hooks'
import { useDocumentsByOpportunity } from '@/features/documents/hooks'

function OppArquivos({ oppId }: { oppId: string }) {
  const files = useFilesByOpportunity(oppId)
  if (files.isLoading) return <Skeleton className="h-24" />
  if (!files.data || files.data.length === 0) {
    return (
      <EmptyState
        icon={<Paperclip />}
        title="Nenhum arquivo nesta oportunidade"
        description="Anexe arquivos nas pastas do workspace desta oportunidade."
      />
    )
  }
  return (
    <ul className="flex flex-col gap-1">
      {files.data.map((f) => (
        <li
          key={f.id}
          className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface px-3 py-2 text-[13px]"
        >
          <span className="truncate font-mono text-ink">{f.nome}</span>
          <span className="flex shrink-0 items-center gap-3 text-muted">
            <span>v{f.versao}</span>
            <span>{formatBytes(f.size_bytes)}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

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
              <OppArquivos oppId={o.id} />
            </TabsContent>
            <TabsContent value="documentos">
              <OppDocumentos oppId={o.id} />
            </TabsContent>
            <TabsContent value="discoveries">
              <EmptyState
                title="Discovery chega na Fase 5"
                description="Aqui vão os checklists técnicos preenchidos em reunião."
              />
            </TabsContent>
            <TabsContent value="reservas">
              <EmptyState
                title="Reservas chegam na Fase 4"
                description="Os recursos de laboratório reservados para a demo aparecem aqui."
              />
            </TabsContent>
            <TabsContent value="atividade">
              <EmptyState
                title="Linha do tempo chega na Fase 6"
                description="O histórico de atividade do time nesta oportunidade."
              />
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
