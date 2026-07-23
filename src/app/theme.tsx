import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'uplink-theme'

type ThemeState = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (t: Theme) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeState | undefined>(undefined)

function apply(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
}

function readInitial(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
}

function systemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolve(theme: Theme): ResolvedTheme {
  if (theme === 'system') return systemDark() ? 'dark' : 'light'
  return theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitial)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolve(readInitial()))

  useEffect(() => {
    apply(theme)
    localStorage.setItem(STORAGE_KEY, theme)
    setResolvedTheme(resolve(theme))
  }, [theme])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (theme === 'system') setResolvedTheme(systemDark() ? 'dark' : 'light')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  const value = useMemo<ThemeState>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: setThemeState,
      toggle: () => setThemeState(resolvedTheme === 'dark' ? 'light' : 'dark'),
    }),
    [theme, resolvedTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme precisa estar dentro de <ThemeProvider>')
  return ctx
}
