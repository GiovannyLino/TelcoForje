import { cn } from '@/lib/utils'

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string
  showWordmark?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg viewBox="0 0 32 32" className="size-6" aria-hidden>
        <rect width="32" height="32" rx="4" className="fill-ink" />
        <path
          d="M16 7 L23 22 H9 Z"
          fill="none"
          className="stroke-signal"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="24.5" r="1.6" className="fill-live" />
      </svg>
      {showWordmark ? (
        <span className="font-display text-[16px] font-semibold text-ink">Uplink</span>
      ) : null}
    </span>
  )
}
