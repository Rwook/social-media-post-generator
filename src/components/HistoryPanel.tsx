import type { HistoryEntry } from "../types";
import { PLATFORM_MAP } from "../utils/constants";
import { Icon } from "./Icon";

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("ro-RO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryPanel({ entries, onRestore, onRemove, onClear }: HistoryPanelProps) {
  if (entries.length === 0) {
    return (
      <p className="hint">
        Aici ajung ultimele generări, salvate local în browser. Generează o primă serie de postări
        ca să apară.
      </p>
    );
  }

  return (
    <div className="history">
      <ul className="history-list">
        {entries.map((entry) => (
          <li key={entry.id} className="history-item">
            <button type="button" className="history-main" onClick={() => onRestore(entry)}>
              <span className="history-title">{entry.form.product}</span>
              <span className="history-sub mono">
                {formatDate(entry.createdAt)} · {PLATFORM_MAP[entry.form.platform].label} ·{" "}
                {entry.variants.length} variante
              </span>
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => onRemove(entry.id)}
              aria-label="Șterge din istoric"
            >
              <Icon name="trash" size={15} />
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="ghost-btn danger" onClick={onClear}>
        <Icon name="trash" size={16} />
        <span>Golește istoricul</span>
      </button>
    </div>
  );
}
