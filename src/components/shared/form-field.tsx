"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useI18n, type TranslationKey } from "@/i18n";

/**
 * Wraps a control with a label and a translated validation message.
 * Zod schemas return translation KEYS as messages (e.g. "validation.required"),
 * so errors re-translate instantly when the language changes.
 */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs font-medium text-danger">
          {t(error as TranslationKey)}
        </p>
      )}
    </div>
  );
}
