import { NavLink } from 'react-router-dom'
import {
  ClipboardList,
  Columns3,
  FileText,
  LayoutDashboard,
  Search,
  Server,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/oportunidades', label: 'Oportunidades', icon: Target, end: false },
  { to: '/kanban', label: 'Kanban', icon: Columns3, end: false },
  { to: '/lab', label: 'Lab & recursos', icon: Server, end: false },
  { to: '/discovery', label: 'Discovery', icon: ClipboardList, end: false },
  { to: '/templates', label: 'Templates', icon: FileText, end: false },
  { to: '/busca', label: 'Busca', icon: Search, end: false },
]

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <nav
      className={cn(
        'sticky top-14 hidden h-[calc(100dvh-3.5rem)] shrink-0 flex-col gap-0.5 border-r border-(--glass-border) bg-surface p-2 backdrop-blur-[20px] supports-backdrop-filter:bg-(--glass) sm:flex',
        'transition-[width] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]',
        collapsed ? 'w-14' : 'w-56',
      )}
    >
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          title={collapsed ? it.label : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] transition-colors',
              isActive
                ? 'bg-signal-weak font-medium text-signal'
                : 'text-muted hover:bg-surface-2 hover:text-ink',
            )
          }
        >
          <it.icon className="size-4 shrink-0" aria-hidden />
          {!collapsed && <span className="truncate">{it.label}</span>}
        </NavLink>
      ))}
    </nav>
  )
}
