"use client";

import * as React from "react";
import Link from "next/link";
import { BedDouble, Settings2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHostel } from "@/store/hostel-store";
import { useAuth } from "@/store/auth";
import { useI18n } from "@/i18n";
import { bedStatus, mealHistoryFor } from "@/lib/hostel";
import { cn } from "@/lib/utils";
import { daysAgoISO, todayISO } from "@/mocks/seed-utils";

const STATUS_BADGE = { ON: "success", OFF: "danger", UNASSIGNED: "secondary" } as const;
const DOT = { ON: "bg-green-500", OFF: "bg-red-500", UNASSIGNED: "bg-slate-400" } as const;

export function RoomPanel({
  roomNumber,
  bedId,
  onSelectBed,
  onClose,
  className,
}: {
  roomNumber: number;
  bedId: string | null;
  onSelectBed: (bedId: string) => void;
  onClose: () => void;
  className?: string;
}) {
  const { getRoom, getResident } = useHostel();
  const { user } = useAuth();
  const { t, pick, fmt } = useI18n();
  const room = getRoom(roomNumber);
  if (!room) return null;

  const bed = bedId ? room.beds.find((b) => b.id === bedId) : undefined;
  const resident = getResident(bed?.residentId);
  const status = bed ? bedStatus(bed) : null;
  const today = resident && resident.id ? mealHistoryFor(resident, 3).find((e) => e.date === todayISO()) : undefined;
  void daysAgoISO;

  return (
    <aside
      aria-label={t("room.details")}
      className={cn("rounded-xl border bg-card p-4 shadow-lg", className)}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("room.details")}</p>
          <h3 className="text-xl font-bold">
            {t("common.room")} {fmt.digits(room.number)}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("room.floorNumber")}: {t(`overview.floorsLabel.${room.floor}`)}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label={t("room.closePanel")}>
          <X />
        </Button>
      </div>

      <p className="mb-2 text-sm font-semibold">{t("room.beds")}</p>
      <ul className="grid grid-cols-2 gap-2">
        {room.beds.map((b) => {
          const s = bedStatus(b);
          const r = getResident(b.residentId);
          const selected = b.id === bedId;
          return (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => onSelectBed(b.id)}
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border p-2.5 text-start transition-colors focus-ring",
                  selected ? "border-primary bg-accent" : "hover:bg-muted/60",
                )}
              >
                <span className={cn("size-3 shrink-0 rounded-full", DOT[s])} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{fmt.digits(b.id)}</span>
                  <span className="block truncate text-xs text-muted-foreground">{r ? pick(r, "name") : t("room.unassigned")}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 rounded-lg bg-muted/50 p-3" aria-live="polite">
        {!bed ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <BedDouble className="size-4" />
            {t("room.tapBed")}
          </p>
        ) : (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t("room.bedNumber")}</dt>
              <dd className="font-semibold">{fmt.digits(bed.id)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t("room.resident")}</dt>
              <dd className="font-semibold">{resident ? pick(resident, "name") : t("room.noResident")}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">{t("room.mealStatus")}</dt>
              <dd>
                {status && (
                  <Badge variant={STATUS_BADGE[status]}>
                    {status === "ON" ? t("room.mealOn") : status === "OFF" ? t("room.mealOff") : t("room.unassigned")}
                  </Badge>
                )}
              </dd>
            </div>
            {resident && status !== "UNASSIGNED" && today && (
              <div>
                <dt className="mb-1 text-muted-foreground">{t("room.todayMeals")}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {(["breakfast", "lunch", "dinner"] as const).map((m) => (
                    <Badge key={m} variant={today[m] && status === "ON" ? "success" : "secondary"}>
                      {t(`room.${m}`)}
                    </Badge>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>

      {user?.role === "ADMIN" && (
        <Button asChild variant="outline" size="sm" className="mt-3 w-full">
          <Link href="/admin/meals">
            <Settings2 />
            {t("room.openAdmin")}
          </Link>
        </Button>
      )}
    </aside>
  );
}
