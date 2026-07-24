import { z } from 'zod'

export const TEMPLATE_TIPOS = ['rfp', 'poc', 'proposta', 'topologia'] as const

export const tipoLabel: Record<string, string> = {
  rfp: 'RFP',
  poc: 'PoC',
  proposta: 'Proposta',
  topologia: 'Topologia',
}

export const templateSchema = z.object({
  tipo: z.enum(TEMPLATE_TIPOS),
  titulo: z.string().min(2, 'Informe um título'),
  conteudo_md: z.string().min(1, 'Escreva algum conteúdo'),
  tags: z.string().optional(),
})

export type TemplateInput = z.infer<typeof templateSchema>
