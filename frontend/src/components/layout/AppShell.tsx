import { type ReactNode } from 'react'
import { AppHeader } from './AppHeader'
import { BottomNav } from './BottomNav'
import { SidebarNav } from './SidebarNav'

interface AppShellProps {
  children: ReactNode
}

/** Layout autenticado: sidebar (escritorio), header, contenido y barra inferior (móvil). */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <SidebarNav />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
