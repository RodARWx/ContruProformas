import type { ImportRubroPayload } from '../../types/import'

export const INSTITUTIONAL_TEMPLATE_ERROR =
  'El archivo no coincide con la plantilla institucional de Construmétrica. Suba un .xlsx generado por la exportación de esta aplicación (cabecera «CONSTRUMÉTRICA — PROFORMA» y tabla de rubros con las columnas Código, Descripción, Tiempo, Unidad, Cantidad y Costo Unit.).'

export class ExcelParseError extends Error {
  constructor(message: string = INSTITUTIONAL_TEMPLATE_ERROR) {
    super(message)
    this.name = 'ExcelParseError'
  }
}

export interface ParsedExcelMetadata {
  idProforma?: string
  nombreProyecto?: string
  fecha?: string
  tiempoEjecucion?: string
  nombreCliente?: string
  rucCedula?: string
  direccion?: string
  telefonoCliente?: string
  correoCliente?: string
  nombreEmisor?: string
  cargoEmisor?: string
  notas?: string
}

export interface ParsedInstitutionalExcel {
  metadata: ParsedExcelMetadata
  appliesIva: boolean
  rubros: ImportRubroPayload[]
}

type Matrix = unknown[][]
type WorkbookShape = {
  SheetNames: string[]
  Sheets: Record<string, unknown>
}

function normalizeText(value: unknown): string {
  if (value == null) return ''
  return String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase()
}

function cellStr(matrix: Matrix, row: number, col: number): string {
  const rowValues = matrix[row]
  if (!rowValues) return ''
  const value = rowValues[col]
  if (value == null) return ''
  return String(value).trim()
}

function parseNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const cleaned = value.replace(/[$,\s]/g, '').replace(/—/g, '')
    if (!cleaned) return null
    const parsed = Number(cleaned)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function readMatrix(
  workbook: WorkbookShape,
  sheetToJson: (sheet: unknown) => unknown[][],
): Matrix {
  const sheetName =
    workbook.SheetNames.find((name) => normalizeText(name) === 'proforma') ??
    workbook.SheetNames[0]

  if (!sheetName) {
    throw new ExcelParseError()
  }

  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    throw new ExcelParseError()
  }

  return sheetToJson(sheet) as Matrix
}

function validateInstitutionalHeader(matrix: Matrix): void {
  const title = cellStr(matrix, 0, 0)
  const normalizedTitle = normalizeText(title)

  if (
    !normalizedTitle.includes('construmetrica') ||
    !normalizedTitle.includes('proforma')
  ) {
    throw new ExcelParseError()
  }
}

function findItemsHeaderRow(matrix: Matrix): number {
  for (let rowIndex = 0; rowIndex < matrix.length; rowIndex += 1) {
    const row = matrix[rowIndex]
    if (!row) continue

    const col0 = normalizeText(row[0])
    const col1 = normalizeText(row[1])

    if (col0 === 'codigo' && col1.includes('descripcion')) {
      return rowIndex
    }
  }

  return -1
}

function isTotalsRow(row: unknown[]): boolean {
  const label = normalizeText(row[0])
  return label.includes('subtotal') || label.includes('total general')
}

function isSectionRow(row: unknown[]): boolean {
  const label = normalizeText(row[0])
  return (
    label.includes('datos del cliente') ||
    label.includes('perfil emisor') ||
    label.includes('notas')
  )
}

function parseRubroRow(row: unknown[]): ImportRubroPayload | null {
  const descripcion = String(row[1] ?? '').trim()
  const unidad = String(row[3] ?? '').trim()
  const cantidad = parseNumber(row[4])
  const costoUnitario = parseNumber(row[5])

  if (!descripcion || !unidad || cantidad == null || costoUnitario == null) {
    return null
  }

  if (cantidad <= 0 || costoUnitario < 0) {
    return null
  }

  const codigoRaw = String(row[0] ?? '').trim()
  const tiempoRaw = String(row[2] ?? '').trim()

  return {
    codigo: codigoRaw && codigoRaw !== '—' ? codigoRaw : undefined,
    descripcion,
    tiempo: tiempoRaw && tiempoRaw !== '—' ? tiempoRaw : undefined,
    unidad,
    cantidad,
    costoUnitario,
  }
}

function detectAppliesIva(matrix: Matrix, fromRow: number): boolean {
  for (let rowIndex = fromRow; rowIndex < matrix.length; rowIndex += 1) {
    const row = matrix[rowIndex]
    if (!row) continue
    const label = normalizeText(row[0])
    if (label.includes('iva')) return true
    if (label.includes('total general')) break
  }
  return false
}

