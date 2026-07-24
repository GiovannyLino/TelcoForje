import { cn } from '@/lib/utils'

/**
 * Marca da Logicalis — a fita/ribbon vermelha característica, recriada em SVG
 * vetorial (uso na ferramenta interna da própria Logicalis). Cor de marca fixa;
 * nítida em qualquer tamanho.
 */
export function LogicalisRibbon({ className }: { className?: string }) {
  // Uma única forma preenchida (dois lóbulos simétricos que se encontram no
  // centro) — fita vermelha contínua, sem emendas.
  return (
    <svg viewBox="0 0 104 40" className={className} aria-hidden>
      <path
        fill="#E2001A"
        d="M52 25 C 43 9 22 7 13 17 C 6 24 15 30 26 23 C 36 18 45 21 52 25
           C 61 9 82 7 91 17 C 98 24 89 30 78 23 C 68 18 59 21 52 25 Z"
      />
      <path fill="#BC0011" d="M52 25 C 50 21 50 18 52 15 C 54 18 54 21 52 25 Z" />
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
