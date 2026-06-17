import { Fragment } from 'react'
import { RubroAutocomplete } from '../catalog/RubroAutocomplete'
import { Button, Card, Section } from '../../components/ui'
import { useProformaDraft } from '../../context/ProformaDraftContext'
import { cn } from '../../lib/cn'
import { formatCurrency } from '../../lib/format'
import { notify } from '../../lib/toast'
import type { RubroLineInsert } from '../../types/catalog'
import {
  calculateLineTotalReference,
  createDetailLine,
  type ProformaDetailLine,
} from '../../types/proforma-detail'
import { ApuPanel } from './ApuPanel'

const cellInputClass = cn(
  'w-full min-w-[5rem] rounded border border-brand-gray/20 bg-white px-2 py-1.5',
  'text-left text-sm text-brand-gray focus:border-brand-coral focus:outline-none focus:ring-1 focus:ring-brand-coral/30',
)

export function ProformaDetailTable() {
  const {
    detalles,
    isReadOnly,
    detailFieldError,
    addDetailLine,
    updateDetailLine,
    removeDetailLine,
    persistDraft,
  } = useProformaDraft()

  function handleAddFromCatalog(line: RubroLineInsert) {
    addDetailLine(
      createDetailLine({
        codigo: line.codigo,
        descripcion: line.descripcion,
        unidad: line.unidad,
        costoUnitario: line.costoUnitario,
        cantidad: 1,
      }),
    )
    persistDraft()
    notify.success('Rubro agregado', line.descripcion)
  }

  function handleAddEmptyLine() {
    addDetailLine(createDetailLine())
    persistDraft()
  }

  function handleUpdateLine(localId: string, patch: Partial<ProformaDetailLine>) {
    updateDetailLine(localId, patch)
    persistDraft()
  }

  function handleRemoveLine(localId: string) {
    removeDetailLine(localId)
    persistDraft()
    notify.info('Línea eliminada')
  }

  const visualSubtotal = detalles.reduce(
    (sum, line) =>
      sum + calculateLineTotalReference(line.cantidad, line.costoUnitario),
    0,
  )

  return (
    <Section
      title="Detalle de rubros"
      description="Agregue líneas desde el catálogo o manualmente. Los totales mostrados son referencia visual; el backend recalcula al guardar o exportar."
    >
      <Card className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <RubroAutocomplete
            label="Agregar rubro desde catálogo"
            onSelect={handleAddFromCatalog}
            disabled={isReadOnly}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddEmptyLine}
            disabled={isReadOnly}
          >
            Línea vacía
          </Button>
        </div>

        {detailFieldError && (
          <p className="text-sm text-brand-red" role="alert">
            {detailFieldError}
          </p>
        )}

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[48rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-brand-gray/20">
                {[
                  'Código',
                  'Descripción',
                  'Unidad',
                  'Cantidad',
                  'Costo unit.',
                  'Total ref.',
                  'Acciones',
                ].map((header, index) => (
                  <th
                    key={header}
                    scope="col"
                    className={cn(
                      'px-2 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-brand-gray/80',
                      index >= 3 && index <= 5 && 'text-right',
                    )}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detalles.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-2 py-6 text-left text-brand-gray/70"
                  >
                    No hay líneas. Busque un rubro o agregue una línea vacía.
                  </td>
                </tr>
              ) : (
                detalles.map((line) => {
                  // Referencia visual; el total definitivo lo recalcula el backend al guardar/exportar.
                  const lineTotal = calculateLineTotalReference(
                    line.cantidad,
                    line.costoUnitario,
                  )

                  return (
                    <Fragment key={line.localId}>
                      <tr className="border-b border-brand-gray/10">
                        <td className="px-2 py-2 align-top">
                          <input
                            className={cellInputClass}
                            value={line.codigo}
                            onChange={(event) =>
                              handleUpdateLine(line.localId, {
                                codigo: event.target.value,
                              })
                            }
                          aria-label="Código"
                          disabled={isReadOnly}
                        />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            className={cn(cellInputClass, 'min-w-[10rem]')}
                            value={line.descripcion}
                            onChange={(event) =>
                              handleUpdateLine(line.localId, {
                                descripcion: event.target.value,
                              })
                            }
                          aria-label="Descripción"
                          disabled={isReadOnly}
                        />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            className={cellInputClass}
                            value={line.unidad}
                            onChange={(event) =>
                              handleUpdateLine(line.localId, {
                                unidad: event.target.value,
                              })
                            }
                          aria-label="Unidad"
                          disabled={isReadOnly}
                        />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            className={cn(cellInputClass, 'text-right tabular-nums')}
                            type="number"
                            min="0"
                            step="any"
                            value={line.cantidad}
                            onChange={(event) =>
                              handleUpdateLine(line.localId, {
                                cantidad: Number(event.target.value) || 0,
                              })
                            }
                          aria-label="Cantidad"
                          disabled={isReadOnly}
                        />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            className={cn(cellInputClass, 'text-right tabular-nums')}
                            type="number"
                            min="0"
                            step="any"
                            value={line.costoUnitario}
                            onChange={(event) =>
                              handleUpdateLine(line.localId, {
                                costoUnitario: Number(event.target.value) || 0,
                              })
                            }
                          aria-label="Costo unitario"
                          disabled={isReadOnly}
                        />
                        </td>
                        <td className="px-2 py-2 text-right align-top tabular-nums text-brand-gray">
                          {formatCurrency(lineTotal)}
                        </td>
                        <td className="px-2 py-2 align-top">
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => handleRemoveLine(line.localId)}
                            disabled={isReadOnly}
                          >
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={7} className="p-0">
                          <ApuPanel
                            lineId={line.localId}
                            apu={line.apu}
                            onChange={(apu) => handleUpdateLine(line.localId, { apu })}
                            onApplySuggestedCost={(cost) =>
                              handleUpdateLine(line.localId, { costoUnitario: cost })
                            }
                            disabled={isReadOnly}
                          />
                        </td>
                      </tr>
                    </Fragment>
                  )
                })
              )}
            </tbody>
            {detalles.length > 0 && (
              <tfoot>
                <tr className="border-t border-brand-gray/20">
                  <td
                    colSpan={5}
                    className="px-2 py-3 text-left text-sm font-semibold text-brand-gray"
                  >
                    Subtotal referencial (solo UI)
                  </td>
                  <td className="px-2 py-3 text-right text-sm font-semibold tabular-nums text-brand-gray">
                    {formatCurrency(visualSubtotal)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {detalles.length > 0 && (
          <p className="text-xs text-brand-gray/70">
            Cada total de línea es cantidad × costo unitario, solo como referencia
            mientras edita. Subtotal, IVA y total general definitivos los recalcula el
            backend al guardar o exportar.
          </p>
        )}
      </Card>
    </Section>
  )
}
