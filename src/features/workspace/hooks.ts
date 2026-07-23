import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { qk } from '@/lib/query-keys'
import type { Database } from '@/types/database'

type Tables = Database['public']['Tables']
export type Folder = Tables['folders']['Row']
export type FileRow = Tables['files']['Row']

export function useFoldersByOpportunity(oppId: string | undefined) {
  return useQuery({
    queryKey: qk.folders.byOpportunity(oppId ?? null),
    enabled: Boolean(oppId),
    queryFn: async (): Promise<Folder[]> => {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('opportunity_id', oppId!)
        .is('deleted_at', null)
        .order('nome')
      if (error) throw error
      return data
    },
  })
}

export function useFilesByOpportunity(oppId: string | undefined) {
  return useQuery({
    queryKey: qk.files.byOpportunity(oppId ?? ''),
    enabled: Boolean(oppId),
    queryFn: async (): Promise<FileRow[]> => {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('opportunity_id', oppId!)
        .eq('is_current', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}
