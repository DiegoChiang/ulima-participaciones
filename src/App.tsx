import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppLayout } from './layout/AppLayout'
import { SectionLayout } from './layout/SectionLayout'
import { AuthPage } from './pages/AuthPage'
import { GroupsPage } from './pages/GroupsPage'
import { ParticipationEditorPage } from './pages/ParticipationEditorPage'
import { ParticipationHistoryPage } from './pages/ParticipationHistoryPage'
import { SectionsPage } from './pages/SectionsPage'
import { StudentsPage } from './pages/StudentsPage'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/auth/callback" element={<Navigate to="/" replace />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<SectionsPage />} />
          <Route path="sections/:sectionId" element={<SectionLayout />}>
            <Route index element={<Navigate to="students" replace />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="individual-participations" element={<ParticipationHistoryPage type="individual" />} />
            <Route path="individual-participations/new" element={<ParticipationEditorPage type="individual" />} />
            <Route path="individual-participations/:recordId/edit" element={<ParticipationEditorPage type="individual" />} />
            <Route path="group-participations" element={<ParticipationHistoryPage type="group" />} />
            <Route path="group-participations/new" element={<ParticipationEditorPage type="group" />} />
            <Route path="group-participations/:recordId/edit" element={<ParticipationEditorPage type="group" />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
