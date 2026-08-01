import type { GenerationMeta, PostFormData, PostVariant } from "../types";
import { PROVIDER_LABELS } from "../utils/constants";
import { formatCost } from "../utils/tokens";
import {
  downloadFile,
  timestampSlug,
  variantsToMarkdown,
  variantsToText,
} from "../utils/export";
import { Icon } from "./Icon";
import { Spinner } from "./Spinner";
import { VariantCard } from "./VariantCard";

interface ResultsPanelProps {
  form: PostFormData | null;
  variants: PostVariant[];
  meta: GenerationMeta | null;
  isGenerating: boolean;
  regeneratingId: string | null;
  onRegenerateOne: (id: string) => void;
  onRegenerateAll: () => void;
  onEditVariant: (id: string, text: string) => void;
  onCopied: (ok: boolean) => void;
}

export function ResultsPanel({
  form,
  variants,
  meta,
  isGenerating,
  regeneratingId,
  onRegenerateOne,
  onRegenerateAll,
  onEditVariant,
  onCopied,
}: ResultsPanelProps) {
  if (isGenerating && variants.length === 0) {
    return (
      <section className="results">
        <div className="results-head">
          <h2 className="section-title">Se scriu variantele</h2>
        </div>
        <div className="skeleton-grid">
          {[0, 1, 2].map((index) => (
            <div key={index} className="skeleton-card" style={{ animationDelay: `${index * 120}ms` }}>
              <span className="skeleton-line w40" />
              <span className="skeleton-line" />
              <span className="skeleton-line" />
              <span className="skeleton-line w70" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!form || variants.length === 0) {
    return (
      <section className="results">
        <div className="empty-state">
          <span className="empty-mark" aria-hidden="true">
            <Icon name="sparkles" size={26} />
          </span>
          <h2>Completează brief-ul din stânga</h2>
          <p>
            Cu cât descrii mai exact produsul și publicul, cu atât variantele sunt mai puțin
            generice. Modelul scrie doar pe baza a ce îi dai.
          </p>
        </div>
      </section>
    );
  }

  const handleExport = (format: "txt" | "md") => {
    const slug = timestampSlug();
    if (format === "txt") {
      downloadFile(`postari-${slug}.txt`, variantsToText(form, variants), "text/plain");
    } else {
      downloadFile(`postari-${slug}.md`, variantsToMarkdown(form, variants), "text/markdown");
    }
  };

  return (
    <section className="results">
      <div className="results-head">
        <div>
          <h2 className="section-title">
            {variants.length} variante · {form.product}
          </h2>
          {meta ? (
            <p className="results-meta mono">
              {PROVIDER_LABELS[meta.provider]} · {meta.model} ·{" "}
              {meta.usage.inputTokens + meta.usage.outputTokens} tok ·{" "}
              {formatCost(meta.estimatedCostUsd)} · {(meta.durationMs / 1000).toFixed(1)}s
            </p>
          ) : null}
        </div>

        <div className="results-actions">
          <button
            type="button"
            className="ghost-btn small"
            onClick={onRegenerateAll}
            disabled={isGenerating}
          >
            {isGenerating ? <Spinner size={15} /> : <Icon name="refresh" size={15} />}
            <span>Regenerează tot</span>
          </button>
          <button type="button" className="ghost-btn small" onClick={() => handleExport("txt")}>
            <Icon name="download" size={15} />
            <span>TXT</span>
          </button>
          <button type="button" className="ghost-btn small" onClick={() => handleExport("md")}>
            <Icon name="download" size={15} />
            <span>Markdown</span>
          </button>
        </div>
      </div>

      <div className="variant-grid">
        {variants.map((variant, index) => (
          <VariantCard
            key={variant.id}
            variant={variant}
            index={index}
            platform={form.platform}
            isRegenerating={regeneratingId === variant.id}
            onRegenerate={() => onRegenerateOne(variant.id)}
            onEdit={(text) => onEditVariant(variant.id, text)}
            onCopied={onCopied}
          />
        ))}
      </div>
    </section>
  );
}
