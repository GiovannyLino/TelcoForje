import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type StatusTone = 'neutral' | 'signal' | 'live' | 'warn' | 'halt'

const dot: Record<StatusTone, string> = {
  neutral: 'bg-muted',
  signal: 'bg-signal',
  live: 'bg-live',
  warn: 'bg-warn',
  halt: 'bg-halt',
}

export function StatusPill({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: StatusTone
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[13px] text-ink', className)}>
      <span className={cn('size-2 rounded-full', dot[tone])} aria-hidden />
      {children}
    </span>
  )
}
