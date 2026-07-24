import { AuthShell } from '../components/auth-shell'
import { LoginForm } from '../components/login-form'

export function LoginPage() {
  return (
    <AuthShell title="Entrar no TelcoForge" subtitle="Cockpit de pré-vendas e observabilidade">
      <LoginForm />
    </AuthShell>
  )
}
