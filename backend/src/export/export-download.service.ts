import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { basename, extname, join } from 'path';
import { getExportsDirectory } from './helpers/storage-path.helper';

const ALLOWED_EXTENSIONS = new Set(['.xlsx', '.pdf']);

@Injectable()
export class ExportDownloadService {
  /**
   * Valida el nombre de archivo y resuelve la ruta física dentro de exports/.
   * Rechaza traversal (../) y extensiones no permitidas.
   */
  async resolveExportFile(filename: string): Promise<{
    absolutePath: string;
    mimeType: string;
    safeFilename: string;
  } | null> {
    const safeFilename = basename(filename.trim());
    if (!safeFilename || safeFilename !== filename.trim()) {
      throw new BadRequestException('Nombre de archivo inválido');
    }

    const extension = extname(safeFilename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      throw new BadRequestException(
        'Solo se permiten archivos .xlsx o .pdf exportados',
      );
    }

    const absolutePath = join(getExportsDirectory(), safeFilename);
    if (!existsSync(absolutePath)) {
      return null;
    }

    const mimeType =
      extension === '.pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    return { absolutePath, mimeType, safeFilename };
  }
}
