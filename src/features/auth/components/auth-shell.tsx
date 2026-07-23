import type { ReactNode } from 'react'
import { Logo } from '@/components/shared/logo'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo showWordmark={false} />
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-[24px] font-semibold text-ink">{title}</h1>
            <p className="text-[13px] text-muted">{subtitle}</p>
          </div>
        </div>
        <div className="rounded-md border border-line bg-surface p-6">{children}</div>
      </div>
    </div>
  )
}
