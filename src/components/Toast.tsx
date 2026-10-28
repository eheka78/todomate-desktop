import type { ToastState } from "../hooks/useToast";

type Props = { toast: ToastState | null; onDismiss: () => void };

export default function Toast({ toast, onDismiss }: Props) {
  if (!toast) return null;
  return (
    <div className="toast" role="status" key={toast.id}>
      <span>{toast.message}</span>
      {toast.action && (
        <button
          onClick={() => {
            toast.action?.run();
            onDismiss();
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}
