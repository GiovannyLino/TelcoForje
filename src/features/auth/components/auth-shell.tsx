import type { ReactNode } from 'react'
import { Logo } from '@/components/shared/logo'
import { APP_VENDOR } from '@/lib/constants'
import { PartnerMarquee } from './partner-marquee'

function AuroraBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="aurora-blob drift-a left-[-10%] top-[-15%] size-184 opacity-70"
        style={{ background: 'var(--aurora-1)' }}
      />
      <div
        className="aurora-blob drift-b right-[-12%] top-[-8%] size-160 opacity-60"
        style={{ background: 'var(--aurora-3)' }}
      />
      <div
        className="aurora-blob drift-a bottom-[-18%] left-[35%] size-168 opacity-60"
        style={{ background: 'var(--aurora-2)' }}
      />
    </div>
  )
}

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
    <div className="app-bg relative min-h-dvh overflow-hidden">
      <AuroraBackdrop />
      <PartnerMarquee />

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rise-in">
          <div className="mb-7 flex flex-col items-center gap-4 text-center">
            <Logo size="lg" markClassName="drop-shadow-sm" />
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-[22px] font-semibold text-ink">{title}</h1>
              <p className="text-[13px] text-muted">{subtitle}</p>
            </div>
          </div>

          <div className="glass-strong sheen rounded-2xl p-7">{children}</div>

          <p className="mt-6 text-center text-[11px] uppercase tracking-widest text-muted/80">
            por {APP_VENDOR} · parceiros de tecnologia
          </p>
        </div>
      </div>
    </div>
  )
}
