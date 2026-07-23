import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth-context'
import { FullPageSpinner } from '@/components/shared/full-page-spinner'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullPageSpinner />
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

export function RedirectIfAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  if (session) return <Navigate to="/" replace />
  return <>{children}</>
}
