import type { ProformaDetailLine } from '../../types/proforma-detail'
import type { ProformaHeaderDraft } from '../../types/proforma'

export type HeaderFieldErrors = Partial<Record<keyof ProformaHeaderDraft, string>>

export function validateProformaHeader(
  draft: ProformaHeaderDraft,
): HeaderFieldErrors {
  const errors: HeaderFieldErrors = {}

  if (!draft.idProforma.trim()) {
    errors.idProforma = 'El ID de proforma es obligatorio'
  }
  if (!draft.nombreProyecto.trim()) {
    errors.nombreProyecto = 'El nombre del proyecto es obligatorio'
  }
  if (!draft.customerId) {
    errors.customerId = 'Seleccione un cliente'
  }
  if (!draft.nombreCliente.trim()) {
    errors.nombreCliente = 'El cliente es obligatorio'
  }
  if (!draft.rucCedula.trim()) {
    errors.rucCedula = 'El RUC/Cédula es obligatorio'
  }
  if (!draft.direccion.trim()) {
    errors.direccion = 'La dirección es obligatoria'
  }
  if (!draft.montoContrato.trim()) {
    errors.montoContrato = 'El monto del contrato es obligatorio'
  } else if (
    Number.isNaN(Number(draft.montoContrato)) ||
    Number(draft.montoContrato) < 0
  ) {
    errors.montoContrato = 'Ingrese un monto válido mayor o igual a 0'
  }
  if (!draft.tiempoEjecucion.trim()) {
    errors.tiempoEjecucion = 'El tiempo de ejecución es obligatorio'
  }
  if (!draft.fecha) {
    errors.fecha = 'La fecha es obligatoria'
  }
  if (!draft.profileId) {
    errors.profileId = 'Seleccione el perfil emisor'
  }

  return errors
}

export function validateProformaDetalles(detalles: ProformaDetailLine[]): string | undefined {
  if (detalles.length === 0) {
    return 'Agregue al menos un rubro al detalle'
  }

  for (const [index, line] of detalles.entries()) {
    if (!line.descripcion.trim()) {
      return `La línea ${index + 1} necesita descripción`
    }
    if (!line.unidad.trim()) {
      return `La línea ${index + 1} necesita unidad`
    }
    if (line.cantidad < 0) {
      return `La cantidad de la línea ${index + 1} no puede ser negativa`
    }
    if (line.costoUnitario < 0) {
      return `El costo unitario de la línea ${index + 1} no puede ser negativo`
    }
  }

  return undefined
}
