import { Injectable } from '@nestjs/common';
import { ProformaStatus } from '../proformas/enums/proforma-status.enum';
import { ProformasService } from '../proformas/proformas.service';
import { ProformaExportResult } from './dto/export-result.dto';
import { getExportsDirectory } from './helpers/storage-path.helper';
import { ProformaExcelExportService } from './services/proforma-excel-export.service';
import { ProformaPdfExportService } from './services/proforma-pdf-export.service';

export type ExportFormat = 'excel' | 'pdf' | 'both';

@Injectable()
export class ExportService {
  constructor(
    private readonly proformasService: ProformasService,
    private readonly excelExportService: ProformaExcelExportService,
    private readonly pdfExportService: ProformaPdfExportService,
  ) {}

  /**
   * Genera archivos de exportación y marca la proforma como EXPORTED.
   * Los archivos se guardan en {directorio de DATABASE_PATH}/exports/
   */
  async exportProforma(
    idProforma: string,
    format: ExportFormat = 'both',
  ): Promise<ProformaExportResult> {
    const proforma = await this.proformasService.findOne(idProforma);

    const result: ProformaExportResult = {
      idProforma: proforma.idProforma,
      nombreProyecto: proforma.nombreProyecto,
      exportDirectory: getExportsDirectory(),
      status: proforma.status,
    };

    if (format === 'excel' || format === 'both') {
      result.excel = await this.excelExportService.export(proforma);
    }

    if (format === 'pdf' || format === 'both') {
      result.pdf = await this.pdfExportService.export(proforma);
    }

    await this.proformasService.markAsExported(idProforma);

    result.status = ProformaStatus.EXPORTED;

    return result;
  }
}
