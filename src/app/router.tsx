import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from './root-layout'
import { RequireAuth, RedirectIfAuth } from '@/features/auth/components/require-auth'
import { LoginPage } from '@/features/auth/pages/login-page'
import { SignupPage } from '@/features/auth/pages/signup-page'
import { NotFound } from './pages/not-found'

// Rotas autenticadas carregadas sob demanda (mantém o bundle inicial enxuto).
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/dashboard-page').then((m) => ({ default: m.DashboardPage })),
)
const OpportunitiesPage = lazy(() =>
  import('@/features/opportunities/pages/opportunities-page').then((m) => ({
    default: m.OpportunitiesPage,
  })),
)
const OpportunityDetailPage = lazy(() =>
  import('@/features/opportunities/pages/opportunity-detail-page').then((m) => ({
    default: m.OpportunityDetailPage,
  })),
)
const BoardPage = lazy(() =>
  import('@/features/board/pages/board-page').then((m) => ({ default: m.BoardPage })),
)
const LabPage = lazy(() =>
  import('@/features/lab/pages/lab-page').then((m) => ({ default: m.LabPage })),
)
const DiscoveryListPage = lazy(() =>
  import('@/features/discovery/pages/discovery-list-page').then((m) => ({
    default: m.DiscoveryListPage,
  })),
)
const DiscoveryFillPage = lazy(() =>
  import('@/features/discovery/pages/discovery-fill-page').then((m) => ({
    default: m.DiscoveryFillPage,
  })),
)
const TemplatesPage = lazy(() =>
  import('@/features/templates/pages/templates-page').then((m) => ({ default: m.TemplatesPage })),
)
const TemplateEditorPage = lazy(() =>
  import('@/features/templates/pages/template-editor-page').then((m) => ({
    default: m.TemplateEditorPage,
  })),
)
const GlobalSearchPage = lazy(() =>
  import('@/features/search/pages/global-search-page').then((m) => ({ default: m.GlobalSearchPage })),
)
const StyleGuide = lazy(() =>
  import('./pages/styleguide').then((m) => ({ default: m.StyleGuide })),
)

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <RedirectIfAuth>
        <LoginPage />
      </RedirectIfAuth>
    ),
  },
  {
    path: '/cadastro',
    element: (
      <RedirectIfAuth>
        <SignupPage />
      </RedirectIfAuth>
    ),
  },
  {
    element: (
      <RequireAuth>
        <RootLayout />
      </RequireAuth>
    ),
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/oportunidades', element: <OpportunitiesPage /> },
      { path: '/oportunidades/:id', element: <OpportunityDetailPage /> },
      { path: '/kanban', element: <BoardPage /> },
      { path: '/lab', element: <LabPage /> },
      { path: '/discovery', element: <DiscoveryListPage /> },
      { path: '/discovery/:id', element: <DiscoveryFillPage /> },
      { path: '/templates', element: <TemplatesPage /> },
      { path: '/templates/novo', element: <TemplateEditorPage /> },
      { path: '/templates/:id', element: <TemplateEditorPage /> },
      { path: '/busca', element: <GlobalSearchPage /> },
      { path: '/estilo', element: <StyleGuide /> },
    ],
  },
  { path: '*', element: <NotFound /> },
])
