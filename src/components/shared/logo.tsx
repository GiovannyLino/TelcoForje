import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import { LogicalisLogo } from '@/assets/brand/logicalis-logo'
import { ease } from '@/lib/motion'

const sizes = {
  sm: { slot: 'h-9 w-[140px]', ribbon: 'h-4', word: 'text-[8px]', name: 'text-[17px]' },
  lg: { slot: 'h-16 w-[230px]', ribbon: 'h-9', word: 'text-[14px]', name: 'text-[30px]' },
} as const

/**
 * Carrossel da marca: alterna, em loop, entre o logo da Logicalis e o nome
 * "TelcoForge" (cross-fade vertical). Respeita prefers-reduced-motion — nesse
 * caso não fica trocando e mostra o logo da Logicalis fixo.
 */
export function Logo({ size = 'sm', className }: { size?: 'sm' | 'lg'; className?: string }) {
  const s = sizes[size]
  const reduce = useReducedMotion()
  const [showName, setShowName] = useState(false)

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setShowName((v) => !v), 2600)
    return () => clearInterval(id)
  }, [reduce])

  return (
    <span
      className={cn('relative inline-flex items-center justify-center', s.slot, className)}
      role="img"
      aria-label="TelcoForge — Logicalis"
    >
      <AnimatePresence initial={false} mode="wait">
        {showName ? (
          <motion.span
            key="name"
            aria-hidden
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, y: 9 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -9 }}
            transition={{ duration: 0.4, ease }}
          >
            <span className={cn('font-display font-semibold tracking-tight text-ink', s.name)}>
              Telco<span className="text-signal">Forge</span>
            </span>
          </motion.span>
        ) : (
          <motion.span
            key="logo"
            aria-hidden
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, y: 9 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -9 }}
            transition={{ duration: 0.4, ease }}
          >
            <LogicalisLogo ribbonClassName={s.ribbon} wordClassName={s.word} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
