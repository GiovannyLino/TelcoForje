import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, Lock, Mail } from 'lucide-react'
import { loginSchema, type LoginInput } from '../schemas'
import { traduzErroAuth, useSignIn } from '../hooks'
import { Button } from '@/components/ui/button'
import { FloatingField } from './floating-field'

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }
  const signIn = useSignIn()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginInput) {
    try {
      await signIn.mutateAsync(values)
      navigate(location.state?.from ?? '/', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? traduzErroAuth(err.message) : 'Não foi possível entrar.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <FloatingField
        id="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        autoFocus
        icon={<Mail />}
        error={errors.email?.message}
        {...register('email')}
      />
      <FloatingField
        id="senha"
        label="Senha"
        autoComplete="current-password"
        icon={<Lock />}
        passwordToggle
        error={errors.senha?.message}
        {...register('senha')}
      />
      <Button type="submit" size="md" disabled={isSubmitting} className="mt-1 h-11">
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" /> Entrando…
          </>
        ) : (
          'Entrar'
        )}
      </Button>
      <p className="text-center text-[13px] text-muted">
        Não tem conta?{' '}
        <Link to="/cadastro" className="font-medium text-signal hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  )
}
