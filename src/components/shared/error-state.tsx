import { TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function ErrorState({
  title = 'Algo não carregou',
  description,
  onRetry,
  retryLabel = 'Tentar de novo',
  className,
}: {
  title?: string
  description: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-md border border-halt/30 bg-halt-weak px-6 py-10 text-center',
        className,
      )}
    >
      <TriangleAlert className="size-6 text-halt" aria-hidden />
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-[16px] font-medium text-ink">{title}</h3>
        <p className="mx-auto max-w-sm text-[13px] text-muted">{description}</p>
      </div>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  )
}
