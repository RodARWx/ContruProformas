import { apiDelete, apiGet, apiPatch, apiPost } from '../../lib/api'
import type {
  CatalogItem,
  CreateCatalogItemPayload,
  UpdateCatalogItemPayload,
} from '../../types/catalog'

export async function fetchCatalogItems(): Promise<CatalogItem[]> {
  return apiGet<CatalogItem[]>('/catalog')
}

export async function searchCatalogItems(
  q: string,
  limit = 10,
  signal?: AbortSignal,
): Promise<CatalogItem[]> {
  return apiGet<CatalogItem[]>('/catalog/search', {
    params: { q, limit },
    signal,
  })
}

export async function createCatalogItem(
  payload: CreateCatalogItemPayload,
): Promise<CatalogItem> {
  return apiPost<CatalogItem>('/catalog', payload)
}

export async function updateCatalogItem(
  id: number,
  payload: UpdateCatalogItemPayload,
): Promise<CatalogItem> {
  return apiPatch<CatalogItem>(`/catalog/${id}`, payload)
}

export async function deleteCatalogItem(id: number): Promise<void> {
  return apiDelete<void>(`/catalog/${id}`)
}
