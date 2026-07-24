import type { OpportunityWithRefs } from '@/features/opportunities/hooks'

/** Posição fracionária entre dois vizinhos (evita reindexar a coluna toda). */
export function computePosition(before: number | null, after: number | null): number {
  if (before == null && after == null) return 1
  if (before == null) return (after as number) - 1
  if (after == null) return before + 1
  return (before + after) / 2
}

export function cardsInColumn(
  opps: OpportunityWithRefs[],
  columnId: string,
): OpportunityWithRefs[] {
  return opps
    .filter((o) => o.column_id === columnId)
    .sort((a, b) => a.position - b.position)
}
