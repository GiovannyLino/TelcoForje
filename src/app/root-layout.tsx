import { Suspense, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Topbar } from './shell/topbar'
import { Sidebar } from './shell/sidebar'
import { HelpSheet } from './shell/help-sheet'
import { CommandPalette } from '@/features/search/components/command-palette'
import { Skeleton } from '@/components/ui/skeleton'

const SIDEBAR_KEY = 'telcoforge-sidebar-collapsed'

export function RootLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_KEY) === '1')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  function toggleSidebar() {
    setCollapsed((c) => {
      const next = !c
      localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0')
      return next
    })
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
        return
      }
      const el = e.target as HTMLElement | null
      const digitando =
        el?.tagName === 'INPUT' || el?.tagName === 'TEXTAREA' || el?.isContentEditable
      if (!digitando && e.key === '?') {
        e.preventDefault()
        setHelpOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Topbar onToggleSidebar={toggleSidebar} onOpenSearch={() => setPaletteOpen(true)} />
      <div className="flex flex-1">
        <Sidebar collapsed={collapsed} />
        <main className="min-w-0 flex-1">
          <Suspense
            fallback={
              <div className="px-6 py-8">
                <Skeleton className="h-64 max-w-4xl" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <HelpSheet open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  )
}
