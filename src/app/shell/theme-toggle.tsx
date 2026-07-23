import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/app/theme'

export function ThemeToggle() {
  const { resolvedTheme, toggle } = useTheme()
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema claro e escuro">
      {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}
