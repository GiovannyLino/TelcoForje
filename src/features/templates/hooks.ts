import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { qk } from '@/lib/query-keys'
import { useAuth } from '@/features/auth/auth-context'
import type { Database } from '@/types/database'
import type { TemplateInput } from './schemas'

type Tables = Database['public']['Tables']
export type Template = Tables['templates']['Row']

function parseTags(tags: string | undefined): string[] {
  if (!tags) return []
  return Array.from(new Set(tags.split(',').map((t) => t.trim()).filter(Boolean)))
}

export function useTemplates() {
  return useQuery({
    queryKey: qk.templates.list(),
    queryFn: async (): Promise<Template[]> => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('updated_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useTemplate(id: string | undefined) {
  return useQuery({
    queryKey: qk.templates.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async (): Promise<Template> => {
      const { data, error } = await supabase.from('templates').select('*').eq('id', id!).single()
      if (error) throw error
      return data
    },
  })
}

export function useCreateTemplate() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (input: TemplateInput) => {
      if (!user) throw new Error('Sem usuário autenticado')
      const { data, error } = await supabase
        .from('templates')
        .insert({
          tipo: input.tipo,
          titulo: input.titulo,
          conteudo_md: input.conteudo_md,
          tags: parseTags(input.tags),
          author_id: user.id,
          is_published: true,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.templates.all }),
  })
}

export function useUpdateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; values: TemplateInput }) => {
      const { data, error } = await supabase
        .from('templates')
        .update({
          tipo: input.values.tipo,
          titulo: input.values.titulo,
          conteudo_md: input.values.conteudo_md,
          tags: parseTags(input.values.tags),
        })
        .eq('id', input.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: qk.templates.all })
      qc.invalidateQueries({ queryKey: qk.templates.detail(row.id) })
    },
  })
}

export function useDeleteTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('templates').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.templates.all }),
  })
}

/** "Usar este template": cria uma cópia editável (documents) dentro da oportunidade. */
export function useUseTemplate() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (input: { template: Template; opportunityId: string }) => {
      if (!user) throw new Error('Sem usuário autenticado')
      const { data, error } = await supabase
        .from('documents')
        .insert({
          opportunity_id: input.opportunityId,
          source_template_id: input.template.id,
          titulo: input.template.titulo,
          conteudo_md: input.template.conteudo_md,
          author_id: user.id,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (doc) =>
      qc.invalidateQueries({ queryKey: qk.documents.byOpportunity(doc.opportunity_id) }),
  })
}
