import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-4 text-center">
      <p className="font-mono text-[13px] text-muted">404</p>
      <h1 className="font-display text-[28px] font-semibold text-ink">Página não encontrada</h1>
      <Button asChild variant="secondary">
        <Link to="/">Voltar ao início</Link>
      </Button>
    </div>
  )
}
