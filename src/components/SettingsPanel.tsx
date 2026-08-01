import type { ProviderId, ProviderSettings } from "../types";
import { MODELS, PROVIDER_LABELS } from "../utils/constants";
import { Icon } from "./Icon";

interface SettingsPanelProps {
  settings: ProviderSettings;
  availableProviders: ProviderId[];
  onUpdate: <K extends keyof ProviderSettings>(key: K, value: ProviderSettings[K]) => void;
  onClearKeys: () => void;
}

export function SettingsPanel({
  settings,
  availableProviders,
  onUpdate,
  onClearKeys,
}: SettingsPanelProps) {
  const bothAvailable = availableProviders.length === 2;

  return (
    <div className="settings">
      <p className="settings-note">
        <Icon name="key" size={15} />
        <span>
          Cheile rămân în localStorage, pe acest dispozitiv, și sunt trimise direct către provider.
          Folosește chei personale, cu limită de cheltuială setată, și nu deschide aplicația pe un
          calculator public.
        </span>
      </p>

      <label className="field">
        <span className="field-label">Cheie Anthropic (Claude)</span>
        <input
          type="password"
          className="input"
          placeholder="sk-ant-..."
          value={settings.anthropicKey}
          autoComplete="off"
          onChange={(event) => onUpdate("anthropicKey", event.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">Model Claude</span>
        <select
          className="input"
          value={settings.anthropicModel}
          onChange={(event) => onUpdate("anthropicModel", event.target.value)}
        >
          {MODELS.anthropic.map((model) => (
            <option key={model.id} value={model.id}>
              {model.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field-label">Cheie OpenAI</span>
        <input
          type="password"
          className="input"
          placeholder="sk-..."
          value={settings.openaiKey}
          autoComplete="off"
          onChange={(event) => onUpdate("openaiKey", event.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">Model OpenAI</span>
        <select
          className="input"
          value={settings.openaiModel}
          onChange={(event) => onUpdate("openaiModel", event.target.value)}
        >
          {MODELS.openai.map((model) => (
            <option key={model.id} value={model.id}>
              {model.label}
            </option>
          ))}
        </select>
      </label>

      {bothAvailable ? (
        <div className="field">
          <span className="field-label">Provider folosit la generare</span>
          <div className="segmented">
            {(["anthropic", "openai"] as ProviderId[]).map((id) => (
              <button
                key={id}
                type="button"
                className={settings.provider === id ? "segment active" : "segment"}
                onClick={() => onUpdate("provider", id)}
              >
                {PROVIDER_LABELS[id]}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="hint">
          {availableProviders.length === 1
            ? `Se folosește automat ${PROVIDER_LABELS[availableProviders[0]]}. Adaugă și a doua cheie pentru a putea alege între modele.`
            : "Adaugă cel puțin o cheie pentru a putea genera postări."}
        </p>
      )}

      <button type="button" className="ghost-btn danger" onClick={onClearKeys}>
        <Icon name="trash" size={16} />
        <span>Șterge cheile salvate</span>
      </button>
    </div>
  );
}
