import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { qk } from '@/lib/query-keys'
import type { OpportunityWithRefs } from '@/features/opportunities/hooks'

type MoveInput = { id: string; column_id: string; position: number }

/** Move/reordena um card no Kanban com atualização otimista e rollback. */
export function useMoveOpportunity() {
  const qc = useQueryClient()
  const key = qk.opportunities.list()

  return useMutation({
    mutationFn: async (input: MoveInput) => {
      const { error } = await supabase
        .from('opportunities')
        .update({ column_id: input.column_id, position: input.position })
        .eq('id', input.id)
      if (error) throw error
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<OpportunityWithRefs[]>(key)
      if (prev) {
        qc.setQueryData<OpportunityWithRefs[]>(
          key,
          prev.map((o) =>
            o.id === input.id ? { ...o, column_id: input.column_id, position: input.position } : o,
          ),
        )
      }
      return { prev }
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.opportunities.all }),
  })
}
