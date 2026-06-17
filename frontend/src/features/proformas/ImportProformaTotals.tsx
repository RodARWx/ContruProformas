import { Card, Section } from '../../components/ui'
import { formatCurrency } from '../../lib/format'
import type { ImportPreviewResult } from '../../types/import'

interface ImportProformaTotalsProps {
  preview: ImportPreviewResult
  isRefreshing?: boolean
}

/** Totales devueltos por POST /proformas/import-preview (fuente de verdad del servidor). */
export function ImportProformaTotals({
  preview,
  isRefreshing = false,
}: ImportProformaTotalsProps) {
  const ivaPercent = Math.round(preview.ivaRate * 100)

  return (
    <Section
      title="Vista previa — totales del servidor"
      description="Valores recalculados por el backend a partir de los rubros importados."
    >
      <Card>
        <dl className="grid gap-4 text-left sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase text-brand-gray/60">
              Subtotal
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-brand-gray">
              {formatCurrency(preview.subtotal)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-brand-gray/60">
              IVA {preview.appliesIva ? `(${ivaPercent}%)` : '(no aplica)'}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-brand-gray">
              {formatCurrency(preview.iva)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-brand-gray/60">
              Total general
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-brand-wine">
              {formatCurrency(preview.totalGeneral)}
            </dd>
          </div>
        </dl>
        {isRefreshing && (
          <p className="mt-4 text-xs text-brand-gray/70">Actualizando totales…</p>
        )}
      </Card>
    </Section>
  )
}
