import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Topbar } from './shell/topbar'
import { Sidebar } from './shell/sidebar'

const SIDEBAR_KEY = 'uplink-sidebar-collapsed'

export function RootLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_KEY) === '1')

  function toggle() {
    setCollapsed((c) => {
      const next = !c
      localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0')
      return next
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Topbar onToggleSidebar={toggle} />
      <div className="flex flex-1">
        <Sidebar collapsed={collapsed} />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
