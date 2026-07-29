import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/layouts/AppShell'
import { FrameworkSelectionPage } from '@/pages/FrameworkSelectionPage'
import { DomainSelectionPage } from '@/pages/DomainSelectionPage'
import { NewAssessmentPage } from '@/pages/NewAssessmentPage'
import { AssessmentsListPage } from '@/pages/AssessmentsListPage'
import { AssessmentWorkspacePage } from '@/pages/AssessmentWorkspacePage'
import { RegulationUpdatesPage } from '@/pages/RegulationUpdatesPage'
import { AuditLogPage } from '@/pages/AuditLogPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <FrameworkSelectionPage /> },
      { path: '/dga', element: <DomainSelectionPage /> },
      { path: '/dga/new', element: <NewAssessmentPage /> },
      { path: '/assessments', element: <AssessmentsListPage /> },
      { path: '/assessments/:assessmentId', element: <AssessmentWorkspacePage /> },
      { path: '/regulations', element: <RegulationUpdatesPage /> },
      { path: '/audit', element: <AuditLogPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
