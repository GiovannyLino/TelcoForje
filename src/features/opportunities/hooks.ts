import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { qk } from '@/lib/query-keys'
import { useAuth } from '@/features/auth/auth-context'
import type { Database } from '@/types/database'
import type { OpportunityInput } from './schemas'

type Tables = Database['public']['Tables']
export type Opportunity = Tables['opportunities']['Row']
export type BoardColumn = Tables['board_columns']['Row']

export type OpportunityWithRefs = Opportunity & {
  client: Pick<Tables['clients']['Row'], 'id' | 'nome'> | null
  column: Pick<BoardColumn, 'id' | 'nome' | 'position'> | null
  owner: Pick<Tables['profiles']['Row'], 'id' | 'nome'> | null
}

const SELECT_WITH_REFS =
  '*, client:clients(id,nome), column:board_columns(id,nome,position), owner:profiles(id,nome)'

export function useBoardColumns() {
  return useQuery({
    queryKey: qk.boardColumns.list(),
    queryFn: async (): Promise<BoardColumn[]> => {
      const { data, error } = await supabase.from('board_columns').select('*').order('position')
      if (error) throw error
      return data
    },
  })
}

export function useOpportunities() {
  return useQuery({
    queryKey: qk.opportunities.list(),
    queryFn: async (): Promise<OpportunityWithRefs[]> => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(SELECT_WITH_REFS)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as OpportunityWithRefs[]
    },
  })
}

export function useOpportunity(id: string | undefined) {
  return useQuery({
    queryKey: qk.opportunities.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async (): Promise<OpportunityWithRefs> => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(SELECT_WITH_REFS)
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as unknown as OpportunityWithRefs
    },
  })
}

export function useCreateOpportunity() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (input: OpportunityInput) => {
      if (!user) throw new Error('Sem usuário autenticado')
      const { data, error } = await supabase
        .from('opportunities')
        .insert({
          titulo: input.titulo,
          client_id: input.client_id,
          column_id: input.column_id,
          prioridade: input.prioridade,
          descricao: input.descricao || null,
          due_date: input.due_date || null,
          owner_id: user.id,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.opportunities.all }),
  })
}

export function useUpdateOpportunity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Opportunity> }) => {
      const { data, error } = await supabase
        .from('opportunities')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: qk.opportunities.all })
      qc.invalidateQueries({ queryKey: qk.opportunities.detail(row.id) })
    },
  })
}

export function useDeleteOpportunity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('opportunities').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.opportunities.all }),
  })
}
