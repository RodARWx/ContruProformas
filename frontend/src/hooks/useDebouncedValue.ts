import { useEffect, useState } from 'react'

const DEFAULT_DELAY_MS = 300

/** Retorna el valor solo después de un período sin cambios (debounce). */
export function useDebouncedValue<T>(value: T, delayMs = DEFAULT_DELAY_MS): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [value, delayMs])

  return debouncedValue
}
