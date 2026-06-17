import { forwardRef, type SelectHTMLAttributes, useId } from 'react'
import { cn } from '../../lib/cn'
import { FieldWrapper, fieldClassName } from './FieldWrapper'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string
  options: SelectOption[]
  error?: string
  hint?: string
  id?: string
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    options,
    error,
    hint,
    id: idProp,
    className,
    required,
    placeholder,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const errorId = error ? `${id}-error` : undefined

  return (
    <FieldWrapper
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
    >
      <select
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(fieldClassName(Boolean(error)), className)}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
})
