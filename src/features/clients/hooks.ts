import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { qk } from '@/lib/query-keys'
import { useAuth } from '@/features/auth/auth-context'
import type { Database } from '@/types/database'
import type { ClientInput } from './schemas'

export type Client = Database['public']['Tables']['clients']['Row']

export function useClients() {
  return useQuery({
    queryKey: qk.clients.list(),
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await supabase.from('clients').select('*').order('nome')
      if (error) throw error
      return data
    },
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (input: ClientInput) => {
      if (!user) throw new Error('Sem usuário autenticado')
      const { data, error } = await supabase
        .from('clients')
        .insert({ nome: input.nome, segmento: input.segmento || null, owner_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.clients.all }),
  })
}
