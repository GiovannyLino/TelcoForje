import { cn } from '@/lib/utils'

/**
 * Marca da Logicalis — a fita/ribbon vermelha característica, recriada em SVG
 * vetorial (uso na ferramenta interna da própria Logicalis). Cor de marca fixa;
 * nítida em qualquer tamanho.
 */
export function LogicalisRibbon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 40" fill="none" className={className} aria-hidden>
      <g stroke="#E2001A" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M37 26 C 31 9 14 5 8 16 C 4.5 22 12 25 18 20" />
        <path d="M35 26 C 41 9 58 5 64 16 C 67.5 22 60 25 54 20" />
      </g>
      <path
        d="M30 23 C 34 29 38 29 42 23"
        fill="none"
        stroke="#C00018"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Lockup vertical da Logicalis: fita + wordmark "LOGICALIS". O wordmark usa
 * `text-ink` para permanecer legível em tema claro e escuro.
 */
export function LogicalisLogo({
  className,
  ribbonClassName,
  wordClassName,
}: {
  className?: string
  ribbonClassName?: string
  wordClassName?: string
}) {
  return (
    <span
      className={cn('inline-flex flex-col items-center gap-1 leading-none', className)}
      role="img"
      aria-label="Logicalis"
    >
      <LogicalisRibbon className={cn('h-5 w-auto', ribbonClassName)} />
      <span
        className={cn(
          'font-sans font-bold uppercase leading-none tracking-[0.16em] text-ink',
          wordClassName,
        )}
      >
        Logicalis
      </span>
    </span>
  )
}
