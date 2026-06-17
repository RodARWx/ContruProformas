import type { ProformaDetailLine } from '../../types/proforma-detail'
import type { ProformaHeaderDraft } from '../../types/proforma'

/** Línea de detalle según CreateProformaDetailDto / UpdateProformaDetailDto del backend. */
export interface ProformaDetailPayload {
  codigo?: string
  descripcion: string
  tiempo?: string
  unidad: string
  cantidad: number
  costoUnitario: number
}

/** Payload según CreateProformaDto del backend. */
export interface CreateProformaPayload {
  idProforma: string
  nombreProyecto: string
  tiempoEjecucion?: string
  fecha: string
  notas?: string
  appliesIva: boolean
  profileId: number
  customerId: number
  detalles: ProformaDetailPayload[]
}

/** Payload según UpdateProformaDto del backend. */
export type UpdateProformaPayload = Omit<CreateProformaPayload, 'idProforma'>

function mapDetailLine(line: ProformaDetailLine): ProformaDetailPayload {
  return {
    codigo: line.codigo.trim() || undefined,
    descripcion: line.descripcion.trim(),
    tiempo: line.tiempo?.trim() || undefined,
    unidad: line.unidad.trim(),
    cantidad: line.cantidad,
    costoUnitario: line.costoUnitario,
  }
}

export function draftToCreatePayload(
  header: ProformaHeaderDraft,
  detalles: ProformaDetailLine[],
): CreateProformaPayload {
  return {
    idProforma: header.idProforma.trim(),
    nombreProyecto: header.nombreProyecto.trim(),
    tiempoEjecucion: header.tiempoEjecucion.trim() || undefined,
    fecha: header.fecha,
    notas: header.notas.trim() || undefined,
    appliesIva: header.appliesIva,
    profileId: Number(header.profileId),
    customerId: Number(header.customerId),
    detalles: detalles.map(mapDetailLine),
  }
}

export function draftToUpdatePayload(
  header: ProformaHeaderDraft,
  detalles: ProformaDetailLine[],
): UpdateProformaPayload {
  const { idProforma: _id, ...payload } = draftToCreatePayload(header, detalles)
  return payload
}
