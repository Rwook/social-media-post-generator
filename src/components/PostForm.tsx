import { useMemo, useState } from "react";
import { buildGenerationPrompt } from "../prompts/buildPrompt";
import type { Length, LanguageCode, Platform, PostFormData, TemplateId, Tone } from "../types";
import {
  LANGUAGES,
  LENGTHS,
  MODELS,
  PLATFORMS,
  TEMPLATES,
  TONES,
} from "../utils/constants";
import { estimateTokens, formatCost } from "../utils/tokens";
import { Icon } from "./Icon";
import { Spinner } from "./Spinner";

interface PostFormProps {
  value: PostFormData;
  onChange: (next: PostFormData) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  providerId: "anthropic" | "openai";
  modelId: string;
}

type FieldErrors = Partial<Record<keyof PostFormData, string>>;

function validate(form: PostFormData): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.product.trim()) errors.product = "Scrie ce produs sau serviciu promovezi.";
  if (!form.description.trim())
    errors.description = "Descrie produsul — modelul nu are voie să inventeze detalii.";
  if (!form.theme.trim()) errors.theme = "Adaugă tema postării.";
  if (!form.audience.trim()) errors.audience = "Precizează cui i te adresezi.";
  if (!form.cta.trim()) errors.cta = "Adaugă acțiunea pe care o aștepți de la cititor.";
  return errors;
}

export function PostForm({
  value,
  onChange,
  onSubmit,
  isGenerating,
  providerId,
  modelId,
}: PostFormProps) {
  const [touched, setTouched] = useState(false);
  const errors = useMemo(() => validate(value), [value]);
  const hasErrors = Object.keys(errors).length > 0;

  const estimate = useMemo(() => {
    const { system, user } = buildGenerationPrompt(value);
    const inputTokens = estimateTokens(system + user);
    const outputTokens = value.variantCount * 260;
    const model = MODELS[providerId].find((m) => m.id === modelId);
    const cost = model
      ? (inputTokens / 1_000_000) * model.inputPricePerMTok +
        (outputTokens / 1_000_000) * model.outputPricePerMTok
      : 0;
    return { inputTokens, outputTokens, cost };
  }, [value, providerId, modelId]);

  const set = <K extends keyof PostFormData>(key: K, next: PostFormData[K]) =>
    onChange({ ...value, [key]: next });

  const handleSubmit = () => {
    setTouched(true);
    if (hasErrors) return;
    onSubmit();
  };

  const showError = (key: keyof PostFormData) => (touched ? errors[key] : undefined);

  return (
    <form
      className="brief-form"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <div className="form-section">
        <h2 className="section-title">Brief</h2>

        <label className="field">
          <span className="field-label">Produs / serviciu</span>
          <input
            className={showError("product") ? "input invalid" : "input"}
            value={value.product}
            placeholder="Ghiozdan ergonomic Nomad 22L"
            onChange={(event) => set("product", event.target.value)}
          />
          {showError("product") ? <span className="field-error">{errors.product}</span> : null}
        </label>

        <label className="field">
          <span className="field-label">Descriere produs</span>
          <textarea
            className={showError("description") ? "input textarea invalid" : "input textarea"}
            rows={4}
            value={value.description}
            placeholder="Spate ventilat, 22 litri, buzunar separat pentru laptop de 16 inch, material reciclat, garanție 3 ani."
            onChange={(event) => set("description", event.target.value)}
          />
          <span className="field-help">
            Tot ce scrii aici devine singura sursă de adevăr pentru model.
          </span>
          {showError("description") ? (
            <span className="field-error">{errors.description}</span>
          ) : null}
        </label>

        <label className="field">
          <span className="field-label">Tema postării</span>
          <input
            className={showError("theme") ? "input invalid" : "input"}
            value={value.theme}
            placeholder="Pregătirea pentru începutul anului universitar"
            onChange={(event) => set("theme", event.target.value)}
          />
          {showError("theme") ? <span className="field-error">{errors.theme}</span> : null}
        </label>

        <label className="field">
          <span className="field-label">Public țintă</span>
          <input
            className={showError("audience") ? "input invalid" : "input"}
            value={value.audience}
            placeholder="Studenți 19–25 de ani, care fac naveta zilnic"
            onChange={(event) => set("audience", event.target.value)}
          />
          {showError("audience") ? <span className="field-error">{errors.audience}</span> : null}
        </label>

        <label className="field">
          <span className="field-label">Call to action</span>
          <input
            className={showError("cta") ? "input invalid" : "input"}
            value={value.cta}
            placeholder="Comandă acum din link-ul din bio"
            onChange={(event) => set("cta", event.target.value)}
          />
          {showError("cta") ? <span className="field-error">{errors.cta}</span> : null}
        </label>
      </div>

      <div className="form-section">
        <h2 className="section-title">Format</h2>

        <div className="field">
          <span className="field-label">Platformă</span>
          <div className="chip-row">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                type="button"
                className={value.platform === platform.id ? "chip active" : "chip"}
                onClick={() => set("platform", platform.id as Platform)}
              >
                {platform.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label">Ton</span>
          <div className="chip-row">
            {TONES.map((tone) => (
              <button
                key={tone.id}
                type="button"
                className={value.tone === tone.id ? "chip active" : "chip"}
                onClick={() => set("tone", tone.id as Tone)}
                title={tone.guidance}
              >
                {tone.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field-grid">
          <label className="field">
            <span className="field-label">Șablon</span>
            <select
              className="input"
              value={value.template}
              onChange={(event) => set("template", event.target.value as TemplateId)}
            >
              {TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Limbă</span>
            <select
              className="input"
              value={value.language}
              onChange={(event) => set("language", event.target.value as LanguageCode)}
            >
              {LANGUAGES.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="field">
          <span className="field-label">Lungime</span>
          <div className="segmented">
            {LENGTHS.map((length) => (
              <button
                key={length.id}
                type="button"
                className={value.length === length.id ? "segment active" : "segment"}
                onClick={() => set("length", length.id as Length)}
              >
                {length.label}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span className="field-label">
            Număr variante <span className="mono">{value.variantCount}</span>
          </span>
          <input
            type="range"
            min={3}
            max={5}
            step={1}
            className="range"
            value={value.variantCount}
            onChange={(event) => set("variantCount", Number(event.target.value))}
          />
        </label>

        <div className="toggle-row">
          <label className="toggle">
            <input
              type="checkbox"
              checked={value.emoji}
              onChange={(event) => set("emoji", event.target.checked)}
            />
            <span>Emoji</span>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={value.hashtags}
              onChange={(event) => set("hashtags", event.target.checked)}
            />
            <span>Hashtag-uri</span>
          </label>
        </div>
      </div>

      <div className="form-footer">
        <div className="estimate mono">
          ~{estimate.inputTokens + estimate.outputTokens} tokenuri · {formatCost(estimate.cost)}
        </div>
        <button type="submit" className="primary-btn" disabled={isGenerating}>
          {isGenerating ? (
            <Spinner size={16} label="Se generează…" />
          ) : (
            <>
              <Icon name="sparkles" size={17} />
              <span>Generează</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
