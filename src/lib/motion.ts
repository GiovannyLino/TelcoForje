import type { Transition, Variants } from 'motion/react'

/** Easing e durações-base do design system (espelham os tokens do index.css). */
export const ease = [0.22, 1, 0.36, 1] as const
export const dur = { fast: 0.15, base: 0.25, slow: 0.4 } as const

export const transition: Transition = { duration: dur.base, ease }

/** Entrada suave de baixo para cima (cards, blocos de página). */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition },
}

/** Container que escalona a entrada dos filhos. */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
}

/** Transição de rota — leve, respeita quem chega/sai. */
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: dur.slow, ease } },
  exit: { opacity: 0, y: -6, transition: { duration: dur.fast, ease } },
}
