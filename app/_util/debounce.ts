import { useEffect, useState } from 'react'

/**
 * Debounce a value. Useful for input fields. For example, if you want to
 * debounce a search input, you can use this hook to only search after the user
 * has stopped typing for a certain amount of time.
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 * @example
 * ```
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebounce(search, 500)
 * const result = api.$use('search', debouncedSearch)
 * ```
 */
export default function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
