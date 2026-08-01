import { useCallback, useEffect, useState } from "react";
import { readStorage, writeStorage } from "../services/storage";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readStorage(key, initial));

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  const reset = useCallback(() => setValue(initial), [initial]);

  return [value, setValue, reset] as const;
}
