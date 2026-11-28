"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import type { Locale } from "@/types";

const OPTIONS: Array<{ value: Locale; label: string; lang: string }> = [
  { value: "bn", label: "বাংলা", lang: "bn" },
  { value: "en", label: "English", lang: "en" },
];

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      className={cn("inline-flex items-center rounded-full border bg-muted/60 p-0.5 text-xs font-semibold", className)}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          lang={o.lang}
          aria-pressed={locale === o.value}
          onClick={() => setLocale(o.value)}
          className={cn(
            "rounded-full px-3 py-1.5 transition-colors focus-ring",
            locale === o.value ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
