/** Rubro enviado a POST /proformas/import-preview (ImportRubroDto). */
export interface ImportRubroPayload {
  codigo?: string
  descripcion: string
  tiempo?: string
  unidad: string
  cantidad: number
  costoUnitario: number
}

/** Payload de POST /proformas/import-preview (ImportPreviewDto). */
export interface ImportPreviewPayload {
  appliesIva: boolean
  rubros: ImportRubroPayload[]
}

/** Línea calculada devuelta por import-preview (CalculatedDetailLine). */
export interface ImportPreviewDetail {
  codigo?: string
  descripcion: string
  tiempo?: string
  unidad: string
  cantidad: number
  costoUnitario: number
  total: number
}

/** Respuesta de POST /proformas/import-preview (ImportPreviewResult). */
export interface ImportPreviewResult {
  appliesIva: boolean
  ivaRate: number
  detalles: ImportPreviewDetail[]
  subtotal: number
  iva: number
  totalGeneral: number
}
