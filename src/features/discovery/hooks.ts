import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { qk } from '@/lib/query-keys'
import { useAuth } from '@/features/auth/auth-context'
import type { Database, Json } from '@/types/database'
import type { Answers, DiscoverySchema } from './types'

type Tables = Database['public']['Tables']
export type DiscoveryTemplate = Tables['discovery_templates']['Row']
export type DiscoveryResponse = Tables['discovery_responses']['Row']

export type ResponseWithTemplate = DiscoveryResponse & {
  template: { nome: string; schema: DiscoverySchema; versao: number } | null
  opportunity: { titulo: string; client: { nome: string } | null } | null
  engineer: { nome: string } | null
}

export type ResponseListItem = DiscoveryResponse & {
  template: { nome: string } | null
  engineer: { nome: string } | null
  opportunity: { titulo: string; client: { nome: string } | null } | null
}

const LIST_SELECT =
  '*, template:discovery_templates(nome), engineer:profiles(nome), opportunity:opportunities(titulo, client:clients(nome))'

export function useDiscoveryTemplates() {
  return useQuery({
    queryKey: qk.discovery.templates(),
    queryFn: async (): Promise<DiscoveryTemplate[]> => {
      const { data, error } = await supabase
        .from('discovery_templates')
        .select('*')
        .eq('is_active', true)
        .order('nome')
      if (error) throw error
      return data
    },
  })
}

export function useDiscoveryResponse(id: string | undefined) {
  return useQuery({
    queryKey: qk.discovery.response(id ?? ''),
    enabled: Boolean(id),
    queryFn: async (): Promise<ResponseWithTemplate> => {
      const { data, error } = await supabase
        .from('discovery_responses')
        .select(
          '*, template:discovery_templates(nome, schema, versao), opportunity:opportunities(titulo, client:clients(nome)), engineer:profiles(nome)',
        )
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as unknown as ResponseWithTemplate
    },
  })
}

export function useDiscoveryResponses() {
  return useQuery({
    queryKey: qk.discovery.responses(),
    queryFn: async (): Promise<ResponseListItem[]> => {
      const { data, error } = await supabase
        .from('discovery_responses')
        .select(LIST_SELECT)
        .order('updated_at', { ascending: false })
      if (error) throw error
      return data as unknown as ResponseListItem[]
    },
  })
}

export function useDiscoveryResponsesByOpportunity(oppId: string | undefined) {
  return useQuery({
    queryKey: qk.discovery.byOpportunity(oppId ?? ''),
    enabled: Boolean(oppId),
    queryFn: async (): Promise<ResponseListItem[]> => {
      const { data, error } = await supabase
        .from('discovery_responses')
        .select(LIST_SELECT)
        .eq('opportunity_id', oppId!)
        .order('updated_at', { ascending: false })
      if (error) throw error
      return data as unknown as ResponseListItem[]
    },
  })
}

export function useCreateResponse() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (input: {
      templateId: string
      templateVersao: number
      opportunityId: string
    }) => {
      if (!user) throw new Error('Sem usuário autenticado')
      const { data, error } = await supabase
        .from('discovery_responses')
        .insert({
          template_id: input.templateId,
          template_versao: input.templateVersao,
          opportunity_id: input.opportunityId,
          engineer_id: user.id,
          answers: {},
          status: 'rascunho',
          completude: 0,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: qk.discovery.responses() })
      qc.invalidateQueries({ queryKey: qk.discovery.byOpportunity(row.opportunity_id) })
    },
  })
}

export function useSaveAnswers() {
  return useMutation({
    mutationFn: async (input: { id: string; answers: Answers; completude: number }) => {
      const { error } = await supabase
        .from('discovery_responses')
        .update({ answers: input.answers as unknown as Json, completude: input.completude })
        .eq('id', input.id)
      if (error) throw error
    },
  })
}

export function useFinalizeResponse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: string
      answers: Answers
      completude: number
      resumo_md: string
    }) => {
      const { error } = await supabase
        .from('discovery_responses')
        .update({
          answers: input.answers as unknown as Json,
          completude: input.completude,
          resumo_md: input.resumo_md,
          status: 'finalizado',
          finalizado_em: new Date().toISOString(),
        })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: (_data, v) => {
      qc.invalidateQueries({ queryKey: qk.discovery.response(v.id) })
      qc.invalidateQueries({ queryKey: qk.discovery.responses() })
    },
  })
}
