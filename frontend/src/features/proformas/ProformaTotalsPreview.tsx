import { Card, Section } from '../../components/ui'
import { formatCurrency } from '../../lib/format'
import type { Proforma } from '../../types/proforma'

interface ProformaTotalsPreviewProps {
  proforma: Proforma
}

/** Muestra totales devueltos por el backend tras guardar (no cálculo local). */
export function ProformaTotalsPreview({ proforma }: ProformaTotalsPreviewProps) {
  return (
    <Section
      title="Vista previa — totales del servidor"
      description="Valores recalculados por el backend al guardar. Son los definitivos para este borrador."
    >
      <Card>
        <dl className="grid gap-4 text-left sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase text-brand-gray/60">
              Subtotal
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-brand-gray">
              {formatCurrency(proforma.subtotal)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-brand-gray/60">
              IVA {proforma.appliesIva ? '' : '(no aplica)'}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-brand-gray">
              {formatCurrency(proforma.iva)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-brand-gray/60">
              Total general
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-brand-wine">
              {formatCurrency(proforma.totalGeneral)}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-brand-gray/70">
          ID guardado: <span className="font-semibold">{proforma.idProforma}</span> ·
          Estado: {proforma.status === 'EXPORTED' ? 'Exportada' : 'Borrador'}
        </p>
      </Card>
    </Section>
  )
}
