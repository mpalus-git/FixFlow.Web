import { useEffect, useState } from "react";

export const searchDebounceMs = 300;

export function useDebouncedValue<T>(value: T, delayMs = searchDebounceMs): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);
    return () => {
      clearTimeout(timeout);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
