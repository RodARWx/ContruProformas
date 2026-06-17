import { Button, Card, Section } from '../../components/ui'
import { cn } from '../../lib/cn'
import { formatCurrency } from '../../lib/format'
import type { ImportPreviewDetail, ImportRubroPayload } from '../../types/import'

export interface ImportEditableLine extends ImportPreviewDetail {
  localId: string
}

const cellInputClass = cn(
  'w-full min-w-[5rem] rounded border border-brand-gray/20 bg-white px-2 py-1.5',
  'text-left text-sm text-brand-gray focus:border-brand-coral focus:outline-none focus:ring-1 focus:ring-brand-coral/30',
)

interface ImportProformaDetailTableProps {
  lines: ImportEditableLine[]
  onChange: (localId: string, patch: Partial<ImportEditableLine>) => void
  onAddLine: () => void
  onRemoveLine: (localId: string) => void
}

export function previewDetailsToEditableLines(
  detalles: ImportPreviewDetail[],
): ImportEditableLine[] {
  return detalles.map((line) => ({
    ...line,
    localId: crypto.randomUUID(),
  }))
}

export function editableLinesToRubros(
  lines: ImportEditableLine[],
): ImportRubroPayload[] {
  return lines.map(({ localId: _localId, total: _total, ...rubro }) => rubro)
}

export function ImportProformaDetailTable({
  lines,
  onChange,
  onAddLine,
  onRemoveLine,
}: ImportProformaDetailTableProps) {
  return (
    <Section
      title="Rubros importados"
      description="Revise y edite las líneas antes de guardar. Los totales se actualizan con el servidor."
    >
      <Card className="space-y-4">
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={onAddLine}>
            Agregar línea
          </Button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[48rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-brand-gray/20">
                {[
                  'Código',
                  'Descripción',
                  'Tiempo',
                  'Unidad',
                  'Cantidad',
                  'Costo unit.',
                  'Total',
                  '',
                ].map((header) => (
                  <th
                    key={header || 'actions'}
                    className={cn(
                      'px-2 py-2 text-xs font-semibold uppercase text-brand-gray/70',
                      header && ['Cantidad', 'Costo unit.', 'Total'].includes(header)
                        ? 'text-right'
                        : 'text-left',
                    )}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.localId} className="border-b border-brand-gray/10">
                  <td className="px-2 py-2">
                    <input
                      className={cellInputClass}
                      value={line.codigo ?? ''}
                      onChange={(event) =>
                        onChange(line.localId, {
                          codigo: event.target.value || undefined,
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      className={cellInputClass}
                      value={line.descripcion}
                      onChange={(event) =>
                        onChange(line.localId, { descripcion: event.target.value })
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      className={cellInputClass}
                      value={line.tiempo ?? ''}
                      onChange={(event) =>
                        onChange(line.localId, {
                          tiempo: event.target.value || undefined,
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      className={cellInputClass}
                      value={line.unidad}
                      onChange={(event) =>
                        onChange(line.localId, { unidad: event.target.value })
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      className={cn(cellInputClass, 'text-right tabular-nums')}
                      value={line.cantidad}
                      onChange={(event) =>
                        onChange(line.localId, {
                          cantidad: Number(event.target.value),
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      className={cn(cellInputClass, 'text-right tabular-nums')}
                      value={line.costoUnitario}
                      onChange={(event) =>
                        onChange(line.localId, {
                          costoUnitario: Number(event.target.value),
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-brand-gray">
                    {formatCurrency(line.total)}
                  </td>
                  <td className="px-2 py-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onRemoveLine(line.localId)}
                      disabled={lines.length <= 1}
                    >
                      Quitar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Section>
  )
}
