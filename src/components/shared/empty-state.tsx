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
        'flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-line bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="text-muted [&_svg]:size-6" aria-hidden>
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
