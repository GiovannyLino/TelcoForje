import { useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export type OcupacaoBloco = {
  id: string
  inicio: Date
  fim: Date
  tipo?: 'reserva' | 'manutencao'
  status?: 'ativa' | 'a_vencer' | 'conflito'
  rotulo?: string
}

export type FaixaDensidade = 'mini' | 'media' | 'completa'

const alturaTrilha: Record<FaixaDensidade, string> = {
  mini: 'h-1.5',
  media: 'h-2.5',
  completa: 'h-8',
}

function corBloco(b: OcupacaoBloco): string {
  if (b.tipo === 'manutencao') return 'var(--line-strong)'
  if (b.status === 'conflito') return 'var(--halt)'
  if (b.status === 'a_vencer') return 'var(--warn)'
  return 'var(--live)'
}

function pct(value: number): string {
  return `${Math.max(0, Math.min(100, value))}%`
}

export function FaixaOcupacao({
  janelaInicio,
  janelaFim,
  blocos,
  agora,
  densidade = 'media',
  ticks = 8,
  formatoTick,
  ariaLabel,
  className,
}: {
  janelaInicio: Date
  janelaFim: Date
  blocos: OcupacaoBloco[]
  agora?: Date
  densidade?: FaixaDensidade
  ticks?: number
  formatoTick?: string
  ariaLabel?: string
  className?: string
}) {
  const total = janelaFim.getTime() - janelaInicio.getTime()

  const posicoes = useMemo(
    () =>
      blocos.map((b) => ({
        bloco: b,
        left: ((b.inicio.getTime() - janelaInicio.getTime()) / total) * 100,
        width: ((b.fim.getTime() - b.inicio.getTime()) / total) * 100,
      })),
    [blocos, janelaInicio, total],
  )

  const marcadores = useMemo(() => {
    if (densidade === 'mini') return []
    return Array.from({ length: ticks + 1 }, (_, i) => {
      const t = new Date(janelaInicio.getTime() + (total * i) / ticks)
      return {
        left: (i / ticks) * 100,
        label: format(t, formatoTick ?? (densidade === 'completa' ? 'HH' : 'dd/MM'), {
          locale: ptBR,
        }),
      }
    })
  }, [densidade, ticks, janelaInicio, total, formatoTick])

  const agoraPct =
    agora && agora >= janelaInicio && agora <= janelaFim
      ? ((agora.getTime() - janelaInicio.getTime()) / total) * 100
      : null

  const label =
    ariaLabel ??
    `Ocupação com ${blocos.length} ${blocos.length === 1 ? 'bloco' : 'blocos'} entre ` +
      `${format(janelaInicio, 'dd/MM HH:mm', { locale: ptBR })} e ` +
      `${format(janelaFim, 'dd/MM HH:mm', { locale: ptBR })}`

  return (
    <div className={cn('w-full select-none', className)} role="img" aria-label={label}>
      {densidade !== 'mini' && (
        <div className="relative mb-1 h-3 font-mono text-[11px] text-muted">
          {marcadores.map((m, i) => (
            <span
              key={i}
              className="absolute -translate-x-1/2 tabular-nums"
              style={{ left: pct(m.left) }}
            >
              {m.label}
            </span>
          ))}
        </div>
      )}

      <div
        className={cn(
          'relative w-full overflow-hidden rounded-sm border border-line bg-surface-2',
          alturaTrilha[densidade],
        )}
      >
        {densidade === 'completa' &&
          marcadores.map((m, i) => (
            <span
              key={i}
              className="absolute top-0 bottom-0 w-px bg-line"
              style={{ left: pct(m.left) }}
              aria-hidden
            />
          ))}

        {posicoes.map(({ bloco, left, width }) => {
          const manut = bloco.tipo === 'manutencao'
          return (
            <div
              key={bloco.id}
              className="absolute top-0 bottom-0 rounded-[2px]"
              title={bloco.rotulo}
              style={{
                left: pct(left),
                width: pct(width),
                backgroundColor: manut ? 'transparent' : corBloco(bloco),
                backgroundImage: manut
                  ? 'repeating-linear-gradient(45deg, var(--line-strong) 0 2px, transparent 2px 6px)'
                  : undefined,
                opacity: manut ? 1 : 0.9,
              }}
            />
          )
        })}

        {agoraPct !== null && (
          <span
            className="absolute top-0 bottom-0 w-px bg-signal"
            style={{ left: pct(agoraPct) }}
            aria-hidden
          />
        )}
      </div>
    </div>
  )
}
