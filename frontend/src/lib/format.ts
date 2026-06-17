/** Formatea montos sin forzar decimales en enteros (ej. 50 vs 50.25). */
export function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value)
  }
  return String(parseFloat(value.toFixed(2)))
}

export function formatCurrency(value: number): string {
  return `$${formatNumber(value)}`
}
