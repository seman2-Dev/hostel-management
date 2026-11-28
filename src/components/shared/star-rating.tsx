"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

export function StarDisplay({ value, className, size = "size-4" }: { value: number; className?: string; size?: string }) {
  const { t } = useI18n();
  const rounded = Math.round(value * 10) / 10;
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={t("menu.starsLabel", { count: rounded })}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - (n - 1)));
        return (
          <span key={n} className={cn("relative inline-block", size)} aria-hidden="true">
            <Star className={cn("absolute inset-0 text-muted-foreground/40", size)} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={cn("fill-warning text-warning", size)} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Accessible 1–5 star radio group. Arrow keys move the selection. */
export function StarInput({
  value,
  onChange,
  label,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const onKey = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(5, (value || 0) + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(1, (value || 2) - 1));
    }
  };
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex gap-1" onKeyDown={onKey}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={t("menu.starsLabel", { count: n })}
          tabIndex={value === n || (!value && n === 1) ? 0 : -1}
          disabled={disabled}
          onClick={() => onChange(n)}
          className="rounded-md p-1 focus-ring disabled:opacity-50"
        >
          <Star className={cn("size-7 transition-colors", n <= value ? "fill-warning text-warning" : "text-muted-foreground/50")} />
        </button>
      ))}
    </div>
  );
}
