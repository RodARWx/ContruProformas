import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { useApp } from '../context/AppContext'

/** Redirige a /acceso si el PIN del cliente aún no fue validado. */
export function RequireAccess() {
  const { isAccessGranted } = useApp()
  const location = useLocation()

  if (!isAccessGranted) {
    return <Navigate to="/acceso" replace state={{ from: location }} />
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
