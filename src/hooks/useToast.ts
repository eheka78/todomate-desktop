import { useCallback, useEffect, useRef, useState } from "react";

export type ToastState = {
  id: number;
  message: string;
  error?: boolean;
  action?: { label: string; run: () => void };
};

export const TOAST_MS = 5000;

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const dismiss = useCallback(() => {
    window.clearTimeout(timer.current);
    setToast(null);
  }, []);

  const open = useCallback((next: Omit<ToastState, "id">) => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), ...next });
    timer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const show = useCallback(
    (message: string, action?: ToastState["action"]) =>
      open({ message, action }),
    [open],
  );

  const showError = useCallback(
    (message: string) => open({ message, error: true }),
    [open],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { toast, show, showError, dismiss };
}
