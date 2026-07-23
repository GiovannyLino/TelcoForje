import { differenceInCalendarDays, format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toZonedTime } from 'date-fns-tz'
import { TIMEZONE } from './tz'

/** Formata um timestamptz (UTC) no fuso do produto. */
export function formatDateTime(value: string | Date | null): string {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  return format(toZonedTime(d, TIMEZONE), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatRelative(value: string | Date | null): string {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  return formatDistanceToNow(d, { locale: ptBR, addSuffix: true })
}

/** Formata uma coluna `date` ('YYYY-MM-DD') sem conversão de fuso. */
export function formatDateOnly(value: string | null): string {
  if (!value) return '—'
  const [y, m, d] = value.split('-').map(Number)
  return format(new Date(y, m - 1, d), 'dd/MM/yyyy', { locale: ptBR })
}

/** Dias até um prazo (coluna date). Negativo = vencido. */
export function daysUntil(value: string | null): number | null {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  return differenceInCalendarDays(new Date(y, m - 1, d), new Date())
}

export function formatBytes(bytes: number | null): string {
  if (bytes == null) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let n = bytes
  let i = 0
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}
