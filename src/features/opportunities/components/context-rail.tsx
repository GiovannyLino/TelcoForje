import type { ReactNode } from 'react'
import { Activity, CalendarClock, ClipboardList, FileText, Paperclip } from 'lucide-react'
import { useFilesByOpportunity } from '@/features/workspace/hooks'
import { useDocumentsByOpportunity } from '@/features/documents/hooks'
import { useReservations } from '@/features/lab/hooks'
import { parseRange } from '@/features/lab/lib'
import { useDiscoveryResponsesByOpportunity } from '@/features/discovery/hooks'
import { frase, useActivityByOpportunity } from '@/features/activity/hooks'
import { formatBytes, formatDateTime, formatRelative } from '@/lib/format'

function RailSection({
  icon,
  title,
  count,
  children,
}: {
  icon: ReactNode
  title: string
  count?: number
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-muted">
        <span className="[&_svg]:size-3.5" aria-hidden>
          {icon}
        </span>
        <h3 className="text-[12px] font-medium text-ink">{title}</h3>
        {count != null ? <span className="font-mono text-[11px] text-muted">{count}</span> : null}
      </div>
      <div className="flex flex-col gap-1 pl-5.5">{children}</div>
    </section>
  )
}

const vazio = (t: string) => <p className="text-[12px] text-muted">{t}</p>

export function ContextRail({ oppId }: { oppId: string }) {
  const files = useFilesByOpportunity(oppId)
  const docs = useDocumentsByOpportunity(oppId)
  const reservas = useReservations()
  const discoveries = useDiscoveryResponsesByOpportunity(oppId)
  const atividade = useActivityByOpportunity(oppId)

  const minhasReservas = (reservas.data ?? []).filter((r) => r.opportunity_id === oppId)

  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-80 shrink-0 flex-col gap-5 overflow-y-auto border-l border-(--glass-border) bg-surface p-4 backdrop-blur-[20px] supports-backdrop-filter:bg-(--glass) xl:flex">
      <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted">Contexto</h2>

      <RailSection icon={<Paperclip />} title="Arquivos" count={files.data?.length}>
        {files.data && files.data.length > 0
          ? files.data.slice(0, 6).map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-2 text-[12px]">
                <span className="truncate font-mono text-ink">{f.nome}</span>
                <span className="shrink-0 text-muted">{formatBytes(f.size_bytes)}</span>
              </div>
            ))
          : vazio('Nenhum arquivo.')}
      </RailSection>

      <RailSection icon={<FileText />} title="Documentos" count={docs.data?.length}>
        {docs.data && docs.data.length > 0
          ? docs.data.map((d) => (
              <div key={d.id} className="truncate text-[12px] text-ink">
                {d.titulo}
              </div>
            ))
          : vazio('Nenhum documento.')}
      </RailSection>

      <RailSection icon={<CalendarClock />} title="Reservas" count={minhasReservas.length}>
        {minhasReservas.length > 0
          ? minhasReservas.slice(0, 4).map((r) => (
              <div key={r.id} className="text-[12px]">
                <span className="text-ink">{r.resource?.nome}</span>
                <span className="block font-mono text-[11px] text-muted">
                  {formatDateTime(parseRange(r.periodo)[0])}
                </span>
              </div>
            ))
          : vazio('Nenhuma reserva.')}
      </RailSection>

      <RailSection icon={<ClipboardList />} title="Discoveries" count={discoveries.data?.length}>
        {discoveries.data && discoveries.data.length > 0
          ? discoveries.data.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-2 text-[12px]">
                <span className="truncate text-ink">{d.template?.nome}</span>
                <span className="shrink-0 font-mono text-muted">{d.completude}%</span>
              </div>
            ))
          : vazio('Nenhum discovery.')}
      </RailSection>

      <RailSection icon={<Activity />} title="Atividade">
        {atividade.data && atividade.data.length > 0
          ? atividade.data.slice(0, 6).map((a) => (
              <div key={a.id} className="text-[12px]">
                <span className="text-ink">{frase(a)}</span>
                <span className="block text-[11px] text-muted">{formatRelative(a.created_at)}</span>
              </div>
            ))
          : vazio('Sem atividade ainda.')}
      </RailSection>
    </aside>
  )
}
