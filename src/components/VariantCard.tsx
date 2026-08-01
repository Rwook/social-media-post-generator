import { useEffect, useRef, useState } from "react";
import type { Platform, PostVariant } from "../types";
import { PLATFORM_MAP } from "../utils/constants";
import { copyToClipboard } from "../utils/clipboard";
import { Icon } from "./Icon";
import { Spinner } from "./Spinner";

interface VariantCardProps {
  variant: PostVariant;
  index: number;
  platform: Platform;
  isRegenerating: boolean;
  onRegenerate: () => void;
  onEdit: (text: string) => void;
  onCopied: (ok: boolean) => void;
}

export function VariantCard({
  variant,
  index,
  platform,
  isRegenerating,
  onRegenerate,
  onEdit,
  onCopied,
}: VariantCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const meta = PLATFORM_MAP[platform];
  const fullText = variant.hashtags.length
    ? `${variant.text}\n\n${variant.hashtags.join(" ")}`
    : variant.text;

  const used = fullText.length;
  const ratio = Math.min(used / meta.charLimit, 1);
  const state = used > meta.charLimit ? "over" : ratio > 0.85 ? "near" : "ok";

  useEffect(() => {
    if (isEditing) textareaRef.current?.focus();
  }, [isEditing]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(fullText);
    onCopied(ok);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <article className="variant-card" style={{ animationDelay: `${index * 60}ms` }}>
      <header className="variant-head">
        <span className="variant-index mono">Varianta {index + 1}</span>
        <div className="variant-tools">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setIsEditing((current) => !current)}
            aria-label={isEditing ? "Termină editarea" : "Editează varianta"}
            title={isEditing ? "Termină editarea" : "Editează"}
          >
            <Icon name={isEditing ? "check" : "edit"} size={16} />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={onRegenerate}
            disabled={isRegenerating}
            aria-label="Regenerează această variantă"
            title="Regenerează această variantă"
          >
            {isRegenerating ? <Spinner size={15} /> : <Icon name="refresh" size={16} />}
          </button>
          <button type="button" className="ghost-btn small" onClick={handleCopy}>
            <Icon name={copied ? "check" : "copy"} size={15} />
            <span>{copied ? "Copiat" : "Copiază"}</span>
          </button>
        </div>
      </header>

      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="input textarea variant-editor"
          rows={7}
          value={variant.text}
          onChange={(event) => onEdit(event.target.value)}
        />
      ) : (
        <p className="variant-text">{variant.text}</p>
      )}

      {variant.hashtags.length > 0 ? (
        <p className="variant-hashtags">{variant.hashtags.join(" ")}</p>
      ) : null}

      <footer className="variant-foot">
        <div className={`meter meter-${state}`}>
          <div className="meter-track">
            <div className="meter-fill" style={{ width: `${ratio * 100}%` }} />
          </div>
          <span className="meter-label mono">
            {used} / {meta.charLimit} car. · {meta.label}
          </span>
        </div>
      </footer>
    </article>
  );
}
