import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { qk } from '@/lib/query-keys'
import type { Database } from '@/types/database'

export type DocumentRow = Database['public']['Tables']['documents']['Row']

export function useDocumentsByOpportunity(oppId: string | undefined) {
  return useQuery({
    queryKey: qk.documents.byOpportunity(oppId ?? ''),
    enabled: Boolean(oppId),
    queryFn: async (): Promise<DocumentRow[]> => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('opportunity_id', oppId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}
