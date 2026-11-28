"use client";

import * as React from "react";
import Link from "next/link";
import { Megaphone, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { AnnouncementTicker } from "@/components/announcements/announcement-ticker";
import { STYLE_META } from "@/components/announcements/announcement-style";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/store/auth";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { visibleAnnouncements } from "@/lib/hostel";
import { cn } from "@/lib/utils";

export default function AnnouncementsPage() {
  const { t, pick, fmt } = useI18n();
  const { announcements } = useHostel();
  const { user } = useAuth();
  const list = React.useMemo(() => visibleAnnouncements(announcements), [announcements]);

  return (
    <div className="container py-8 sm:py-10">
      <PageHeader
        title={t("announcements.title")}
        subtitle={t("announcements.subtitle")}
        actions={
          user?.role === "ADMIN" ? (
            <Button asChild variant="outline">
              <Link href="/admin/announcements">
                <ShieldCheck />
                {t("admin.announcements")}
              </Link>
            </Button>
          ) : undefined
        }
      />
      <AnnouncementTicker className="mb-6" />

      {list.length === 0 ? (
        <EmptyState title={t("announcements.none")} icon={<Megaphone className="size-6" />} />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {list.map((a) => {
            const meta = STYLE_META[a.style];
            return (
              <li key={a.id} className={cn("rounded-xl border border-s-4 bg-card p-4 shadow-sm", meta.bar)}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={meta.badge} className="gap-1">
                    {meta.icon}
                    {t(meta.labelKey)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {t("announcements.priority")} {fmt.number(a.priority)}/{fmt.number(5)}
                  </span>
                </div>
                <p className="text-base font-medium leading-snug">{pick(a, "title")}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {a.expiresAt ? `${t("announcements.expiresAt")}: ${fmt.date(a.expiresAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}` : t("announcements.noExpiry")}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
