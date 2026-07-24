/** Tooltip customizado para os gráficos Recharts — superfície glass, sem `any`. */
type Payload = { dataKey?: string | number; name?: string; value?: number | string; color?: string }

export function ChartTooltip({
  active,
  label,
  payload,
  unit = '',
}: {
  active?: boolean
  label?: string | number
  payload?: Payload[]
  unit?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="glass-strong rounded-md px-2.5 py-1.5 text-[12px]">
      {label != null ? <div className="mb-0.5 font-medium text-ink">{label}</div> : null}
      {payload.map((p, i) => (
        <div key={p.dataKey ?? i} className="flex items-center gap-1.5 font-mono text-muted">
          {p.color ? (
            <span className="size-2 rounded-full" style={{ background: p.color }} aria-hidden />
          ) : null}
          <span className="text-ink">
            {p.value}
            {unit}
          </span>
        </div>
      ))}
    </div>
  )
}
