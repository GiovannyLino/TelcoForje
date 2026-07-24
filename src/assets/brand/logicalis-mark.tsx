import type { SVGProps } from 'react'

/**
 * Marca da Logicalis — recriada como SVG vetorial (uso ilustrativo em ambiente de
 * demonstração). Ladrilho vermelho de marca com o laço/ribbon branco característico.
 * Cor fixa (vermelho de marca) em ambos os temas; nítida em qualquer tamanho.
 */
export function LogicalisMark({
  title = 'Logicalis',
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg viewBox="0 0 32 32" role="img" aria-label={title} {...props}>
      <defs>
        <linearGradient id="lgc-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F5183D" />
          <stop offset="1" stopColor="#C40024" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7.5" fill="url(#lgc-tile)" />
      {/* laço/ribbon — duas ondas que se cruzam */}
      <path
        d="M6.5 20.5c3-9 6.5-9 9.5-3s6.5 6 9.5-3"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="16" cy="17.5" r="1.7" fill="#fff" />
    </svg>
  )
}
