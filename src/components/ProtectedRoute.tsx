import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { Enums } from '@/lib/database.types'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: Enums<'user_role'>[]
  redirectMessage?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectMessage = 'Please sign in to access your Organization Dashboard.',
}: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Loading…
      </div>
    )
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: redirectMessage,
        }}
      />
    )
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-slate-500">
        <p className="text-lg font-medium text-slate-700">Access restricted</p>
        <p>Your role does not have permission to view this page.</p>
      </div>
    )
  }

  return <>{children}</>
}
