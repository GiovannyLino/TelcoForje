import { Link } from 'react-router-dom'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { StatusPill } from '@/components/shared/status-pill'
import { useAuth } from '@/features/auth/auth-context'
import { useBoardColumns, useOpportunities } from '@/features/opportunities/hooks'
import { dueStatus } from '@/features/opportunities/lib'
import { useMyReservations, useNotices, useResources } from '@/features/lab/hooks'
import { noticeTipoLabel, noticeTipoTone, parseRange } from '@/features/lab/lib'
import { useDiscoveryResponses } from '@/features/discovery/hooks'
import { daysUntil, formatDateOnly, formatDateTime } from '@/lib/format'

function saudacao(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function DashboardPage() {
  const { user, nome } = useAuth()
  const opps = useOpportunities()
  const columns = useBoardColumns()
  const myRes = useMyReservations()
  const resources = useResources()
  const notices = useNotices()
  const discoveries = useDiscoveryResponses()

  const meus = (opps.data ?? []).filter((o) => o.owner_id === user?.id)
  const porColuna = (columns.data ?? []).map((c) => ({
    nome: c.nome.split(' ')[0],
    qtd: meus.filter((o) => o.column_id === c.id).length,
  }))
  const prazos = meus
    .filter((o) => {
      const d = daysUntil(o.due_date)
      return d !== null && d <= 3
    })
    .sort((a, b) => (daysUntil(a.due_date) ?? 0) - (daysUntil(b.due_date) ?? 0))

  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start.getTime() + 86_400_000)
  const reservasHoje = (myRes.data ?? []).filter((r) => {
    const [i, f] = parseRange(r.periodo)
    return f > start && i < end
  })

  const discInc = (discoveries.data ?? []).filter(
    (d) => d.engineer_id === user?.id && d.status === 'rascunho',
  )
  const recursosVenc = (resources.data ?? []).filter((r) => {
    const d = daysUntil(r.expira_em)
    return d !== null && d <= 7
  })
  const recados = (notices.data ?? []).slice(0, 4)

  if (opps.isLoading || columns.isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-6 font-display text-[28px] font-semibold text-ink">
        {saudacao()}, {nome}
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Meus cards</CardTitle>
          </CardHeader>
          <CardContent>
            {meus.length === 0 ? (
              <p className="text-[13px] text-muted">Nada atribuído a você.</p>
            ) : (
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={porColuna}>
                  <XAxis
                    dataKey="nome"
                    tick={{ fontSize: 10, fill: 'var(--muted)' }}
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip cursor={{ fill: 'var(--surface-2)' }} contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="qtd" fill="var(--signal)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reservas de hoje</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {reservasHoje.length === 0 ? (
              <p className="text-[13px] text-muted">Nada reservado hoje.</p>
            ) : (
              reservasHoje.map((r) => (
                <div key={r.id} className="text-[13px]">
                  <span className="text-ink">{r.resource?.nome}</span>
                  <span className="block font-mono text-[11px] text-muted">
                    {formatDateTime(parseRange(r.periodo)[0])}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prazos vencendo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {prazos.length === 0 ? (
              <p className="text-[13px] text-muted">Nenhum prazo próximo.</p>
            ) : (
              prazos.map((o) => {
                const due = dueStatus(o.due_date)
                return (
                  <Link
                    key={o.id}
                    to={`/oportunidades/${o.id}`}
                    className="flex items-center justify-between gap-2 text-[13px] hover:text-signal"
                  >
                    <span className="truncate text-ink">{o.titulo}</span>
                    {due ? <StatusPill tone={due.tone}>{due.label}</StatusPill> : null}
                  </Link>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discoveries incompletos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {discInc.length === 0 ? (
              <p className="text-[13px] text-muted">Tudo em dia.</p>
            ) : (
              discInc.map((d) => (
                <Link
                  key={d.id}
                  to={`/discovery/${d.id}`}
                  className="flex items-center justify-between gap-2 text-[13px] hover:text-signal"
                >
                  <span className="truncate text-ink">{d.template?.nome}</span>
                  <span className="font-mono text-muted">{d.completude}%</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recursos vencendo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {recursosVenc.length === 0 ? (
              <p className="text-[13px] text-muted">Nenhum vencimento próximo.</p>
            ) : (
              recursosVenc.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 text-[13px]">
                  <span className="truncate text-ink">{r.nome}</span>
                  <Badge tone="warn">{formatDateOnly(r.expira_em)}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mural</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {recados.length === 0 ? (
              <p className="text-[13px] text-muted">Mural limpo.</p>
            ) : (
              recados.map((n) => (
                <div key={n.id} className="flex items-start gap-2 text-[13px]">
                  <Badge tone={noticeTipoTone(n.tipo)}>{noticeTipoLabel[n.tipo]}</Badge>
                  <span className="text-ink">{n.corpo}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
