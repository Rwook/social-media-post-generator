import { useCallback, useState } from "react";
import { Header } from "../components/Header";
import { HistoryPanel } from "../components/HistoryPanel";
import { Modal } from "../components/Modal";
import { PostForm } from "../components/PostForm";
import { ResultsPanel } from "../components/ResultsPanel";
import { SettingsPanel } from "../components/SettingsPanel";
import { useGenerator } from "../hooks/useGenerator";
import { useHistory } from "../hooks/useHistory";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSettings } from "../hooks/useSettings";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";
import type { HistoryEntry, PostFormData } from "../types";
import { PROVIDER_LABELS, STORAGE_KEYS } from "../utils/constants";

const EMPTY_FORM: PostFormData = {
  product: "",
  description: "",
  theme: "",
  platform: "instagram",
  tone: "prietenos",
  audience: "",
  cta: "",
  variantCount: 3,
  length: "medie",
  emoji: true,
  hashtags: true,
  language: "ro",
  template: "liber",
};

export function GeneratorPage() {
  const { theme, toggle } = useTheme();
  const { notify } = useToast();
  const { settings, effectiveSettings, update, availableProviders, clearKeys } = useSettings();
  const history = useHistory();

  const [form, setForm] = useLocalStorage<PostFormData>(STORAGE_KEYS.lastForm, EMPTY_FORM);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const generator = useGenerator({ onGenerated: history.add });

  const requireKey = useCallback((): boolean => {
    if (availableProviders.length === 0) {
      notify("error", "Adaugă o cheie API înainte de a genera.", "Deschide Setări din antet.");
      setSettingsOpen(true);
      return false;
    }
    return true;
  }, [availableProviders.length, notify]);

  const handleGenerate = useCallback(() => {
    if (!requireKey()) return;
    void generator.generate(form, effectiveSettings);
  }, [requireKey, generator, form, effectiveSettings]);

  const handleRegenerateAll = useCallback(() => {
    if (!requireKey()) return;
    void generator.generate(generator.activeForm ?? form, effectiveSettings);
  }, [requireKey, generator, form, effectiveSettings]);

  const handleRegenerateOne = useCallback(
    (id: string) => {
      if (!requireKey()) return;
      void generator.regenerateOne(id, effectiveSettings);
    },
    [requireKey, generator, effectiveSettings],
  );

  const handleRestore = useCallback(
    (entry: HistoryEntry) => {
      setForm(entry.form);
      generator.loadFromHistory(entry.form, entry.variants, entry.meta);
      setHistoryOpen(false);
      notify("info", "Generare restaurată din istoric");
    },
    [generator, notify, setForm],
  );

  const handleCopied = useCallback(
    (ok: boolean) =>
      ok
        ? notify("success", "Postare copiată în clipboard")
        : notify("error", "Copierea a eșuat. Selectează textul și copiază manual."),
    [notify],
  );

  const providerLabel =
    availableProviders.length > 0 ? PROVIDER_LABELS[effectiveSettings.provider] : null;

  return (
    <div className="app-shell">
      <Header
        theme={theme}
        onToggleTheme={toggle}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        historyCount={history.entries.length}
        providerLabel={providerLabel}
      />

      <main className="layout">
        <aside className="panel form-panel">
          <PostForm
            value={form}
            onChange={setForm}
            onSubmit={handleGenerate}
            isGenerating={generator.isGenerating}
            providerId={effectiveSettings.provider}
            modelId={
              effectiveSettings.provider === "anthropic"
                ? effectiveSettings.anthropicModel
                : effectiveSettings.openaiModel
            }
          />
        </aside>

        <div className="panel results-panel">
          <ResultsPanel
            form={generator.activeForm}
            variants={generator.variants}
            meta={generator.meta}
            isGenerating={generator.isGenerating}
            regeneratingId={generator.regeneratingId}
            onRegenerateOne={handleRegenerateOne}
            onRegenerateAll={handleRegenerateAll}
            onEditVariant={generator.updateVariantText}
            onCopied={handleCopied}
          />
        </div>
      </main>

      <Modal title="Setări" open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <SettingsPanel
          settings={settings}
          availableProviders={availableProviders}
          onUpdate={update}
          onClearKeys={() => {
            clearKeys();
            notify("info", "Cheile au fost șterse de pe acest dispozitiv");
          }}
        />
      </Modal>

      <Modal title="Istoric generări" open={historyOpen} onClose={() => setHistoryOpen(false)}>
        <HistoryPanel
          entries={history.entries}
          onRestore={handleRestore}
          onRemove={history.remove}
          onClear={() => {
            history.clear();
            notify("info", "Istoricul a fost golit");
          }}
        />
      </Modal>
    </div>
  );
}
