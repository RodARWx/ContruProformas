import { openDB } from 'idb'
import type { DBSchema } from 'idb'
import type {
  OfflineProformaDraft,
  OfflineSyncStatus,
} from '../../types/sync'
import type { CreateProformaPayload } from './proformaMappers'

const DB_NAME = 'construproformas-offline'
const DB_VERSION = 1
const STORE_NAME = 'proforma-drafts'

interface OfflineDraftsDb extends DBSchema {
  [STORE_NAME]: {
    key: string
    value: OfflineProformaDraft
    indexes: {
      byStatus: OfflineSyncStatus
      byUpdatedAt: string
    }
  }
}

async function getDb() {
  return openDB<OfflineDraftsDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (db.objectStoreNames.contains(STORE_NAME)) return
      const store = db.createObjectStore(STORE_NAME, {
        keyPath: 'localId',
      })
      store.createIndex('byStatus', 'status')
      store.createIndex('byUpdatedAt', 'updatedAt')
    },
  })
}

export async function saveOfflineDraft(
  payload: CreateProformaPayload,
  status: OfflineSyncStatus = 'pending',
  lastError?: string,
): Promise<OfflineProformaDraft> {
  const db = await getDb()
  const now = new Date().toISOString()
  const localId = `offline-${payload.idProforma}-${crypto.randomUUID()}`

  const draft: OfflineProformaDraft = {
    localId,
    payload,
    status,
    createdAt: now,
    updatedAt: now,
    lastError,
    retryCount: 0,
  }

  await db.put(STORE_NAME, draft)
  return draft
}

export async function listOfflineDrafts(): Promise<OfflineProformaDraft[]> {
  const db = await getDb()
  const all = await db.getAll(STORE_NAME)
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function listSyncCandidates(): Promise<OfflineProformaDraft[]> {
  const db = await getDb()
  const all = await db.getAll(STORE_NAME)
  return all
    .filter((item) => item.status === 'pending' || item.status === 'failed')
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
}

export async function removeOfflineDraft(localId: string): Promise<void> {
  const db = await getDb()
  await db.delete(STORE_NAME, localId)
}

export async function markOfflineDraftFailed(
  localId: string,
  errorMessage: string,
): Promise<void> {
  const db = await getDb()
  const current = await db.get(STORE_NAME, localId)
  if (!current) return

  await db.put(STORE_NAME, {
    ...current,
    status: 'failed',
    updatedAt: new Date().toISOString(),
    lastError: errorMessage,
    retryCount: current.retryCount + 1,
  })
}

export async function markOfflineDraftPending(localId: string): Promise<void> {
  const db = await getDb()
  const current = await db.get(STORE_NAME, localId)
  if (!current) return

  await db.put(STORE_NAME, {
    ...current,
    status: 'pending',
    updatedAt: new Date().toISOString(),
    lastError: undefined,
  })
}

