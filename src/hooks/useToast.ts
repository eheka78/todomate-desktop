import { useCallback, useEffect, useRef, useState } from "react";

export type ToastState = {
  id: number;
  message: string;
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

  const show = useCallback((message: string, action?: ToastState["action"]) => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message, action });
    timer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { toast, show, dismiss };
}
