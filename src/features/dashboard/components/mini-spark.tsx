import { useId } from 'react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'

export type SparkTone = 'signal' | 'live' | 'warn' | 'halt'

/** Sparkline de área com gradiente — sem eixos, para dentro de cards de KPI. */
export function MiniSpark({
  data,
  tone = 'signal',
  height = 44,
}: {
  data: number[]
  tone?: SparkTone
  height?: number
}) {
  const id = useId().replace(/:/g, '')
  const points = data.map((v, i) => ({ i, v }))
  const color = `var(--${tone})`
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={points} margin={{ top: 3, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.75}
          fill={`url(#${id})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
