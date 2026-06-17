import { type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface FieldWrapperProps {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}

/** Contenedor común para campos de formulario con label y mensaje de error. */
export function FieldWrapper({
  id,
  label,
  error,
  hint,
  required,
  children,
  className,
}: FieldWrapperProps) {
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint ? `${id}-hint` : undefined

  return (
    <div className={cn('text-left', className)}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-brand-gray"
      >
        {label}
        {required && <span className="ml-0.5 text-brand-red">*</span>}
      </label>

      {children}

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-brand-gray/70">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-brand-red" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

const fieldBaseClass =
  'w-full rounded-md border bg-white px-3 py-2.5 text-left text-sm text-brand-gray placeholder:text-brand-gray/45 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-brand-gray/5 disabled:opacity-60'

export function fieldClassName(hasError?: boolean, className?: string): string {
  return cn(
    fieldBaseClass,
    hasError
      ? 'border-brand-red focus:border-brand-red focus:ring-brand-red/30'
      : 'border-brand-gray/20 focus:border-brand-coral focus:ring-brand-coral/30',
    className,
  )
}
