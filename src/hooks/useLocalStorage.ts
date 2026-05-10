import { useState, useEffect, useCallback } from 'react'

/**
 * A custom hook that synchronizes a state with localStorage.
 * 
 * @param key The localStorage key
 * @param defaultValue The initial value if no value is found in localStorage
 * @returns [state, setState]
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Get initial value from localStorage or defaultValue
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  })

  // Update localStorage when state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, state])

  // Custom setter to handle functional updates
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setState(prev => {
      const next = value instanceof Function ? value(prev) : value
      return next
    })
  }, [])

  return [state, setValue]
}
