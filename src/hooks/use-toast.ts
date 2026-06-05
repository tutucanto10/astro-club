// Simplified toast hook
import { useState, useCallback } from "react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastCount = 0;
const listeners: Array<(toast: Toast) => void> = [];

export function toast(options: Omit<Toast, "id">) {
  const id = String(++toastCount);
  const t = { ...options, id };
  listeners.forEach((l) => l(t));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Toast) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, 3000);
  }, []);

  // Register listener on mount
  useState(() => {
    listeners.push(addToast);
    return () => {
      const idx = listeners.indexOf(addToast);
      if (idx > -1) listeners.splice(idx, 1);
    };
  });

  return { toast, toasts };
}
