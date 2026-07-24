import { useState } from 'react'
import { toast } from 'sonner'
import { MessageSquarePlus, Pin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { formatRelative } from '@/lib/format'
import { NOTICE_TIPOS } from '../schemas'
import { noticeTipoLabel, noticeTipoTone } from '../lib'
import { useAuth } from '@/features/auth/auth-context'
import {
  useCreateNotice,
  useDeleteNotice,
  useNotices,
  useTogglePin,
  type NoticeRow,
} from '../hooks'

export function LabMural() {
  const { data, isLoading } = useNotices()
  const { user } = useAuth()
  const createN = useCreateNotice()
  const del = useDeleteNotice()
  const pin = useTogglePin()
  const [corpo, setCorpo] = useState('')
  const [tipo, setTipo] = useState<NoticeRow['tipo']>('aviso')

  async function enviar() {
    if (corpo.trim().length < 3) {
      toast.error('Escreva o recado.')
      return
    }
    try {
      await createN.mutateAsync({ corpo: corpo.trim(), tipo })
      setCorpo('')
      setTipo('aviso')
      toast.success('Recado publicado')
    } catch {
      toast.error('Não foi possível publicar.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-md border border-line bg-surface p-3">
        <Textarea
          value={corpo}
          onChange={(e) => setCorpo(e.target.value)}
          placeholder="Passagem de turno: deixe um recado para o time…"
          className="min-h-16"
        />
        <div className="flex items-center gap-2">
          <Select value={tipo} onValueChange={(v) => setTipo(v as NoticeRow['tipo'])}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NOTICE_TIPOS.map((t) => (
                <SelectItem key={t} value={t}>
                  {noticeTipoLabel[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => void enviar()} disabled={createN.isPending} className="ml-auto">
            <MessageSquarePlus /> Publicar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <ul className="flex flex-col gap-2">
          {data?.map((n) => (
            <li
              key={n.id}
              className={cn(
                'flex flex-col gap-1 rounded-md border bg-surface p-3',
                n.pinned ? 'border-signal/40' : 'border-line',
              )}
            >
              <div className="flex items-center gap-2">
                <Badge tone={noticeTipoTone(n.tipo)}>{noticeTipoLabel[n.tipo]}</Badge>
                {n.pinned ? <Pin className="size-3.5 text-signal" aria-label="Fixado" /> : null}
                {n.resource?.nome ? (
                  <span className="font-mono text-[12px] text-muted">{n.resource.nome}</span>
                ) : null}
                <span className="ml-auto text-[12px] text-muted">{formatRelative(n.created_at)}</span>
              </div>
              <p className="text-[13px] text-ink">{n.corpo}</p>
              <div className="flex items-center gap-3 text-[12px] text-muted">
                <span>{n.author?.nome ?? 'sistema'}</span>
                {user && n.author_id === user.id ? (
                  <span className="ml-auto flex gap-3">
                    <button
                      type="button"
                      onClick={() => pin.mutate({ id: n.id, pinned: !n.pinned })}
                      className="hover:text-ink"
                    >
                      {n.pinned ? 'desafixar' : 'fixar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => del.mutate(n.id)}
                      className="hover:text-halt"
                    >
                      excluir
                    </button>
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
