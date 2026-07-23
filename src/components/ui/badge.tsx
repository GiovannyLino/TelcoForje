import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type BadgeTone = 'neutral' | 'signal' | 'live' | 'warn' | 'halt'

const tones: Record<BadgeTone, string> = {
  neutral: 'border-line bg-surface-2 text-muted',
  signal: 'border-signal/30 bg-signal-weak text-signal',
  live: 'border-live/30 bg-live-weak text-live',
  warn: 'border-warn/30 bg-warn-weak text-warn',
  halt: 'border-halt/30 bg-halt-weak text-halt',
}

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[12px] font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
