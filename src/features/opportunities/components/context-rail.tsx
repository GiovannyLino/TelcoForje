import type { ReactNode } from 'react'
import { Activity, CalendarClock, ClipboardList, FileText, Paperclip } from 'lucide-react'
import { useFilesByOpportunity } from '@/features/workspace/hooks'
import { useDocumentsByOpportunity } from '@/features/documents/hooks'
import { formatBytes } from '@/lib/format'

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

export function ContextRail({ oppId }: { oppId: string }) {
  const files = useFilesByOpportunity(oppId)
  const docs = useDocumentsByOpportunity(oppId)

  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-5 border-l border-line bg-surface p-4 xl:flex">
      <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted">Contexto</h2>

      <RailSection icon={<Paperclip />} title="Arquivos" count={files.data?.length}>
        {files.data && files.data.length > 0 ? (
          files.data.slice(0, 6).map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-2 text-[12px]">
              <span className="truncate font-mono text-ink">{f.nome}</span>
              <span className="shrink-0 text-muted">{formatBytes(f.size_bytes)}</span>
            </div>
          ))
        ) : (
          <p className="text-[12px] text-muted">Nenhum arquivo.</p>
        )}
      </RailSection>

      <RailSection icon={<FileText />} title="Documentos" count={docs.data?.length}>
        {docs.data && docs.data.length > 0 ? (
          docs.data.map((d) => (
            <div key={d.id} className="truncate text-[12px] text-ink">
              {d.titulo}
            </div>
          ))
        ) : (
          <p className="text-[12px] text-muted">Nenhum documento.</p>
        )}
      </RailSection>

      <RailSection icon={<CalendarClock />} title="Reservas">
        <p className="text-[12px] text-muted">Chega na Fase 4.</p>
      </RailSection>
      <RailSection icon={<ClipboardList />} title="Discoveries">
        <p className="text-[12px] text-muted">Chega na Fase 5.</p>
      </RailSection>
      <RailSection icon={<Activity />} title="Atividade">
        <p className="text-[12px] text-muted">Chega na Fase 6.</p>
      </RailSection>
    </aside>
  )
}
