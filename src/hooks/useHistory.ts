import { useCallback } from "react";
import type { GenerationMeta, HistoryEntry, PostFormData, PostVariant } from "../types";
import { MAX_HISTORY_ENTRIES, STORAGE_KEYS } from "../utils/constants";
import { createId } from "../utils/id";
import { useLocalStorage } from "./useLocalStorage";

export function useHistory() {
  const [entries, setEntries] = useLocalStorage<HistoryEntry[]>(STORAGE_KEYS.history, []);

  const add = useCallback(
    (form: PostFormData, variants: PostVariant[], meta: GenerationMeta) => {
      const entry: HistoryEntry = {
        id: createId(),
        createdAt: Date.now(),
        form,
        variants,
        meta,
      };
      setEntries((current) => [entry, ...current].slice(0, MAX_HISTORY_ENTRIES));
    },
    [setEntries],
  );

  const remove = useCallback(
    (id: string) => setEntries((current) => current.filter((entry) => entry.id !== id)),
    [setEntries],
  );

  const clear = useCallback(() => setEntries([]), [setEntries]);

  return { entries, add, remove, clear };
}
