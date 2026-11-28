"use client";

import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useHostel();
  const { t, pick, fmt } = useI18n();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`${t("nav.notifications")} (${fmt.digits(unread)})`}>
          <Bell />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-danger-foreground">
              {fmt.digits(unread)}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-semibold">{t("notifications.title")}</p>
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="inline-flex items-center gap-1 rounded text-xs text-primary focus-ring"
          >
            <CheckCheck className="size-3.5" />
            {t("common.markAllRead")}
          </button>
        </div>
        <ul className="max-h-80 overflow-y-auto">
          {notifications.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">{t("notifications.empty")}</li>}
          {notifications.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => markNotificationRead(n.id)}
                className={cn("flex w-full flex-col items-start gap-0.5 border-b px-3 py-2.5 text-start last:border-0 hover:bg-muted/60 focus-ring", !n.read && "bg-accent/50")}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">{t(`notifications.types.${n.type}`)}</span>
                <span className="text-sm leading-snug">{pick(n, "title")}</span>
                <span className="text-xs text-muted-foreground">
                  {fmt.date(n.createdAt, { day: "numeric", month: "short" })} · {fmt.time(n.createdAt)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
