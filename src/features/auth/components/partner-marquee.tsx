import type { CSSProperties } from 'react'
import { PARTNERS, PartnerWordmark, type Partner } from '@/assets/brand/partners'

function Row({
  partners,
  reverse,
  dur,
}: {
  partners: Partner[]
  reverse?: boolean
  dur: string
}) {
  // Track duplicado: o -50% da animação encaixa a segunda cópia sem emenda.
  const doubled = [...partners, ...partners]
  return (
    <div className="marquee" style={{ '--marquee-dur': dur } as CSSProperties}>
      <div className={`marquee-track${reverse ? ' marquee-track--reverse' : ''}`} aria-hidden>
        {doubled.map((p, i) => (
          <PartnerWordmark key={`${p.name}-${i}`} partner={p} />
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
      className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-between py-[14vh] text-ink/12 dark:text-ink/20"
      aria-hidden
    >
      <Row partners={PARTNERS.slice(0, metade)} dur="55s" />
      <Row partners={PARTNERS.slice(metade)} reverse dur="48s" />
    </div>
  )
}
