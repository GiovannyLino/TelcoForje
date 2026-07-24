import { cn } from '@/lib/utils'

/**
 * Marca da Logicalis — a fita/ribbon vermelha característica, recriada em SVG
 * vetorial (uso na ferramenta interna da própria Logicalis). Cor de marca fixa;
 * nítida em qualquer tamanho.
 */
export function LogicalisRibbon({ className }: { className?: string }) {
  // Fita em "S" fluida — um único traço contínuo (sem emendas), pontas
  // arredondadas. Recriação vetorial da marca da Logicalis.
  return (
    <svg viewBox="0 0 84 64" fill="none" className={className} aria-hidden>
      <path
        d="M58 16 C 40 6 26 20 37 31 C 46 40 58 36 52 47 C 47 57 31 57 30 47"
        stroke="#E2001A"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
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
