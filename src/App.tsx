import { Navigate, Route, Routes } from 'react-router-dom'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Projects from '@/pages/Projects'
import ProjectDetail from '@/pages/ProjectDetail'
import Sandbox from '@/pages/Sandbox'
import SandboxPublic from '@/pages/SandboxPublic'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppShell } from '@/components/AppShell'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <Dashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <AppShell>
              <Projects />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <AppShell>
              <ProjectDetail />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/sandbox"
        element={
          <ProtectedRoute redirectMessage="Please sign in to access the Impact Sandbox.">
            <AppShell>
              <Sandbox />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<SandboxPublic />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
