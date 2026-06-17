import { type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface TableColumn<T> {
  key: string
  header: string
  /** Si true, alinea el contenido de la columna a la derecha (valores numéricos). */
  numeric?: boolean
  render?: (row: T, rowIndex: number) => ReactNode
  accessor?: keyof T
}

export interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  emptyMessage?: string
  caption?: string
  className?: string
  getRowKey?: (row: T, index: number) => string | number
}

function getCellValue<T extends object>(row: T, column: TableColumn<T>): ReactNode {
  if (column.render) {
    return column.render(row, 0)
  }

  if (column.accessor) {
    const value = row[column.accessor as keyof T]
    return value == null ? '' : String(value)
  }

  return ''
}

/** Tabla sobria: sin colores de fondo en filas; columnas numéricas alineadas a la derecha. */
export function Table<T extends object>({
  columns,
  data,
  emptyMessage = 'No hay registros para mostrar.',
  caption,
  className,
  getRowKey,
}: TableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto text-left', className)}>
      <table className="w-full min-w-[32rem] border-collapse text-sm">
        {caption && (
          <caption className="mb-2 text-left text-sm font-semibold text-brand-gray">
            {caption}
          </caption>
        )}
        <thead>
          <tr className="border-b border-brand-gray/20">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-brand-gray/80',
                  column.numeric && 'text-right',
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-6 text-left text-brand-gray/70"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={getRowKey?.(row, rowIndex) ?? rowIndex}
                className="border-b border-brand-gray/10"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-3 py-2.5 text-left text-brand-gray',
                      column.numeric && 'text-right tabular-nums',
                    )}
                  >
                    {column.render
                      ? column.render(row, rowIndex)
                      : getCellValue(row, column)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
