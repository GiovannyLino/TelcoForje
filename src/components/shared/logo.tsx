import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { APP_NAME } from '@/lib/constants'
import { LogicalisMark } from '@/assets/brand/logicalis-mark'
import { ease } from '@/lib/motion'

const sizes = {
  sm: { mark: 'size-6', text: 'text-[16px]', gap: 'gap-2' },
  lg: { mark: 'size-11', text: 'text-[26px]', gap: 'gap-2.5' },
} as const

/**
 * Marca animada: primeiro surge o mark da Logicalis, depois o wordmark
 * "TelcoForge" se revela ao lado (wipe da esquerda p/ direita) e permanece.
 * Respeita prefers-reduced-motion via <MotionConfig reducedMotion="user">
 * (nesse caso o estado final aparece direto).
 */
export function Logo({
  className,
  showWordmark = true,
  markClassName,
  size = 'sm',
}: {
  className?: string
  showWordmark?: boolean
  markClassName?: string
  size?: 'sm' | 'lg'
}) {
  const s = sizes[size]
  return (
    <span className={cn('inline-flex items-center', s.gap, className)}>
      <motion.span
        className="inline-flex shrink-0"
        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.45, ease }}
      >
        <LogicalisMark className={cn(s.mark, markClassName)} />
      </motion.span>
      {showWordmark ? (
        <motion.span
          className={cn(
            'whitespace-nowrap font-display font-semibold tracking-tight text-ink',
            s.text,
          )}
          initial={{ opacity: 0, x: -8, clipPath: 'inset(0 100% 0 0)' }}
          animate={{ opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)' }}
          transition={{ delay: 0.5, duration: 0.5, ease }}
        >
          Telco<span className="text-signal">Forge</span>
        </motion.span>
      ) : (
        <span className="sr-only">{APP_NAME}</span>
      )}
    </span>
  )
}
