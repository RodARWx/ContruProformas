/**
 * Desglose de Análisis de Precio Unitario (APU).
 * Solo calculadora auxiliar del cliente; el backend actual NO persiste estos campos.
 * TODO: confirmar con backend si existirá endpoint/modelo para APU antes de enviarlo.
 */
export interface ApuBreakdown {
  rendimiento: string
  equipos: string
  manoObra: string
  materiales: string
  herramientas: string
  transporte: string
  alimentacionEstadia: string
}

export function createEmptyApuBreakdown(): ApuBreakdown {
  return {
    rendimiento: '',
    equipos: '',
    manoObra: '',
    materiales: '',
    herramientas: '',
    transporte: '',
    alimentacionEstadia: '',
  }
}

export interface ProformaDetailLine {
  localId: string
  codigo: string
  descripcion: string
  /** Opcional; el backend lo persiste si se envía en el detalle. */
  tiempo?: string
  unidad: string
  cantidad: number
  costoUnitario: number
  /** APU auxiliar local; no se envía al backend en fases actuales. */
  apu: ApuBreakdown
}

export function createDetailLine(
  partial: Partial<Omit<ProformaDetailLine, 'localId' | 'apu'>> & {
    localId?: string
  } = {},
): ProformaDetailLine {
  return {
    localId: partial.localId ?? crypto.randomUUID(),
    codigo: partial.codigo ?? '',
    descripcion: partial.descripcion ?? '',
    tiempo: partial.tiempo,
    unidad: partial.unidad ?? '',
    cantidad: partial.cantidad ?? 1,
    costoUnitario: partial.costoUnitario ?? 0,
    apu: createEmptyApuBreakdown(),
  }
}

/** Total de línea solo para referencia visual en edición; el backend recalcula al guardar. */
export function calculateLineTotalReference(
  cantidad: number,
  costoUnitario: number,
): number {
  return cantidad * costoUnitario
}
