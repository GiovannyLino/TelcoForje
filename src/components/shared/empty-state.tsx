import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line bg-surface/40 px-6 py-12 text-center backdrop-blur-sm',
        className,
      )}
    >
      {icon ? (
        <div
          className="grid size-12 place-items-center rounded-full bg-signal-weak text-signal [&_svg]:size-5"
          aria-hidden
        >
          {icon}
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-[16px] font-medium text-ink">{title}</h3>
        <p className="mx-auto max-w-sm text-[13px] text-muted">{description}</p>
      </div>
      {action}
    </div>
  )
}
