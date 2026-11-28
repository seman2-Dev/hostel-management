"use client";

import * as React from "react";
import { Clock3, Coffee, Moon, Sparkles, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useHostel } from "@/store/hostel-store";
import { useI18n, type TranslationKey } from "@/i18n";
import { cn } from "@/lib/utils";
import type { MealType } from "@/types";

const ORDER: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];
const ICON: Record<MealType, React.ReactNode> = {
  BREAKFAST: <Coffee />,
  LUNCH: <Sun />,
  DINNER: <Moon />,
};
const MEAL_KEY: Record<MealType, TranslationKey> = {
  BREAKFAST: "meal.breakfast",
  LUNCH: "meal.lunch",
  DINNER: "meal.dinner",
};
const STATUS_KEY: Record<"upcoming" | "serving" | "done", TranslationKey> = {
  upcoming: "schedule.status.upcoming",
  serving: "schedule.status.serving",
  done: "schedule.status.done",
};
const SERVING_MINUTES = 45;

type Status = keyof typeof STATUS_KEY;

function minutesOf(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Live serving schedule. The clock starts after mount so SSR and client render identically. */
export function MealSchedule({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { settings } = useHostel();
  const { t, fmt } = useI18n();
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const nowMinutes = now ? now.getHours() * 60 + now.getMinutes() : null;

  const entries = ORDER.map((type) => {
    const time = settings.mealTimes[type] ?? "00:00";
    const start = minutesOf(time);
    const status: Status | null =
      nowMinutes === null
        ? null
        : nowMinutes >= start && nowMinutes < start + SERVING_MINUTES
          ? "serving"
          : nowMinutes >= start + SERVING_MINUTES
            ? "done"
            : "upcoming";
    return { type, time, start, status };
  });

  const next = nowMinutes === null ? null : (entries.find((e) => e.status === "serving") ?? entries.find((e) => e.status === "upcoming") ?? null);
  const remaining = next && nowMinutes !== null ? Math.max(0, next.start - nowMinutes) : 0;
  const durationLabel = `${fmt.number(Math.floor(remaining / 60))}h ${fmt.number(remaining % 60)}m`;

  return (
    <section className={cn("relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-4 shadow-panel sm:p-5", compact && "p-3 sm:p-4", className)} aria-labelledby="meal-schedule-title">
      <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary via-brass to-transparent" aria-hidden="true" />
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-kicker">{t("brand.tagline")}</p>
          <h2 id="meal-schedule-title" className="text-lg font-semibold tracking-tight sm:text-xl">
            {t("schedule.title")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("schedule.subtitle")}</p>
        </div>
        <Badge variant="outline" className="gap-1.5 border-brass/40 text-brass">
          <Clock3 className="size-3.5" />
          <time dateTime={now ? now.toISOString() : undefined}>
            {now ? `${pad(now.getHours())}:${pad(now.getMinutes())}` : "--:--"}
          </time>
        </Badge>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-primary/15 bg-primary/[0.06] px-3 py-2.5" aria-live="polite">
        {next ? (
          <>
            <Sparkles className="size-4 shrink-0 text-brass" />
            <span className="text-sm font-semibold text-primary">
              {next.status === "serving"
                ? `${t("schedule.now")} · ${t(MEAL_KEY[next.type])}`
                : `${t("schedule.next")}: ${t(MEAL_KEY[next.type])}`}
            </span>
            <span className="text-sm text-muted-foreground">
              {next.status === "serving" ? t("schedule.at", { time: next.time }) : t("schedule.in", { time: durationLabel })}
            </span>
          </>
        ) : (
          <>
            <Clock3 className="size-4 shrink-0 text-brass" />
            <span className="text-sm font-semibold">{t("schedule.done")}</span>
          </>
        )}
      </div>

      <ol className="grid gap-3 sm:grid-cols-3">
        {entries.map((entry) => (
          <li
            key={entry.type}
            className={cn(
              "relative rounded-xl border p-3 transition-all sm:p-4",
              entry.status === "serving" && "border-brass/60 bg-brass/[0.08] shadow-lift",
              entry.status === "done" && "opacity-60",
              entry.status === "upcoming" && "border-border/70 bg-background/40",
              entry.status === null && "border-border/70",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg [&_svg]:size-4",
                  entry.status === "serving" ? "bg-brass text-brass-foreground" : "bg-primary/10 text-primary",
                )}
                aria-hidden="true"
              >
                {ICON[entry.type]}
              </span>
              {entry.status && (
                <span className={cn("text-[10px] font-semibold uppercase tracking-wider", entry.status === "serving" ? "text-brass" : "text-muted-foreground")}>
                  {t(STATUS_KEY[entry.status])}
                </span>
              )}
            </div>
            <p className="mt-3 text-sm font-semibold">{t(MEAL_KEY[entry.type])}</p>
            <p className="metric-value mt-0.5 text-primary">{fmt.digits(entry.time)}</p>
          </li>
        ))}
      </ol>

      {!compact && <p className="mt-3 text-xs text-muted-foreground">{t("schedule.hint")}</p>}
    </section>
  );
}
