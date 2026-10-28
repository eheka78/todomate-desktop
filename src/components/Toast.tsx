import type { ToastState } from "../hooks/useToast";

type Props = { toast: ToastState | null; onDismiss: () => void };

export default function Toast({ toast, onDismiss }: Props) {
  if (!toast) return null;
  return (
    <div
      className={`toast${toast.error ? " error" : ""}`}
      role={toast.error ? "alert" : "status"}
      key={toast.id}
    >
      {toast.error && (
        <span className="toast-mark" aria-hidden>
          !
        </span>
      )}
      <span>{toast.message}</span>
      {toast.action && (
        <button
          onClick={() => {
            toast.action?.run();
            onDismiss();
          }}
        >
          {toast.action.label} ↺
        </button>
      )}
    </div>
  );
}
