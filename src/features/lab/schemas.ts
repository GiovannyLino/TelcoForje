import { z } from 'zod'

export const NOTICE_TIPOS = ['aviso', 'manutencao', 'vencimento', 'incidente'] as const

export const reservationSchema = z
  .object({
    resource_id: z.string().uuid('Selecione um recurso'),
    inicio: z.string().min(1, 'Informe o início'),
    fim: z.string().min(1, 'Informe o fim'),
    finalidade: z.string().optional(),
    opportunity_id: z.string().optional(),
  })
  .refine((v) => v.fim > v.inicio, { message: 'O fim deve ser depois do início', path: ['fim'] })

export type ReservationInput = z.infer<typeof reservationSchema>

export const noticeSchema = z.object({
  tipo: z.enum(NOTICE_TIPOS),
  corpo: z.string().min(3, 'Escreva o recado'),
  resource_id: z.string().optional(),
  pinned: z.boolean().optional(),
})

export type NoticeInput = z.infer<typeof noticeSchema>
