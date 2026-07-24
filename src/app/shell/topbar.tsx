import { PanelLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/logo'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'

export function Topbar({
  onToggleSidebar,
  onOpenSearch,
}: {
  onToggleSidebar: () => void
  onOpenSearch: () => void
}) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-surface px-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        aria-label="Recolher ou expandir o menu"
      >
        <PanelLeft />
      </Button>
      <Logo />
      <button
        type="button"
        onClick={onOpenSearch}
        className="ml-2 hidden h-8 w-64 items-center gap-2 rounded-md border border-line bg-paper px-2.5 text-[13px] text-muted hover:bg-surface-2 sm:flex"
      >
        <Search className="size-4" aria-hidden />
        <span>Buscar…</span>
        <kbd className="ml-auto font-mono text-[11px] text-muted">Ctrl K</kbd>
      </button>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
