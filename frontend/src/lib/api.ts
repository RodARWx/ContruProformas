import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'

const API_KEY = import.meta.env.VITE_API_KEY ?? ''

/** Cliente HTTP centralizado para la API de Construproformas. */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY ? { 'X-API-KEY': API_KEY } : {}),
  },
})

/** Petición GET tipada sobre el cliente configurado. */
export async function apiGet<T>(
  path: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.get<T>(path, config)
  return response.data
}

/** Petición POST tipada sobre el cliente configurado. */
export async function apiPost<T>(
  path: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.post<T>(path, body, config)
  return response.data
}

/** Petición PATCH tipada sobre el cliente configurado. */
export async function apiPatch<T>(
  path: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.patch<T>(path, body, config)
  return response.data
}

/** Petición DELETE tipada sobre el cliente configurado. */
export async function apiDelete<T>(
  path: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.delete<T>(path, config)
  return response.data
}

/** Extrae un mensaje legible desde errores de axios o genéricos. */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined
    if (Array.isArray(data?.message)) {
      return data.message.join(', ')
    }
    if (typeof data?.message === 'string') {
      return data.message
    }
    if (error.message) {
      return error.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Error desconocido al conectar con el backend'
}

/** Indica si el error es un conflicto HTTP 409 del backend. */
export function isApiConflict(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 409
}
