import { useEffect, useState } from 'react'
import { apiGet, getApiErrorMessage } from '../lib/api'
import type { HealthResponse } from '../types/api'

type HealthStatus = 'loading' | 'connected' | 'error'

interface UseHealthCheckResult {
  status: HealthStatus
  message: string
  data: HealthResponse | null
}

/** Consulta GET /health al montar el componente. */
export function useHealthCheck(): UseHealthCheckResult {
  const [status, setStatus] = useState<HealthStatus>('loading')
  const [message, setMessage] = useState('Comprobando conexión con el backend…')
  const [data, setData] = useState<HealthResponse | null>(null)

  useEffect(() => {
    let cancelled = false

    async function checkHealth() {
      try {
        const response = await apiGet<HealthResponse>('/health')
        if (cancelled) return

        setData(response)
        setStatus('connected')
        setMessage('Backend conectado')
      } catch (error) {
        if (cancelled) return

        setData(null)
        setStatus('error')
        setMessage(getApiErrorMessage(error))
      }
    }

    void checkHealth()

    return () => {
      cancelled = true
    }
  }, [])

  return { status, message, data }
}
