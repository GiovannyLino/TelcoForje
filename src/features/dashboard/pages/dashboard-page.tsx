import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlarmClock,
  CalendarClock,
  ClipboardList,
  Megaphone,
  Server,
  Target,
} from 'lucide-react'
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
import { fadeUp, stagger } from '@/lib/motion'
import { StatCard } from '../components/stat-card'
import { ChartTooltip } from '../components/chart-tooltip'

function saudacao(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** Contagem por semana nas últimas `n` semanas (série real p/ sparklines). */
function bucketsSemana(dates: (string | Date | null | undefined)[], n = 8): number[] {
  const anchor = new Date()
  anchor.setHours(0, 0, 0, 0)
  const msWeek = 7 * 86_400_000
  const buckets = new Array(n).fill(0)
  for (const d of dates) {
    if (!d) continue
    const t = new Date(d).getTime()
    if (Number.isNaN(t)) continue
    const idx = n - 1 - Math.floor((anchor.getTime() - t) / msWeek)
    if (idx >= 0 && idx < n) buckets[idx] += 1
  }
  return buckets
}

const statusMeta = {
  disponivel: { label: 'Disponível', bar: 'bg-live' },
  manutencao: { label: 'Manutenção', bar: 'bg-warn' },
  baixado: { label: 'Baixado', bar: 'bg-muted' },
} as const

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

  const minhasDisc = (discoveries.data ?? []).filter((d) => d.engineer_id === user?.id)
  const discInc = minhasDisc.filter((d) => d.status === 'rascunho')
  const recursosVenc = (resources.data ?? []).filter((r) => {
    const d = daysUntil(r.expira_em)
    return d !== null && d <= 7
  })
  const recados = (notices.data ?? []).slice(0, 5)

  const statusCount = (resources.data ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})
  const totalRecursos = resources.data?.length ?? 0

  const seteDiasAtras = Date.now() - 7 * 86_400_000
  const novasSemana = meus.filter((o) => new Date(o.created_at).getTime() >= seteDiasAtras).length
  const oppSpark = bucketsSemana(meus.map((o) => o.created_at))
  const resSpark = bucketsSemana((myRes.data ?? []).map((r) => parseRange(r.periodo)[0]))
  const discSpark = bucketsSemana(minhasDisc.map((d) => d.created_at))

  if (opps.isLoading || columns.isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Skeleton className="mb-6 h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="mt-4 h-72" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-[28px] font-semibold text-ink">
          {saudacao()}, {nome}
        </h1>
        <p className="text-[13px] text-muted">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
          })}
        </p>
      </div>

      {/* KPIs */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          label="Minhas oportunidades"
          value={meus.length}
          icon={<Target />}
          tone="signal"
          delta={novasSemana > 0 ? { label: `+${novasSemana} 7d`, tone: 'live' } : undefined}
          foot={meus.length ? 'no seu funil' : 'nada atribuído'}
          spark={oppSpark}
        />
        <StatCard
          label="Reservas hoje"
          value={reservasHoje.length}
          icon={<CalendarClock />}
          tone="live"
          foot={`${myRes.data?.length ?? 0} reservas ativas`}
          spark={resSpark}
        />
        <StatCard
          label="Discoveries em aberto"
          value={discInc.length}
          icon={<ClipboardList />}
          tone="warn"
          foot={`${minhasDisc.length} no total`}
          spark={discSpark}
        />
        <StatCard
          label="Prazos ≤ 3 dias"
          value={prazos.length}
          icon={<AlarmClock />}
          tone="halt"
          foot={prazos.length ? 'requer atenção' : 'tudo em dia'}
        />
      </motion.div>

      {/* Funil + status de recursos */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mt-4 grid gap-4 lg:grid-cols-3"
      >
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Funil de oportunidades</CardTitle>
            </CardHeader>
            <CardContent>
              {meus.length === 0 ? (
                <p className="py-10 text-center text-[13px] text-muted">Nada atribuído a você.</p>
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={porColuna} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
                    <defs>
                      <linearGradient id="pipeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--signal)" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="var(--signal)" stopOpacity={0.35} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="nome"
                      tick={{ fontSize: 11, fill: 'var(--muted)' }}
                      interval={0}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: 'var(--muted)' }}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                    />
                    <Tooltip
                      cursor={{ fill: 'var(--signal-weak)', opacity: 0.5 }}
                      content={<ChartTooltip />}
                    />
                    <Bar dataKey="qtd" fill="url(#pipeGrad)" radius={[5, 5, 0, 0]} maxBarSize={56} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Status dos recursos</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3.5">
              {totalRecursos === 0 ? (
                <p className="text-[13px] text-muted">Sem recursos cadastrados.</p>
              ) : (
                (Object.keys(statusMeta) as (keyof typeof statusMeta)[]).map((k) => {
                  const n = statusCount[k] ?? 0
                  const pct = totalRecursos ? Math.round((n / totalRecursos) * 100) : 0
                  return (
                    <div key={k} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-ink">{statusMeta[k].label}</span>
                        <span className="font-mono text-muted">
                          {n} · {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                        <div
                          className={`h-full rounded-full ${statusMeta[k].bar} transition-[width] duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
              <div className="mt-1 border-t border-line pt-3 text-[12px] text-muted">
                <span className="font-mono text-ink">{totalRecursos}</span> recursos no inventário
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Listas */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <ListCard title="Prazos vencendo" icon={<AlarmClock />}>
          {prazos.length === 0 ? (
            <Vazio>Nenhum prazo próximo.</Vazio>
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
        </ListCard>

        <ListCard title="Reservas de hoje" icon={<CalendarClock />}>
          {reservasHoje.length === 0 ? (
            <Vazio>Nada reservado hoje.</Vazio>
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
        </ListCard>

        <ListCard title="Recursos vencendo" icon={<Server />}>
          {recursosVenc.length === 0 ? (
            <Vazio>Nenhum vencimento próximo.</Vazio>
          ) : (
            recursosVenc.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 text-[13px]">
                <span className="truncate text-ink">{r.nome}</span>
                <Badge tone="warn">{formatDateOnly(r.expira_em)}</Badge>
              </div>
            ))
          )}
        </ListCard>

        <ListCard title="Mural" icon={<Megaphone />}>
          {recados.length === 0 ? (
            <Vazio>Mural limpo.</Vazio>
          ) : (
            recados.map((n) => (
              <div key={n.id} className="flex items-start gap-2 text-[13px]">
                <Badge tone={noticeTipoTone(n.tipo)}>{noticeTipoLabel[n.tipo]}</Badge>
                <span className="min-w-0 flex-1 truncate text-ink">{n.corpo}</span>
              </div>
            ))
          )}
        </ListCard>
      </motion.div>
    </div>
  )
}

function ListCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[14px]">
            <span className="text-muted [&_svg]:size-4" aria-hidden>
              {icon}
            </span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">{children}</CardContent>
      </Card>
    </motion.div>
  )
}

function Vazio({ children }: { children: ReactNode }) {
  return <p className="text-[13px] text-muted">{children}</p>
}
