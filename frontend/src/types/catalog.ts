/** Rubro del catálogo tal como lo devuelve el backend. */
export interface CatalogItem {
  id: number
  codigoSugerido: string | null
  descripcion: string
  unidad: string
  costoUnitario: number
}

export interface CreateCatalogItemPayload {
  codigoSugerido?: string
  descripcion: string
  unidad: string
  costoUnitario: number
}

export type UpdateCatalogItemPayload = Partial<CreateCatalogItemPayload>

/** Datos listos para insertar como línea de rubro en una proforma (fase 6). */
export interface RubroLineInsert {
  codigo: string
  descripcion: string
  unidad: string
  costoUnitario: number
}

export function catalogItemToLineInsert(item: CatalogItem): RubroLineInsert {
  return {
    codigo: item.codigoSugerido ?? '',
    descripcion: item.descripcion,
    unidad: item.unidad,
    costoUnitario: item.costoUnitario,
  }
}
