import { Proforma } from '../entities/proforma.entity';

/** Resultado parcial de la sincronización offline por proforma */
export interface SyncItemResult {
  idProforma: string;
  success: boolean;
  proforma?: Proforma;
  error?: string;
}

/** Respuesta consolidada del endpoint POST /proformas/sync */
export interface SyncProformasResult {
  total: number;
  succeeded: number;
  failed: number;
  results: SyncItemResult[];
}
