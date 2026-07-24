import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { PARTNERS, type Partner } from '@/assets/brand/partners'

function Logo({ p }: { p: Partner }) {
  return (
    <img
      src={p.src}
      alt=""
      aria-hidden
      draggable={false}
      className={cn(
        'w-auto shrink-0 object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0',
        p.kind === 'icon' ? 'h-8' : 'h-6',
      )}
    />
  )
}

function Row({ partners, reverse, dur }: { partners: Partner[]; reverse?: boolean; dur: string }) {
  // Track duplicado: o -50% da animação encaixa a segunda cópia sem emenda.
  const doubled = [...partners, ...partners]
  return (
    <div className="marquee" style={{ '--marquee-dur': dur } as CSSProperties}>
      <div className={`marquee-track${reverse ? ' marquee-track--reverse' : ''}`} aria-hidden>
        {doubled.map((p, i) => (
          <Logo key={`${p.name}-${i}`} p={p} />
        ))}
      </div>
    </div>
  )
}

/**
 * Carrossel de logos de parceiros ao fundo do login: duas faixas em direções
 * opostas, lentas, baixa opacidade, com máscara de fade nas laterais e pausa no
 * hover. Fica atrás do card (aria-hidden — decorativo).
 */
export function PartnerMarquee() {
  const metade = Math.ceil(PARTNERS.length / 2)
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-center gap-12 opacity-90"
      aria-hidden
    >
      <Row partners={PARTNERS.slice(0, metade)} dur="55s" />
      <Row partners={PARTNERS.slice(metade)} reverse dur="48s" />
    </div>
  )
}
