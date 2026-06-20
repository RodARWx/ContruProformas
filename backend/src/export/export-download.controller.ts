import {
  Controller,
  Get,
  NotFoundException,
  Param,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream } from 'fs';
import { ExportDownloadService } from './export-download.service';

@Controller('export')
export class ExportDownloadController {
  constructor(private readonly exportDownloadService: ExportDownloadService) {}

  /**
   * Descarga directa de un archivo generado en el directorio de exportaciones.
   * Fuerza descarga en el navegador mediante Content-Disposition.
   */
  @Get('download/:filename')
  async download(@Param('filename') filename: string): Promise<StreamableFile> {
    const file = await this.exportDownloadService.resolveExportFile(filename);
    if (!file) {
      throw new NotFoundException(`Archivo "${filename}" no encontrado`);
    }

    const stream = createReadStream(file.absolutePath);

    return new StreamableFile(stream, {
      type: file.mimeType,
      disposition: `attachment; filename="${encodeURIComponent(file.safeFilename)}"`,
    });
  }
}
