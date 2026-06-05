"use client";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "px-5 py-3 text-sm font-medium shadow-lg animate-fade-in",
            t.variant === "destructive"
              ? "bg-red-600 text-white"
              : "bg-foreground text-background"
          )}
        >
          {t.title}
          {t.description && (
            <p className="text-xs opacity-80 mt-0.5">{t.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
