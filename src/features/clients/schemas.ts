import { z } from 'zod'

export const clientSchema = z.object({
  nome: z.string().min(2, 'Informe o nome do cliente'),
  segmento: z.string().optional(),
})

export type ClientInput = z.infer<typeof clientSchema>
