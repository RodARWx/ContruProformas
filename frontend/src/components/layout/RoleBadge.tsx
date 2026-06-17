import { useApp } from '../../context/AppContext'
import type { UserRole } from '../../types/app'
import { cn } from '../../lib/cn'

const roleLabels: Record<UserRole, string> = {
  emisor: 'Emisor',
  admin: 'Administrador',
}

/** Indicador visual del rol activo (placeholder hasta autenticación real). */
export function RoleBadge({ className }: { className?: string }) {
  const { role } = useApp()

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-brand-gray/20 bg-white px-2.5 py-1 text-left text-xs font-semibold text-brand-gray',
        className,
      )}
      title="Rol de usuario (placeholder; pendiente de backend)"
    >
      Rol: {roleLabels[role]}
    </span>
  )
}
