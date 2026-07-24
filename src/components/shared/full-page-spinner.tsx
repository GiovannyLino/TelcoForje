export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <div className="flex items-center gap-2">
        <span className="size-2 animate-pulse rounded-full bg-signal" aria-hidden />
        <span className="font-display text-[15px] font-medium text-ink">
          Telco<span className="text-signal">Forge</span>
        </span>
      </div>
    </div>
  )
}
