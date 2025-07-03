import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      
      try {
        return JSON.parse(item);
      } catch (parseError) {
        // If JSON.parse fails, check if initialValue is a primitive type
        // If so, assume the stored item is the raw primitive value
        if (typeof initialValue === 'string' || 
            typeof initialValue === 'number' || 
            typeof initialValue === 'boolean') {
          return item as T;
        }
        // If initialValue is not a primitive, we can't safely assume the format
        throw parseError;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      // Clear the malformed data to prevent recurring errors
      window.localStorage.removeItem(key);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}