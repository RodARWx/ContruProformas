import { useHealthCheck } from '../hooks/useHealthCheck'

export function HealthCheckPage() {
  const { status, message, data } = useHealthCheck()

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 border-l-4 border-brand-coral pl-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-wine">
            Construproformas
          </p>
          <h1 className="mt-1 text-2xl font-bold text-brand-gray">
            Prueba de conexión
          </h1>
          <p className="mt-2 text-sm text-brand-gray/80">
            Verificación del endpoint <code className="text-brand-red">GET /health</code>
          </p>
        </header>

        <section
          className="rounded-lg border border-brand-gray/15 bg-white p-6 shadow-sm"
          aria-live="polite"
        >
          {status === 'loading' && (
            <p className="text-left text-brand-gray">Comprobando conexión…</p>
          )}

          {status === 'connected' && (
            <div className="text-left">
              <p className="text-lg font-semibold text-brand-wine">{message}</p>
              {data && (
                <dl className="mt-4 space-y-2 text-sm text-brand-gray">
                  <div>
                    <dt className="font-medium">Estado</dt>
                    <dd>{data.status}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Servicio</dt>
                    <dd>{data.service}</dd>
                  </div>
                </dl>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="text-left">
              <p className="text-lg font-semibold text-brand-red">
                No se pudo conectar con el backend
              </p>
              <p className="mt-2 text-sm text-brand-gray">{message}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
