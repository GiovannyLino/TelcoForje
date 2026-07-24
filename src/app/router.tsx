import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from './root-layout'
import { RequireAuth, RedirectIfAuth } from '@/features/auth/components/require-auth'
import { LoginPage } from '@/features/auth/pages/login-page'
import { SignupPage } from '@/features/auth/pages/signup-page'
import { Placeholder } from './pages/placeholder'
import { NotFound } from './pages/not-found'
import { StyleGuide } from './pages/styleguide'
import { OpportunitiesPage } from '@/features/opportunities/pages/opportunities-page'
import { OpportunityDetailPage } from '@/features/opportunities/pages/opportunity-detail-page'
import { TemplatesPage } from '@/features/templates/pages/templates-page'
import { TemplateEditorPage } from '@/features/templates/pages/template-editor-page'
import { BoardPage } from '@/features/board/pages/board-page'
import { LabPage } from '@/features/lab/pages/lab-page'
import { DiscoveryListPage } from '@/features/discovery/pages/discovery-list-page'
import { DiscoveryFillPage } from '@/features/discovery/pages/discovery-fill-page'

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
      {
        path: '/',
        element: <Placeholder title="Dashboard" descricao="Sua visão do dia chega na Fase 6." />,
      },
      { path: '/oportunidades', element: <OpportunitiesPage /> },
      { path: '/oportunidades/:id', element: <OpportunityDetailPage /> },
      { path: '/kanban', element: <BoardPage /> },
      { path: '/lab', element: <LabPage /> },
      { path: '/discovery', element: <DiscoveryListPage /> },
      { path: '/discovery/:id', element: <DiscoveryFillPage /> },
      { path: '/templates', element: <TemplatesPage /> },
      { path: '/templates/novo', element: <TemplateEditorPage /> },
      { path: '/templates/:id', element: <TemplateEditorPage /> },
      {
        path: '/busca',
        element: <Placeholder title="Busca" descricao="Busca global chega na Fase 6." />,
      },
      { path: '/estilo', element: <StyleGuide /> },
    ],
  },
  { path: '*', element: <NotFound /> },
])
