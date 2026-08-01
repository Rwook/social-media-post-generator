import { useCallback, useMemo } from "react";
import type { ProviderId, ProviderSettings } from "../types";
import { MODELS, STORAGE_KEYS } from "../utils/constants";
import { useLocalStorage } from "./useLocalStorage";

const DEFAULT_SETTINGS: ProviderSettings = {
  anthropicKey: "",
  openaiKey: "",
  provider: "anthropic",
  anthropicModel: MODELS.anthropic[0].id,
  openaiModel: MODELS.openai[0].id,
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<ProviderSettings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS,
  );

  const update = useCallback(
    <K extends keyof ProviderSettings>(key: K, value: ProviderSettings[K]) => {
      setSettings((current) => ({ ...current, [key]: value }));
    },
    [setSettings],
  );

  const availableProviders = useMemo<ProviderId[]>(() => {
    const list: ProviderId[] = [];
    if (settings.anthropicKey.trim()) list.push("anthropic");
    if (settings.openaiKey.trim()) list.push("openai");
    return list;
  }, [settings.anthropicKey, settings.openaiKey]);

  /** Provider actually used for the next request: the selected one if keyed, otherwise the first keyed one. */
  const effectiveSettings = useMemo<ProviderSettings>(() => {
    const selectedHasKey =
      settings.provider === "anthropic"
        ? Boolean(settings.anthropicKey.trim())
        : Boolean(settings.openaiKey.trim());

    if (selectedHasKey || availableProviders.length === 0) return settings;
    return { ...settings, provider: availableProviders[0] };
  }, [settings, availableProviders]);

  const clearKeys = useCallback(() => {
    setSettings((current) => ({ ...current, anthropicKey: "", openaiKey: "" }));
  }, [setSettings]);

  return { settings, effectiveSettings, update, availableProviders, clearKeys };
}
