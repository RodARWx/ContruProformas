export interface ExportedFileInfo {
  filename: string;
  absolutePath: string;
  relativePath: string;
  mimeType: string;
}

export interface ProformaExportResult {
  idProforma: string;
  nombreProyecto: string;
  exportDirectory: string;
  excel?: ExportedFileInfo;
  pdf?: ExportedFileInfo;
  status: string;
}
