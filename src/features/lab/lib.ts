import { format } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import { TIMEZONE } from '@/lib/tz'
import type { BadgeTone } from '@/components/ui/badge'
import type { OcupacaoBloco } from '@/components/shared/faixa-ocupacao'
import type { ReservationWithRefs } from './hooks'

export const resourceTipoLabel: Record<string, string> = {
  licenca: 'Licença',
  servidor_lab: 'Servidor de lab',
  porta_switch: 'Porta de switch',
  conta_demo: 'Conta demo',
  credito_nuvem: 'Crédito de nuvem',
  equipamento: 'Equipamento',
}

export function resourceStatusTone(status: string): BadgeTone {
  if (status === 'disponivel') return 'live'
  if (status === 'manutencao') return 'warn'
  return 'neutral'
}

export const resourceStatusLabel: Record<string, string> = {
  disponivel: 'Disponível',
  manutencao: 'Manutenção',
  baixado: 'Baixado',
}

export const noticeTipoLabel: Record<string, string> = {
  aviso: 'Aviso',
  manutencao: 'Manutenção',
  vencimento: 'Vencimento',
  incidente: 'Incidente',
}

export function noticeTipoTone(tipo: string): BadgeTone {
  if (tipo === 'incidente') return 'halt'
  if (tipo === 'vencimento') return 'warn'
  if (tipo === 'manutencao') return 'signal'
  return 'neutral'
}

/** Converte um datetime-local (hora de parede em São Paulo) para ISO UTC. */
function localToUtcIso(local: string): string {
  return fromZonedTime(local, TIMEZONE).toISOString()
}

/** Monta a string tstzrange `[inicio,fim)` a partir de datetimes-local. */
export function periodoFromLocal(inicio: string, fim: string): string {
  return `[${localToUtcIso(inicio)},${localToUtcIso(fim)})`
}

/** Formata uma data (UTC) como valor de <input type="datetime-local"> no fuso do produto. */
export function toLocalInput(d: Date): string {
  return format(toZonedTime(d, TIMEZONE), "yyyy-MM-dd'T'HH:mm")
}

function toDate(s: string): Date {
  let t = s.trim().replace(' ', 'T')
  t = t.replace(/([+-]\d{2})$/, '$1:00')
  return new Date(t)
}

/** Extrai [inicio, fim] de um tstzrange textual do PostgREST (tipado como unknown). */
export function parseRange(range: unknown): [Date, Date] {
  const s = typeof range === 'string' ? range : String(range ?? '')
  const m = s.match(/[[(]\s*"?([^",]+?)"?\s*,\s*"?([^"),]+?)"?\s*[\])]/)
  if (!m) return [new Date(), new Date()]
  return [toDate(m[1]), toDate(m[2])]
}

/** Blocos da faixa de ocupação a partir das reservas de um recurso. */
export function blocosFromReservations(reservations: ReservationWithRefs[]): OcupacaoBloco[] {
  return reservations.map((r) => {
    const [inicio, fim] = parseRange(r.periodo)
    const manut = /manuten/i.test(r.finalidade ?? '')
    return {
      id: r.id,
      inicio,
      fim,
      tipo: manut ? 'manutencao' : 'reserva',
      status: 'ativa',
      rotulo: `${r.user?.nome ?? '—'} · ${r.finalidade ?? 'reserva'}`,
    }
  })
}
