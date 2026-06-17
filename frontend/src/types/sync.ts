import type { Proforma } from './proforma'
import type { CreateProformaPayload } from '../features/proformas/proformaMappers'

export type OfflineSyncStatus = 'pending' | 'failed'

export interface OfflineProformaDraft {
  localId: string
  payload: CreateProformaPayload
  status: OfflineSyncStatus
  createdAt: string
  updatedAt: string
  lastError?: string
  retryCount: number
}

export interface SyncItemResult {
  idProforma: string
  success: boolean
  proforma?: Proforma
  error?: string
}

export interface SyncProformasResult {
  total: number
  succeeded: number
  failed: number
  results: SyncItemResult[]
}

