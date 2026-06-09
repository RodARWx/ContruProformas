/** Prefijo por defecto cuando aún no existen proformas en la base de datos */
export const DEFAULT_PROFORMA_ID_PREFIX = 'CM-PROF-';

/**
 * Extrae el prefijo y el número secuencial de un ID con formato "PREFIJO-N".
 * Ejemplo: "CM-PROF-85" → { prefix: "CM-PROF-", sequence: 85 }
 */
export function parseProformaId(idProforma: string): {
  prefix: string;
  sequence: number;
} | null {
  const match = idProforma.match(/^(.*-)(\d+)$/);
  if (!match) {
    return null;
  }

  return {
    prefix: match[1],
    sequence: parseInt(match[2], 10),
  };
}

/**
 * A partir de una lista de IDs existentes, determina el siguiente secuencial
 * reutilizando el prefijo del registro con mayor número.
 */
export function suggestNextProformaId(existingIds: string[]): string {
  let bestPrefix = DEFAULT_PROFORMA_ID_PREFIX;
  let maxSequence = 0;

  for (const id of existingIds) {
    const parsed = parseProformaId(id);
    if (parsed && parsed.sequence > maxSequence) {
      maxSequence = parsed.sequence;
      bestPrefix = parsed.prefix;
    }
  }

  return `${bestPrefix}${maxSequence + 1}`;
}
