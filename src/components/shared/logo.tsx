import { cn } from '@/lib/utils'
import { APP_NAME } from '@/lib/constants'
import { LogicalisMark } from '@/assets/brand/logicalis-mark'

export function Logo({
  className,
  showWordmark = true,
  markClassName,
}: {
  className?: string
  showWordmark?: boolean
  markClassName?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogicalisMark className={cn('size-6', markClassName)} />
      {showWordmark ? (
        <span className="font-display text-[16px] font-semibold tracking-tight text-ink">
          {APP_NAME}
        </span>
      ) : (
        <span className="sr-only">{APP_NAME}</span>
      )}
    </span>
  )
}
