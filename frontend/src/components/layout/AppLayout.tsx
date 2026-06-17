import { type ReactNode } from 'react'
import { AppHeader } from './AppHeader'

interface AppLayoutProps {
  children: ReactNode
}

/** Layout general: header fijo de marca y contenedor responsivo para el contenido. */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
