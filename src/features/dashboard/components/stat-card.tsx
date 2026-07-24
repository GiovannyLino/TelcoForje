import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { fadeUp } from '@/lib/motion'
import { MiniSpark, type SparkTone } from './mini-spark'

const badgeTone: Record<SparkTone, string> = {
  signal: 'bg-signal-weak text-signal',
  live: 'bg-live-weak text-live',
  warn: 'bg-warn-weak text-warn',
  halt: 'bg-halt-weak text-halt',
}

export function StatCard({
  label,
  value,
  icon,
  tone = 'signal',
  delta,
  foot,
  spark,
}: {
  label: string
  value: ReactNode
  icon: ReactNode
  tone?: SparkTone
  delta?: { label: string; tone: SparkTone }
  foot?: ReactNode
  spark?: number[]
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="hover-lift flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
              {label}
            </span>
            <div className="flex items-end gap-2">
              <span className="font-display text-[30px] font-semibold leading-none text-ink">
                {value}
              </span>
              {delta ? (
                <span
                  className={cn(
                    'mb-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium',
                    badgeTone[delta.tone],
                  )}
                >
                  {delta.label}
                </span>
              ) : null}
            </div>
          </div>
          <span
            className={cn('grid size-9 shrink-0 place-items-center rounded-lg [&_svg]:size-4.5', badgeTone[tone])}
            aria-hidden
          >
            {icon}
          </span>
        </div>
        {foot ? <div className="text-[12px] text-muted">{foot}</div> : null}
        {spark && spark.length > 1 ? (
          <div className="-mx-1 -mb-1">
            <MiniSpark data={spark} tone={tone} />
          </div>
        ) : null}
      </Card>
    </motion.div>
  )
}
