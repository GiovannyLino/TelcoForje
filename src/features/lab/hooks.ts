import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { qk } from '@/lib/query-keys'
import { useAuth } from '@/features/auth/auth-context'
import type { Database } from '@/types/database'
import { parseRange, periodoFromLocal } from './lib'
import type { NoticeInput, ReservationInput } from './schemas'

type Tables = Database['public']['Tables']
export type ResourceRow = Tables['resources']['Row']
export type Reservation = Tables['reservations']['Row']
export type NoticeRow = Tables['notices']['Row']

export type ReservationWithRefs = Reservation & {
  user: { nome: string } | null
  resource: { nome: string } | null
  opportunity: { titulo: string } | null
}

export type NoticeWithRefs = NoticeRow & {
  author: { nome: string } | null
  resource: { nome: string } | null
}

export type Conflito = { nome: string; fim: Date; finalidade: string | null }

// ── Recursos ───────────────────────────────────────────────────────────────
export function useResources() {
  return useQuery({
    queryKey: qk.resources.list(),
    queryFn: async (): Promise<ResourceRow[]> => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('tipo')
        .order('nome')
      if (error) throw error
      return data
    },
  })
}

// ── Reservas ─────────────────────────────────────────────────────────────────
const RES_SELECT =
  '*, user:profiles(nome), resource:resources(nome), opportunity:opportunities(titulo)'

export function useReservations() {
  return useQuery({
    queryKey: qk.reservations.list(),
    queryFn: async (): Promise<ReservationWithRefs[]> => {
      const { data, error } = await supabase
        .from('reservations')
        .select(RES_SELECT)
        .neq('status', 'cancelada')
      if (error) throw error
      return data as unknown as ReservationWithRefs[]
    },
  })
}

export function useMyReservations() {
  const { user } = useAuth()
  return useQuery({
    queryKey: qk.reservations.mine(user?.id ?? ''),
    enabled: Boolean(user),
    queryFn: async (): Promise<ReservationWithRefs[]> => {
      const { data, error } = await supabase
        .from('reservations')
        .select(RES_SELECT)
        .eq('user_id', user!.id)
        .neq('status', 'cancelada')
      if (error) throw error
      return data as unknown as ReservationWithRefs[]
    },
  })
}

/** Procura uma reserva que sobreponha o intervalo pedido (para explicar o conflito). */
export async function findConflict(
  resourceId: string,
  inicio: string,
  fim: string,
): Promise<Conflito | null> {
  const range = periodoFromLocal(inicio, fim)
  const { data } = await supabase
    .from('reservations')
    .select('periodo, finalidade, user:profiles(nome)')
    .eq('resource_id', resourceId)
    .neq('status', 'cancelada')
    .filter('periodo', 'ov', range)
    .limit(1)
  const row = data?.[0]
  if (!row) return null
  const [, f] = parseRange(row.periodo)
  const u = row.user as unknown as { nome: string } | null
  return { nome: u?.nome ?? '—', fim: f, finalidade: row.finalidade }
}

function invalidateReservas(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: qk.reservations.all })
}

export function useCreateReservation() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (input: ReservationInput) => {
      if (!user) throw new Error('Sem usuário autenticado')
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          resource_id: input.resource_id,
          user_id: user.id,
          opportunity_id: input.opportunity_id || null,
          periodo: periodoFromLocal(input.inicio, input.fim),
          finalidade: input.finalidade || null,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateReservas(qc),
  })
}

export function useRescheduleReservation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; inicio: string; fim: string }) => {
      const { error } = await supabase
        .from('reservations')
        .update({ periodo: periodoFromLocal(input.inicio, input.fim) })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: () => invalidateReservas(qc),
  })
}

export function useCancelReservation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelada' })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateReservas(qc),
  })
}

// ── Mural ────────────────────────────────────────────────────────────────────
export function useNotices() {
  return useQuery({
    queryKey: qk.notices.list(),
    queryFn: async (): Promise<NoticeWithRefs[]> => {
      const nowIso = new Date().toISOString()
      const { data, error } = await supabase
        .from('notices')
        .select('*, author:profiles(nome), resource:resources(nome)')
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as NoticeWithRefs[]
    },
  })
}

export function useCreateNotice() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (input: NoticeInput) => {
      if (!user) throw new Error('Sem usuário autenticado')
      const { error } = await supabase.from('notices').insert({
        author_id: user.id,
        tipo: input.tipo,
        corpo: input.corpo,
        resource_id: input.resource_id || null,
        pinned: input.pinned ?? false,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notices.all }),
  })
}

export function useTogglePin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; pinned: boolean }) => {
      const { error } = await supabase
        .from('notices')
        .update({ pinned: input.pinned })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notices.all }),
  })
}

export function useDeleteNotice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notices').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notices.all }),
  })
}
