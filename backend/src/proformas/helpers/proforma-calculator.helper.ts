import { CreateProformaDetailDto } from '../dto/create-proforma-detail.dto';

/** Resultado del recálculo estricto de una línea de detalle */
export interface CalculatedDetailLine extends CreateProformaDetailDto {
  total: number;
  ivaLinea: number;
}

/** Totales recalculados del documento completo */
export interface CalculatedProformaTotals {
  detalles: CalculatedDetailLine[];
  subtotal: number;
  iva: number;
  totalGeneral: number;
  montoContrato: number;
  tiempoEjecucion: string;
}

/**
 * Redondea un valor monetario a 2 decimales para evitar
 * errores de precisión de punto flotante en SQLite.
 */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Recorre el arreglo de rubros y recalcula de forma estricta:
 * - filas esCategoria: total e IVA en 0, no suman al subtotal
 * - total línea = cantidad × costoUnitario
 * - ivaLinea = total línea × (ivaPercentage / 100)
 * - subtotal = Σ total línea (sin IVA, sin categorías)
 * - iva = Σ ivaLinea (sin categorías)
 * - totalGeneral = subtotal + iva
 * - montoContrato = totalGeneral
 * - tiempoEjecucion = Σ diasLaborables (sin categorías)
 */
export function calculateProformaTotals(
  detalles: CreateProformaDetailDto[],
): CalculatedProformaTotals {
  const calculatedDetails: CalculatedDetailLine[] = detalles.map((linea) => {
    if (linea.esCategoria) {
      return {
        ...linea,
        unidad: linea.unidad ?? '',
        cantidad: linea.cantidad ?? 0,
        costoUnitario: linea.costoUnitario ?? 0,
        diasLaborables: 0,
        ivaPercentage: 0,
        total: 0,
        ivaLinea: 0,
      };
    }

    const cantidad = linea.cantidad ?? 0;
    const costoUnitario = linea.costoUnitario ?? 0;
    const diasLaborables = linea.diasLaborables ?? 1;
    const ivaPercentage = linea.ivaPercentage ?? 0;
    const total = roundMoney(cantidad * costoUnitario);
    const ivaLinea = roundMoney(total * (ivaPercentage / 100));

    return {
      ...linea,
      cantidad,
      costoUnitario,
      unidad: linea.unidad ?? '',
      diasLaborables,
      ivaPercentage,
      total,
      ivaLinea,
    };
  });

  const rubros = calculatedDetails.filter((linea) => !linea.esCategoria);

  const subtotal = roundMoney(
    rubros.reduce((sum, linea) => sum + linea.total, 0),
  );

  const iva = roundMoney(
    rubros.reduce((sum, linea) => sum + linea.ivaLinea, 0),
  );

  const totalGeneral = roundMoney(subtotal + iva);
  const montoContrato = totalGeneral;
  const tiempoEjecucion = String(
    rubros.reduce((sum, linea) => sum + (linea.diasLaborables ?? 0), 0),
  );

  return {
    detalles: calculatedDetails,
    subtotal,
    iva,
    totalGeneral,
    montoContrato,
    tiempoEjecucion,
  };
}
