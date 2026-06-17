import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/** Contenedor con borde y sombra suave para agrupar bloques de contenido. */
export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-brand-gray/15 bg-white p-4 shadow-sm sm:p-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  title: string
  description?: string
  children: ReactNode
  action?: ReactNode
}

/** Sección con encabezado alineado a la izquierda y contenido opcional. */
export function Section({
  title,
  description,
  children,
  action,
  className,
  ...props
}: SectionProps) {
  return (
    <section className={cn('text-left', className)} {...props}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-subheading text-lg text-brand-wine">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-brand-gray/80">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  )
}
