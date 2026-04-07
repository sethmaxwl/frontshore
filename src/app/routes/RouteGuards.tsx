import type { JSX } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/app/providers/AuthProvider'

export function ProtectedRoute(): JSX.Element {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        state={{ from: `${location.pathname}${location.search}` }}
        to="/login"
      />
    )
  }

  return <Outlet />
}

export function GuestOnlyRoute(): JSX.Element {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate replace to="/profile" />
  }

  return <Outlet />
}
