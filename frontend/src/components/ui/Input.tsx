import { forwardRef, type InputHTMLAttributes, useId } from 'react'
import { cn } from '../../lib/cn'
import { FieldWrapper, fieldClassName } from './FieldWrapper'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  error?: string
  hint?: string
  id?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id: idProp, className, required, ...props },
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
      <input
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(fieldClassName(Boolean(error)), className)}
        {...props}
      />
    </FieldWrapper>
  )
})
