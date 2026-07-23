import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  senha: z.string().min(1, 'Informe a senha'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  nome: z.string().min(2, 'Informe seu nome'),
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  senha: z.string().min(8, 'A senha precisa de ao menos 8 caracteres'),
})
export type SignupInput = z.infer<typeof signupSchema>
