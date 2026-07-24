import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { qk } from '@/lib/query-keys'
import type { Database } from '@/types/database'

type ActivityBase = Database['public']['Tables']['activity_log']['Row']
export type ActivityRow = ActivityBase & { actor: { nome: string } | null }

export function useActivityByOpportunity(oppId: string | undefined) {
  return useQuery({
    queryKey: qk.activity.byOpportunity(oppId ?? ''),
    enabled: Boolean(oppId),
    queryFn: async (): Promise<ActivityRow[]> => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*, actor:profiles(nome)')
        .eq('opportunity_id', oppId!)
        .order('created_at', { ascending: false })
        .limit(15)
      if (error) throw error
      return data as unknown as ActivityRow[]
    },
  })
}

const entidadeLabel: Record<string, string> = {
  opportunities: 'a oportunidade',
  files: 'o arquivo',
  documents: 'o documento',
  reservations: 'a reserva',
  discovery_responses: 'o discovery',
}

export function frase(row: ActivityRow): string {
  const quem = row.actor?.nome ?? 'Sistema'
  const verbo = row.acao === 'insert' ? 'adicionou' : 'atualizou'
  const alvo = entidadeLabel[row.entity_type] ?? row.entity_type
  const titulo =
    row.payload && typeof row.payload === 'object' && 'titulo' in row.payload
      ? String((row.payload as { titulo?: unknown }).titulo ?? '')
      : ''
  return `${quem} ${verbo} ${alvo}${titulo ? ` “${titulo}”` : ''}`
}
