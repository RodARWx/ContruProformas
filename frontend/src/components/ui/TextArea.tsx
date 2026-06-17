import { forwardRef, type TextareaHTMLAttributes, useId } from 'react'
import { cn } from '../../lib/cn'
import { FieldWrapper, fieldClassName } from './FieldWrapper'

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string
  error?: string
  hint?: string
  id?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    { label, error, hint, id: idProp, className, required, rows = 4, ...props },
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
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            fieldClassName(Boolean(error)),
            'min-h-[6rem] resize-y',
            className,
          )}
          {...props}
        />
      </FieldWrapper>
    )
  },
)
