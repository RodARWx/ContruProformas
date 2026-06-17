import type { ApuBreakdown } from '../../types/proforma-detail'

function parseApuAmount(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

/**
 * Suma componentes del APU y, si hay rendimiento > 0, divide entre él.
 * Herramienta local para estimar costo unitario; no reemplaza el cálculo del backend.
 */
export function calculateApuSuggestedUnitCost(apu: ApuBreakdown): number {
  const directCost =
    parseApuAmount(apu.equipos) +
    parseApuAmount(apu.manoObra) +
    parseApuAmount(apu.materiales) +
    parseApuAmount(apu.herramientas) +
    parseApuAmount(apu.transporte) +
    parseApuAmount(apu.alimentacionEstadia)

  const rendimiento = parseApuAmount(apu.rendimiento)
  if (rendimiento > 0) {
    return directCost / rendimiento
  }

  return directCost
}
