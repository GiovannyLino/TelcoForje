import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { loginSchema, type LoginInput } from '../schemas'
import { traduzErroAuth, useSignIn } from '../hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/shared/field-error'

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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" autoComplete="email" autoFocus {...register('email')} />
        <FieldError message={errors.email?.message} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="senha">Senha</Label>
        <Input id="senha" type="password" autoComplete="current-password" {...register('senha')} />
        <FieldError message={errors.senha?.message} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando…' : 'Entrar'}
      </Button>
      <p className="text-center text-[13px] text-muted">
        Não tem conta?{' '}
        <Link to="/cadastro" className="text-signal hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  )
}
