import { toast } from 'sonner'

/**
 * Notificaciones tipo Toast para Construproformas.
 *
 * @example
 * ```ts
 * import { notify } from '@/lib/toast'
 *
 * notify.success('Proforma guardada correctamente')
 * notify.error('No se pudo conectar con el servidor')
 * notify.warning('El ID ingresado ya existe en registros exportados')
 * notify.info('Los totales se recalculan al guardar')
 * ```
 */
export const notify = {
  success: (message: string, description?: string) =>
    toast.success(message, { description }),

  error: (message: string, description?: string) =>
    toast.error(message, { description }),

  warning: (message: string, description?: string) =>
    toast.warning(message, { description }),

  info: (message: string, description?: string) =>
    toast.info(message, { description }),
}
