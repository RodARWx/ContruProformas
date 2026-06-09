import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * Obtiene el directorio base de datos a partir de DATABASE_PATH.
 * Ejemplo: /app/data/construproformas.db → /app/data
 */
export function getDataDirectory(): string {
  const databasePath =
    process.env.DATABASE_PATH ?? join(process.cwd(), 'data', 'construproformas.db');

  return dirname(databasePath);
}

/** Directorio donde se persisten PDF y Excel exportados (NAS: /app/data/exports) */
export function getExportsDirectory(): string {
  const exportsDir = join(getDataDirectory(), 'exports');

  if (!existsSync(exportsDir)) {
    mkdirSync(exportsDir, { recursive: true });
  }

  return exportsDir;
}
