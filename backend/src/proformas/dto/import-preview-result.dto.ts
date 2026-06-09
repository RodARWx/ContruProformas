import { CalculatedDetailLine } from '../helpers/proforma-calculator.helper';

/** Respuesta formateada lista para previsualización en pantalla */
export interface ImportPreviewResult {
  appliesIva: boolean;
  ivaRate: number;
  detalles: CalculatedDetailLine[];
  subtotal: number;
  iva: number;
  totalGeneral: number;
}
