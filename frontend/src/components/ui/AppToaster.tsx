import { Toaster } from 'sonner'

/** Proveedor global de toasts, montado una sola vez en main.tsx. */
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'text-left font-body',
          title: 'font-subheading text-brand-gray',
          description: 'text-brand-gray/80',
        },
      }}
    />
  )
}
