import { cn } from '../../lib/cn'

interface BrandLogoProps {
  className?: string
}

/** Placeholder de marca: curvas de nivel estilizadas hasta disponer del imagotipo oficial. */
export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn('h-10 w-10 shrink-0', className)}
    >
      <rect width="40" height="40" rx="6" fill="#550012" />
      <ellipse
        cx="20"
        cy="22"
        rx="14"
        ry="10"
        fill="none"
        stroke="#D07761"
        strokeWidth="1.5"
      />
      <ellipse
        cx="20"
        cy="22"
        rx="10"
        ry="7"
        fill="none"
        stroke="#D07761"
        strokeWidth="1.5"
      />
      <ellipse
        cx="20"
        cy="22"
        rx="6"
        ry="4"
        fill="none"
        stroke="#FF0033"
        strokeWidth="1.5"
      />
    </svg>
  )
}
