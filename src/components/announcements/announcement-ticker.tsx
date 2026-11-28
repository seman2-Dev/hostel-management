"use client";

import * as React from "react";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { visibleAnnouncements } from "@/lib/hostel";
import { cn } from "@/lib/utils";
import { STYLE_META } from "./announcement-style";

/** Smooth continuous horizontal scroll. Pauses on hover/focus (CSS) or with the pause button. */
export function AnnouncementTicker({ className }: { className?: string }) {
  const { announcements } = useHostel();
  const { t, pick } = useI18n();
  const [paused, setPaused] = React.useState(false);

  const items = React.useMemo(() => visibleAnnouncements(announcements).filter((a) => a.scrolling), [announcements]);

  if (items.length === 0) {
    return (
      <div className={cn("rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground", className)}>{t("announcements.none")}</div>
    );
  }

  const chars = items.reduce((n, a) => n + pick(a, "title").length, 0);
  const duration = Math.max(28, Math.round(chars * 0.42));

  return (
    <section aria-label={t("announcements.title")} className={cn("marquee-track flex items-stretch overflow-hidden rounded-xl border bg-card shadow-sm", className)}>
      <Link href="/announcements" className="flex shrink-0 items-center gap-2 bg-primary px-3 text-sm font-semibold text-primary-foreground focus-ring sm:px-4">
        <span className="relative flex size-2" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/70 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-white" />
        </span>
        {t("announcements.live")}
      </Link>

      <div className="relative min-w-0 flex-1 overflow-hidden py-2 motion-reduce:overflow-x-auto">
        <ul
          className={cn("animate-marquee flex w-max items-center", paused && "[animation-play-state:paused]")}
          style={{ ["--marquee-duration" as string]: `${duration}s` }}
        >
          {[...items, ...items].map((a, i) => {
            const meta = STYLE_META[a.style];
            return (
              <li key={`${a.id}-${i}`} aria-hidden={i >= items.length ? true : undefined} className="flex items-center gap-2 whitespace-nowrap px-5 text-sm sm:text-[15px]">
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", meta.chip)}>
                  {meta.icon}
                  {t(meta.labelKey)}
                </span>
                <span className="font-medium">{pick(a, "title")}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 rounded-none border-s"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? t("announcements.play") : t("announcements.pause")}
        aria-pressed={paused}
      >
        {paused ? <Play /> : <Pause />}
      </Button>
    </section>
  );
}
