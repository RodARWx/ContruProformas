import { type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-coral text-white hover:bg-brand-coral/90 focus-visible:ring-brand-coral',
  secondary:
    'border border-brand-gray/25 bg-white text-brand-gray hover:bg-brand-gray/5 focus-visible:ring-brand-gray',
  danger:
    'bg-brand-red text-white hover:bg-brand-red/90 focus-visible:ring-brand-red',
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className,
  type = 'button',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2.5 text-left text-sm font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        fullWidth && 'w-full',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
