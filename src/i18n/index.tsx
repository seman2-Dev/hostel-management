"use client";

import * as React from "react";
import { bn } from "./dictionaries/bn";
import { en } from "./dictionaries/en";
import type { Dictionary } from "./dictionaries/en";
import type { Locale } from "@/types";

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}.${P}`
    : never
  : never;

type Paths<T> = T extends string
  ? never
  : {
      [K in keyof T & (string | number)]: T[K] extends string
        ? `${K}`
        : T[K] extends object
          ? Join<K, Paths<T[K]>>
          : never;
    }[keyof T & (string | number)];

export type TranslationKey = Paths<Dictionary>;

const dictionaries: Record<Locale, Dictionary> = { bn, en };
export const STORAGE_KEY = "hostel.locale";
export const DEFAULT_LOCALE: Locale = "bn";

function lookup(dict: Dictionary, key: string): string {
  const value = key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
    return undefined;
  }, dict);
  return typeof value === "string" ? value : key;
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBanglaDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

export interface Formatters {
  number: (value: number, opts?: Intl.NumberFormatOptions) => string;
  currency: (value: number) => string;
  date: (value: string | Date, opts?: Intl.DateTimeFormatOptions) => string;
  time: (value: string | Date) => string;
  /** Format digits found inside an arbitrary string (room numbers, ids). */
  digits: (value: string | number) => string;
}

function makeFormatters(locale: Locale): Formatters {
  const tag = locale === "bn" ? "bn-BD" : "en-GB";
  const toDate = (v: string | Date) => (v instanceof Date ? v : new Date(v.length <= 10 ? `${v}T00:00:00` : v));
  return {
    number: (value, opts) => new Intl.NumberFormat(tag, { maximumFractionDigits: 2, ...opts }).format(value),
    currency: (value) =>
      `৳${new Intl.NumberFormat(tag, { maximumFractionDigits: 2 }).format(value)}`,
    date: (value, opts) =>
      new Intl.DateTimeFormat(tag, opts ?? { day: "numeric", month: "short", year: "numeric" }).format(toDate(value)),
    time: (value) =>
      new Intl.DateTimeFormat(tag, { hour: "numeric", minute: "2-digit", hour12: true }).format(toDate(value)),
    digits: (value) => (locale === "bn" ? toBanglaDigits(value) : String(value)),
  };
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  /** Pick the right field from a bilingual record, e.g. pick(item, "name"). */
  pick: <T extends object>(item: T, base: string) => string;
  fmt: Formatters;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "bn" || stored === "en") setLocaleState(stored);
    } catch {
      /* storage unavailable — keep default */
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = React.useMemo<I18nContextValue>(() => {
    const dict = dictionaries[locale];
    const suffix = locale === "bn" ? "Bn" : "En";
    return {
      locale,
      setLocale,
      t: (key, vars) => {
        let text = lookup(dict, key);
        if (vars) {
          for (const [name, v] of Object.entries(vars)) {
            const shown = typeof v === "number" && locale === "bn" ? toBanglaDigits(v) : String(v);
            text = text.replaceAll(`{${name}}`, shown);
          }
        }
        return text;
      },
      pick: (item, base) => {
        const record = item as Record<string, unknown>;
        const localized = record[`${base}${suffix}`];
        if (typeof localized === "string" && localized !== "") return localized;
        // Records such as Resident keep the English value in the plain field (`name`) and Bangla in `nameBn`.
        const plain = record[base];
        if (locale === "en" && typeof plain === "string") return plain;
        const other = record[`${base}${locale === "bn" ? "En" : "Bn"}`];
        return String(other ?? plain ?? "");
      },
      fmt: makeFormatters(locale),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
