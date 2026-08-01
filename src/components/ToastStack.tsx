import { Icon } from "./Icon";
import type { IconName } from "./Icon";
import { useToast } from "../hooks/useToast";
import type { ToastKind } from "../hooks/useToast";

const ICONS: Record<ToastKind, IconName> = {
  success: "check",
  error: "alert",
  info: "info",
};

export function ToastStack() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="toast-stack" aria-live="assertive">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.kind}`} role="status">
          <Icon name={ICONS[toast.kind]} size={17} />
          <div className="toast-body">
            <p className="toast-message">{toast.message}</p>
            {toast.detail ? <p className="toast-detail">{toast.detail}</p> : null}
          </div>
          <button
            type="button"
            className="icon-btn toast-close"
            onClick={() => dismiss(toast.id)}
            aria-label="Închide notificarea"
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
