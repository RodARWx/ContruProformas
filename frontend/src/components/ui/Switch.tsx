import { type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  hint?: string
}

export function Switch({
  label,
  hint,
  id,
  className,
  checked,
  ...props
}: SwitchProps) {
  const inputId = id ?? label.replace(/\s+/g, '-').toLowerCase()

  return (
    <div className={cn('text-left', className)}>
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-start gap-3"
      >
        <span className="relative mt-0.5 inline-flex h-6 w-11 shrink-0">
          <input
            id={inputId}
            type="checkbox"
            role="switch"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-0 rounded-full transition-colors',
              'bg-brand-gray/25 peer-checked:bg-brand-coral',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-coral/40 peer-focus-visible:ring-offset-2',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
              'peer-checked:translate-x-5',
            )}
          />
        </span>
        <span>
          <span className="block text-sm font-semibold text-brand-gray">
            {label}
          </span>
          {hint && (
            <span className="mt-0.5 block text-xs text-brand-gray/70">
              {hint}
            </span>
          )}
        </span>
      </label>
    </div>
  )
}
