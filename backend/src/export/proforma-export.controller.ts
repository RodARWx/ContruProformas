import { Controller, Param, Post } from '@nestjs/common';
import { ProformaExportResult } from './dto/export-result.dto';
import { ExportService } from './export.service';

@Controller('proformas')
export class ProformaExportController {
  constructor(private readonly exportService: ExportService) {}

  /** Genera Excel y PDF, guarda en /data/exports y marca como EXPORTED */
  @Post(':id/export')
  exportBoth(@Param('id') id: string): Promise<ProformaExportResult> {
    return this.exportService.exportProforma(id, 'both');
  }

  /** Genera únicamente el archivo Excel editable (.xlsx) */
  @Post(':id/export/excel')
  exportExcel(@Param('id') id: string): Promise<ProformaExportResult> {
    return this.exportService.exportProforma(id, 'excel');
  }

  /** Genera únicamente el archivo PDF institucional para impresión */
  @Post(':id/export/pdf')
  exportPdf(@Param('id') id: string): Promise<ProformaExportResult> {
    return this.exportService.exportProforma(id, 'pdf');
  }
}
