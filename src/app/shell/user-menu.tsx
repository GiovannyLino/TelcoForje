import { LogOut, User as UserIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/auth-context'
import { useSignOut } from '@/features/auth/hooks'

export function UserMenu() {
  const { nome, user } = useAuth()
  const signOut = useSignOut()
  const navigate = useNavigate()

  async function sair() {
    try {
      await signOut.mutateAsync()
      navigate('/login', { replace: true })
    } catch {
      toast.error('Não foi possível sair. Tente de novo.')
    }
  }

  const iniciais = (nome ?? 'U').trim().slice(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex size-8 items-center justify-center rounded-full border border-line bg-surface-2 font-mono text-[12px] text-ink hover:bg-surface"
          aria-label="Menu do usuário"
        >
          {iniciais}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <span className="block text-[13px] font-medium text-ink">{nome}</span>
          <span className="block font-mono text-[11px] text-muted">{user?.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <UserIcon /> Meu perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={sair}>
          <LogOut /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
