import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { readAccessSession, writeAccessSession } from '../lib/access'
import type { UserRole } from '../types/app'

interface AppContextValue {
  /** Indica si el usuario superó la barrera de PIN del cliente. */
  isAccessGranted: boolean
  grantAccess: () => void
  revokeAccess: () => void
  /**
   * Rol activo en la UI.
   * TODO: conectar a autenticación real del backend cuando exista login/JWT y roles.
   * Por ahora siempre es 'emisor'; 'admin' quedará disponible cuando el servidor lo exponga.
   */
  role: UserRole
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAccessGranted, setIsAccessGranted] = useState(readAccessSession)

  // TODO: reemplazar por el rol devuelto por el backend cuando haya autenticación de usuarios.
  const role: UserRole = 'emisor'

  const grantAccess = useCallback(() => {
    writeAccessSession(true)
    setIsAccessGranted(true)
  }, [])

  const revokeAccess = useCallback(() => {
    writeAccessSession(false)
    setIsAccessGranted(false)
  }, [])

  const value = useMemo(
    () => ({
      isAccessGranted,
      grantAccess,
      revokeAccess,
      role,
    }),
    [isAccessGranted, grantAccess, revokeAccess, role],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider')
  }
  return context
}
