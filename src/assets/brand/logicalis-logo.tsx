import { cn } from '@/lib/utils'

/**
 * Marca da Logicalis — a fita/ribbon vermelha característica, recriada em SVG
 * vetorial (uso na ferramenta interna da própria Logicalis). Cor de marca fixa;
 * nítida em qualquer tamanho.
 */
export function LogicalisRibbon({ className }: { className?: string }) {
  // Path vetorial OFICIAL da fita da Logicalis (recortado do SVG da marca).
  // A dobra interna vira um vazado (fill-rule evenodd), então acompanha o fundo.
  return (
    <svg viewBox="160 120 82 41" className={className} aria-hidden>
      <path
        fill="#E2001A"
        fillRule="evenodd"
        d="M231.12 157.85 C225.21,159.62 221.83,159.21 213.74,155.77 C209.91,154.14 209.19,153.47 210.11,152.37 C211.84,150.28 214.51,150.71 220.35,154.00 C226.40,157.42 227.92,157.61 232.05,155.47 C235.82,153.52 236.04,149.73 232.51,147.42 C230.60,146.16 228.25,145.88 222.26,146.18 C215.93,146.50 212.99,147.26 206.30,150.32 C191.28,157.19 181.95,158.68 174.23,155.45 C167.17,152.50 163.50,146.67 165.90,142.19 C166.62,140.85 166.58,139.36 165.79,137.26 C164.30,133.30 166.23,128.45 170.09,126.45 C176.83,122.97 197.36,126.45 194.00,130.50 C192.23,132.63 190.70,132.39 184.34,129.00 C177.96,125.59 176.11,125.37 171.95,127.53 C166.63,130.28 168.73,135.04 176.16,137.04 C181.74,138.55 186.80,137.51 198.50,132.48 C204.00,130.12 210.30,127.69 212.50,127.10 C218.63,125.43 226.96,125.80 231.68,127.94 C237.58,130.62 238.90,133.72 238.63,144.25 C238.38,154.11 237.34,155.98 231.12,157.85 ZM174.50 147.53 C180.98,149.97 188.48,148.73 202.20,142.96 C216.19,137.07 223.83,135.86 230.91,138.43 C236.00,140.27 236.81,140.04 234.04,137.54 C229.21,133.17 217.55,133.59 205.72,138.56 C186.81,146.51 180.12,147.60 172.24,144.02 C168.01,142.10 167.99,142.10 169.02,144.04 C169.60,145.12 170.17,146.01 170.29,146.02 C170.40,146.02 172.30,146.71 174.50,147.53 Z"
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
