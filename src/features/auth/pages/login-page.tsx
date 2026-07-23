import { AuthShell } from '../components/auth-shell'
import { LoginForm } from '../components/login-form'

export function LoginPage() {
  return (
    <AuthShell title="Entrar no Uplink" subtitle="Cockpit de pré-vendas técnica">
      <LoginForm />
    </AuthShell>
  )
}
