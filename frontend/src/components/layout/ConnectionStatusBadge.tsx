import { useSync } from '../../context/SyncContext'
import { cn } from '../../lib/cn'

export function ConnectionStatusBadge() {
  const { isOnline, isSyncing, pendingCount, failedCount, retrySyncNow } = useSync()

  const statusLabel = isOnline ? 'En línea' : 'Sin conexión'

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
          isOnline
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-amber-50 text-amber-700',
        )}
      >
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            isOnline ? 'bg-emerald-500' : 'bg-amber-500',
          )}
        />
        {statusLabel}
      </span>

      {(pendingCount > 0 || failedCount > 0) && (
        <span className="text-xs text-brand-gray/75">
          Pendientes: {pendingCount + failedCount}
        </span>
      )}

      {failedCount > 0 && isOnline && (
        <button
          type="button"
          onClick={() => void retrySyncNow()}
          disabled={isSyncing}
          className="app-text-link text-xs disabled:opacity-50"
        >
          {isSyncing ? 'Sincronizando…' : 'Reintentar'}
        </button>
      )}
    </div>
  )
}

