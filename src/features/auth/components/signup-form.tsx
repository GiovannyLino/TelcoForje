import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { signupSchema, type SignupInput } from '../schemas'
import { traduzErroAuth, useSignUp } from '../hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/shared/field-error'

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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" autoComplete="name" autoFocus {...register('nome')} />
        <FieldError message={errors.nome?.message} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        <FieldError message={errors.email?.message} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="senha">Senha</Label>
        <Input id="senha" type="password" autoComplete="new-password" {...register('senha')} />
        <FieldError message={errors.senha?.message} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Criando…' : 'Criar conta'}
      </Button>
      <p className="text-center text-[13px] text-muted">
        Já tem conta?{' '}
        <Link to="/login" className="text-signal hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  )
}
