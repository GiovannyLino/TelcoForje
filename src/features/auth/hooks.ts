import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { LoginInput, SignupInput } from './schemas'

/** Traduz mensagens comuns do GoTrue para pt-BR. */
export function traduzErroAuth(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (m.includes('email not confirmed')) return 'Confirme o e-mail antes de entrar.'
  if (m.includes('user already registered')) return 'Já existe uma conta com este e-mail.'
  if (m.includes('password should be at least')) return 'A senha é curta demais.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas. Aguarde um pouco.'
  return 'Não foi possível concluir. Tente de novo.'
}

export function useSignIn() {
  return useMutation({
    mutationFn: async ({ email, senha }: LoginInput) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) throw error
      return data
    },
  })
}

export function useSignUp() {
  return useMutation({
    mutationFn: async ({ nome, email, senha }: SignupInput) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } },
      })
      if (error) throw error
      return data
    },
  })
}

export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  })
}
