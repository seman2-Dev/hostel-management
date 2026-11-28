"use client";

import * as React from "react";
import { useI18n, type TranslationKey } from "@/i18n";
import type { ActivityLogEntry } from "@/types";

/** Turns stored activity codes into text in the active language. */
export function useActivityText() {
  const { t, fmt } = useI18n();
  return React.useMemo(() => {
    const value = (raw: string): string =>
      fmt.digits(
        raw
          .split(" × ")
          .map((part) => {
            const key = `activity.values.${part}` as TranslationKey;
            const translated = t(key);
            return translated === key ? part : translated;
          })
          .join(" × "),
      );

    const action = (entry: ActivityLogEntry): string => {
      const params: Record<string, string | number> = { ...entry.params };
      if (typeof params.scope === "string") params.scope = t(`activity.scopes.${params.scope}` as TranslationKey);
      return fmt.digits(t(`activity.actions.${entry.action}` as TranslationKey, params));
    };

    return { action, value };
  }, [t, fmt]);
}