function extractLabeledValue(matrix: Matrix, label: string): string | undefined {
  const target = normalizeText(label)

  for (let rowIndex = 0; rowIndex < matrix.length; rowIndex += 1) {
    const row = matrix[rowIndex]
    if (!row) continue

    if (normalizeText(row[0]) !== target) continue

    const inlineValue = String(row[2] ?? row[1] ?? '').trim()
    if (inlineValue && inlineValue !== '—') {
      return inlineValue
    }
  }

  return undefined
}

function extractSectionRows(
  matrix: Matrix,
  sectionTitle: string,
): Record<string, string> {
  const result: Record<string, string> = {}
  const target = normalizeText(sectionTitle)
  let inSection = false

  for (let rowIndex = 0; rowIndex < matrix.length; rowIndex += 1) {
    const row = matrix[rowIndex]
    if (!row) continue

    const firstCell = normalizeText(row[0])

    if (!inSection) {
      if (firstCell === target) inSection = true
      continue
    }

    if (isSectionRow(row) && firstCell !== target) break
    if (firstCell.includes('codigo') && normalizeText(row[1]).includes('descripcion')) {
      break
    }

    const key = String(row[0] ?? '').trim()
    const value = String(row[1] ?? row[2] ?? '').trim()
    if (key && value && value !== '—') {
      result[key] = value
    }
  }

  return result
}

function extractMetadata(matrix: Matrix): ParsedExcelMetadata {
  const subtitle = cellStr(matrix, 1, 0)
  const idMatch = subtitle.match(/documento:\s*(.+)/i)
  const clientSection = extractSectionRows(matrix, 'DATOS DEL CLIENTE')
  const emitterSection = extractSectionRows(matrix, 'PERFIL EMISOR')

  let notas: string | undefined
  for (let rowIndex = 0; rowIndex < matrix.length; rowIndex += 1) {
    if (normalizeText(matrix[rowIndex]?.[0]) !== 'notas') continue
    const value = cellStr(matrix, rowIndex + 1, 0)
    if (value) notas = value
    break
  }

  return {
    idProforma: idMatch?.[1]?.trim(),
    nombreProyecto: extractLabeledValue(matrix, 'Proyecto'),
    fecha: extractLabeledValue(matrix, 'Fecha'),
    tiempoEjecucion: extractLabeledValue(matrix, 'Tiempo de ejecución'),
    nombreCliente: clientSection.Cliente,
    rucCedula: clientSection['RUC / Cédula'] ?? clientSection['RUC / Cedula'],
    direccion: clientSection.Dirección ?? clientSection.Direccion,
    telefonoCliente: clientSection.Teléfono ?? clientSection.Telefono,
    correoCliente: clientSection.Correo,
    nombreEmisor: emitterSection.Nombre,
    cargoEmisor: emitterSection.Cargo,
    notas,
  }
}

/**
 * Lee un .xlsx con la plantilla institucional exportada por el backend
 * y construye el payload para import-preview.
 */
export async function parseInstitutionalExcel(
  arrayBuffer: ArrayBuffer,
): Promise<ParsedInstitutionalExcel> {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(arrayBuffer, { type: 'array' }) as WorkbookShape
  const matrix = readMatrix(workbook, (sheet) =>
    XLSX.utils.sheet_to_json<unknown[]>(sheet as Record<string, unknown>, {
      header: 1,
      defval: '',
      raw: true,
    }),
  )

  if (matrix.length < 23) {
    throw new ExcelParseError()
  }

  validateInstitutionalHeader(matrix)

  const headerRow = findItemsHeaderRow(matrix)
  if (headerRow < 0) {
    throw new ExcelParseError()
  }

  const rubros: ImportRubroPayload[] = []
  let totalsRow = -1

  for (let rowIndex = headerRow + 1; rowIndex < matrix.length; rowIndex += 1) {
    const row = matrix[rowIndex]
    if (!row) continue

    if (isTotalsRow(row)) {
      totalsRow = rowIndex
      break
    }

    const rubro = parseRubroRow(row)
    if (rubro) {
      rubros.push(rubro)
    }
  }

  if (rubros.length === 0) {
    throw new ExcelParseError()
  }

  const appliesIva =
    totalsRow >= 0 ? detectAppliesIva(matrix, totalsRow) : false

  return {
    metadata: extractMetadata(matrix),
    appliesIva,
    rubros,
  }
}
