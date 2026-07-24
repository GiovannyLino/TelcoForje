import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type SearchResult = {
  entity_type: string
  entity_id: string
  opportunity_id: string | null
  titulo: string
  trecho: string
  rank: number
}

export function useSearch(q: string) {
  const termo = q.trim()
  return useQuery({
    queryKey: ['search', termo],
    enabled: termo.length >= 2,
    queryFn: async (): Promise<SearchResult[]> => {
      const { data, error } = await supabase.rpc('buscar', { q: termo })
      if (error) throw error
      return (data ?? []) as unknown as SearchResult[]
    },
  })
}
