import type { BadgeTone } from '@/components/ui/badge'
import { daysUntil } from '@/lib/format'

export const prioridadeLabel: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
}

export function prioridadeTone(p: string): BadgeTone {
  if (p === 'critica') return 'halt'
  if (p === 'alta') return 'warn'
  if (p === 'media') return 'signal'
  return 'neutral'
}

export type DueStatus = { tone: BadgeTone; label: string } | null

export function dueStatus(due: string | null): DueStatus {
  const d = daysUntil(due)
  if (d === null) return null
  if (d < 0) return { tone: 'halt', label: `vencido há ${Math.abs(d)}d` }
  if (d === 0) return { tone: 'warn', label: 'vence hoje' }
  if (d <= 3) return { tone: 'warn', label: `vence em ${d}d` }
  return { tone: 'neutral', label: `em ${d}d` }
}
