import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
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
          className="group relative flex items-center rounded-md px-2.5 py-2 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-signal"
        >
          {({ isActive }) => (
            <>
              {isActive ? (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-md bg-signal-weak"
                  transition={{ type: 'spring', stiffness: 520, damping: 42 }}
                  aria-hidden
                >
                  <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-signal" />
                </motion.span>
              ) : null}
              <span
                className={cn(
                  'relative z-10 flex items-center gap-3 transition-colors',
                  isActive
                    ? 'font-medium text-signal'
                    : 'text-muted group-hover:text-ink',
                )}
              >
                <it.icon className="size-4 shrink-0" aria-hidden />
                {!collapsed && <span className="truncate">{it.label}</span>}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
