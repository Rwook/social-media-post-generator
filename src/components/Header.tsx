import type { Theme } from "../types";
import { Icon } from "./Icon";

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  providerLabel: string | null;
}

export function Header({
  theme,
  onToggleTheme,
  onOpenSettings,
  onOpenHistory,
  historyCount,
  providerLabel,
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <Icon name="sparkles" size={20} />
        </span>
        <div>
          <h1 className="brand-title">Social Media Post Generator</h1>
          <p className="brand-sub">
            {providerLabel ? `Conectat la ${providerLabel}` : "Nicio cheie API configurată"}
          </p>
        </div>
      </div>

      <nav className="header-actions">
        <button type="button" className="ghost-btn" onClick={onOpenHistory}>
          <Icon name="history" size={16} />
          <span>Istoric</span>
          {historyCount > 0 ? <span className="pill-count">{historyCount}</span> : null}
        </button>
        <button type="button" className="ghost-btn" onClick={onOpenSettings}>
          <Icon name="settings" size={16} />
          <span>Setări</span>
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Comută pe tema deschisă" : "Comută pe tema închisă"}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} size={17} />
        </button>
      </nav>
    </header>
  );
}
