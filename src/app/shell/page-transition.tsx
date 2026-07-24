import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { useLocation } from 'react-router-dom'
import { ease } from '@/lib/motion'

/**
 * Transição leve entre rotas: cada caminho remonta e entra com fade + subida.
 * Sem AnimatePresence para não brigar com o Suspense do lazy-loading.
 * Respeita prefers-reduced-motion via <MotionConfig reducedMotion="user">.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease }}
    >
      {children}
    </motion.div>
  )
}
