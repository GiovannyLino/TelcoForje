import { z } from 'zod'

export const PRIORIDADES = ['baixa', 'media', 'alta', 'critica'] as const

export const opportunitySchema = z.object({
  titulo: z.string().min(2, 'Informe um título'),
  client_id: z.string().uuid('Selecione um cliente'),
  column_id: z.string().uuid('Selecione uma coluna'),
  prioridade: z.enum(PRIORIDADES),
  descricao: z.string().optional(),
  due_date: z.string().optional(),
})

export type OpportunityInput = z.infer<typeof opportunitySchema>
