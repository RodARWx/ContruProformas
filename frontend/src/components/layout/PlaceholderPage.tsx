import { type ReactNode } from 'react'

interface PlaceholderPageProps {
  title: string
  description: string
  children?: ReactNode
}

/** Plantilla temporal para pantallas aún no implementadas. */
export function PlaceholderPage({
  title,
  description,
  children,
}: PlaceholderPageProps) {
  return (
    <div className="text-left">
      <header className="border-l-4 border-brand-coral pl-4">
        <h1 className="font-heading text-2xl uppercase text-brand-wine sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-gray/80">{description}</p>
      </header>
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}
