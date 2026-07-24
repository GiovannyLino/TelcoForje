import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/empty-state'
import { useSearch } from '../hooks'
import { entityLabel, entityRoute } from '../lib'
import { Highlighted } from '../components/highlighted'

export function GlobalSearchPage() {
  const [q, setQ] = useState('')
  const { data, isFetching } = useSearch(q)
  const curto = q.trim().length < 2

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <PageHeader
        title="Busca"
        description="Oportunidades, arquivos, templates, discoveries e recados — acentuação indiferente."
      />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar…"
        autoFocus
      />
      <div className="mt-4">
        {curto ? (
          <EmptyState
            icon={<Search />}
            title="Comece a digitar"
            description="A busca cobre o conteúdo de todo o TelcoForge."
          />
        ) : data && data.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {data.map((r) => (
              <li key={`${r.entity_type}-${r.entity_id}`}>
                <Link
                  to={entityRoute(r)}
                  className="flex flex-col gap-0.5 rounded-md border border-line bg-surface px-3 py-2 hover:bg-surface-2"
                >
                  <span className="text-[13px] text-ink">
                    {r.titulo} <span className="text-muted">· {entityLabel(r.entity_type)}</span>
                  </span>
                  <Highlighted trecho={r.trecho} />
                </Link>
              </li>
            ))}
          </ul>
        ) : !isFetching ? (
          <EmptyState title={`Nada encontrado para «${q}»`} description="Tente outro termo." />
        ) : null}
      </div>
    </div>
  )
}
