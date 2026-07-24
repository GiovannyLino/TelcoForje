import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, Lock, Mail, User } from 'lucide-react'
import { signupSchema, type SignupInput } from '../schemas'
import { traduzErroAuth, useSignUp } from '../hooks'
import { Button } from '@/components/ui/button'
import { FloatingField } from './floating-field'

export function SignupForm() {
  const navigate = useNavigate()
  const signUp = useSignUp()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) })

  async function onSubmit(values: SignupInput) {
    try {
      const res = await signUp.mutateAsync(values)
      if (res.session) {
        toast.success('Conta criada')
        navigate('/', { replace: true })
      } else {
        toast.success('Conta criada. Verifique seu e-mail para confirmar.')
        navigate('/login', { replace: true })
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? traduzErroAuth(err.message) : 'Não foi possível criar a conta.',
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <FloatingField
        id="nome"
        label="Nome"
        autoComplete="name"
        autoFocus
        icon={<User />}
        error={errors.nome?.message}
        {...register('nome')}
      />
      <FloatingField
        id="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        icon={<Mail />}
        error={errors.email?.message}
        {...register('email')}
      />
      <FloatingField
        id="senha"
        label="Senha"
        autoComplete="new-password"
        icon={<Lock />}
        passwordToggle
        error={errors.senha?.message}
        {...register('senha')}
      />
      <Button type="submit" size="md" disabled={isSubmitting} className="mt-1 h-11">
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" /> Criando…
          </>
        ) : (
          'Criar conta'
        )}
      </Button>
      <p className="text-center text-[13px] text-muted">
        Já tem conta?{' '}
        <Link to="/login" className="font-medium text-signal hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  )
}
