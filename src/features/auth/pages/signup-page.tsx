import { AuthShell } from '../components/auth-shell'
import { SignupForm } from '../components/signup-form'

export function SignupPage() {
  return (
    <AuthShell title="Criar conta" subtitle="Comece a usar o TelcoForge">
      <SignupForm />
    </AuthShell>
  )
}
