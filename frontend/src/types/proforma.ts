import type { ProformaDetailLine } from './proforma-detail'

export type ProformaStatus = 'DRAFT' | 'EXPORTED'

export interface NextIdResponse {
  suggestedId: string
}

export interface ProformaDetail {
  id: number
  codigo: string | null
  descripcion: string
  tiempo: string | null
  unidad: string
  cantidad: number
  costoUnitario: number
  total: number
}

export interface Proforma {
  idProforma: string
  nombreProyecto: string
  tiempoEjecucion: string | null
  fecha: string
  notas: string | null
  subtotal: number
  iva: number
  totalGeneral: number
  appliesIva: boolean
  status: ProformaStatus
  profileId: number
  customerId: number
  detalles?: ProformaDetail[]
  profile?: {
    id: number
    nombre: string
    cargo: string
    registroSenescyt: string | null
    telefono: string | null
    correo: string | null
  }
  customer?: {
    id: number
    nombreCliente: string
    rucCedula: string
    direccion: string | null
    telefono: string | null
    correo: string | null
  }
}

/** Cabecera de proforma en borrador local (fase 5–7). */
export interface ProformaHeaderDraft {
  idProforma: string
  suggestedId: string
  nombreProyecto: string
  customerId: number | ''
  nombreCliente: string
  rucCedula: string
  direccion: string
  /** Solo frontend por ahora; el backend actual no persiste este campo. */
  montoContrato: string
  tiempoEjecucion: string
  fecha: string
  notas: string
  profileId: number | ''
  appliesIva: boolean
}

export interface ProformaDraft {
  header: ProformaHeaderDraft
  detalles: ProformaDetailLine[]
}

export interface ExportedFileInfo {
  filename: string
  absolutePath: string
  relativePath: string
  mimeType: string
}

export interface ProformaExportResult {
  idProforma: string
  nombreProyecto: string
  exportDirectory: string
  excel?: ExportedFileInfo
  pdf?: ExportedFileInfo
  status: ProformaStatus
}

export type ProformaIdAvailability = 'available' | 'in_use' | 'exported'

export function createEmptyHeaderDraft(
  suggestedId = '',
  fecha = new Date().toISOString().slice(0, 10),
): ProformaHeaderDraft {
  return {
    idProforma: suggestedId,
    suggestedId,
    nombreProyecto: '',
    customerId: '',
    nombreCliente: '',
    rucCedula: '',
    direccion: '',
    montoContrato: '',
    tiempoEjecucion: '',
    fecha,
    notas: '',
    profileId: '',
    appliesIva: true,
  }
}
