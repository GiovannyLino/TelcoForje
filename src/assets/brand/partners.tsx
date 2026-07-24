import { cn } from '@/lib/utils'

/**
 * Parceiros de tecnologia — wordmarks tipográficos monocromáticos (herdam
 * `currentColor`), recriados para uso ilustrativo em ambiente de demonstração.
 * Sem dependência de assets binários; nítidos em qualquer tamanho e tema.
 * Cada marca preserva a caixa/peso característicos.
 */
export type Partner = { name: string; text: string; className?: string }

export const PARTNERS: Partner[] = [
  { name: 'Cisco', text: 'cisco', className: 'lowercase font-sans font-semibold tracking-tight' },
  { name: 'IBM', text: 'IBM', className: 'uppercase font-display font-extrabold tracking-tight' },
  { name: 'Red Hat', text: 'Red Hat', className: 'font-display font-bold' },
  { name: 'Fortinet', text: 'Fortinet', className: 'font-display font-semibold tracking-tight' },
  { name: 'NETSCOUT', text: 'NETSCOUT', className: 'uppercase font-sans font-bold tracking-tight' },
  { name: 'VMware', text: 'vmware', className: 'lowercase font-display font-bold tracking-tight' },
  { name: 'Splunk', text: 'splunk›', className: 'lowercase font-sans font-bold tracking-tight' },
  { name: 'ThousandEyes', text: 'ThousandEyes', className: 'font-display font-semibold tracking-tight' },
  { name: 'TIM', text: 'TIM', className: 'uppercase font-display font-extrabold tracking-tight' },
  { name: 'Claro', text: 'Claro', className: 'font-display font-semibold' },
  { name: 'Vivo', text: 'vivo', className: 'lowercase font-display font-extrabold tracking-tight' },
  { name: 'V.tal', text: 'V.tal', className: 'font-display font-bold' },
  { name: 'Embratel', text: 'Embratel', className: 'font-display font-semibold' },
]

export function PartnerWordmark({ partner, className }: { partner: Partner; className?: string }) {
  return (
    <span
      role="img"
      aria-label={partner.name}
      className={cn('select-none whitespace-nowrap text-[19px] leading-none', partner.className, className)}
    >
      {partner.text}
    </span>
  )
}
