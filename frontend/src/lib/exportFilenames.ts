/** Caracteres prohibidos en nombres de archivo Windows/Linux */
const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\u0000-\u001f]/g

/**
 * Nombre de archivo de exportación alineado con el backend:
 * "[ID de la Proforma] - [Nombre del Proyecto].ext"
 */
export function buildExportFilename(
  idProforma: string,
  nombreProyecto: string,
  extension: 'xlsx' | 'pdf',
): string {
  const rawBase = `${idProforma} - ${nombreProyecto}`

  const sanitized = rawBase
    .replace(INVALID_FILENAME_CHARS, '')
    .replace(/\s+/g, ' ')
    .replace(/\.+$/, '')
    .trim()
    .slice(0, 180)

  const safeBase = sanitized.length > 0 ? sanitized : idProforma

  return `${safeBase}.${extension}`
}
