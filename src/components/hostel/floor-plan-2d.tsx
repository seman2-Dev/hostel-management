"use client";

import * as React from "react";
import type { FloorNumber, Room } from "@/types";
import { bedStatus, roomMealsOn, roomOccupied } from "@/lib/hostel";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const DOT = { ON: "bg-green-500", OFF: "bg-red-500", UNASSIGNED: "bg-slate-400" } as const;

/**
 * Accessible 2D fallback. Floors are stacked top (3rd) to bottom (1st); rooms run west → east.
 * Used on weak devices, when WebGL fails, or when the visitor picks it.
 */
export function FloorPlan2D({
  rooms,
  floors = [3, 2, 1],
  selectedRoom,
  selectedBed,
  onSelectRoom,
  onSelectBed,
  compact = false,
}: {
  rooms: Room[];
  floors?: FloorNumber[];
  selectedRoom: number | null;
  selectedBed: string | null;
  onSelectRoom: (n: number) => void;
  onSelectBed: (id: string) => void;
  compact?: boolean;
}) {
  const { t, fmt } = useI18n();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>← {t("hero.west")}</span>
        <span>{t("hero.east")} →</span>
      </div>
      {floors.map((floor) => {
        const row = rooms.filter((r) => r.floor === floor).sort((a, b) => a.position - b.position);
        if (row.length === 0) return null;
        return (
          <section key={floor} aria-label={t(`overview.floorsLabel.${floor}`)}>
            <h3 className="mb-1.5 text-sm font-bold">{t(`overview.floorsLabel.${floor}`)}</h3>
            <div className="overflow-x-auto pb-2">
              <ol className={cn("grid min-w-[44rem] gap-1.5", compact ? "grid-cols-10" : "grid-cols-10")}>
                {row.map((room) => {
                  const selected = selectedRoom === room.number;
                  return (
                    <li key={room.number}>
                      <div
                        className={cn(
                          "rounded-lg border bg-card p-1.5 transition-colors",
                          selected && "border-primary ring-2 ring-primary/40",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectRoom(room.number)}
                          aria-pressed={selected}
                          aria-label={`${t("common.room")} ${fmt.digits(room.number)} — ${fmt.digits(roomMealsOn(room))}/${fmt.digits(roomOccupied(room))} ${t("overview.mealsOn")}`}
                          className="mb-1.5 w-full rounded bg-muted px-1 py-0.5 text-center text-xs font-bold focus-ring hover:bg-accent"
                        >
                          {fmt.digits(room.number)}
                        </button>
                        <div className="grid grid-cols-2 gap-1">
                          {room.beds.map((bed) => {
                            const s = bedStatus(bed);
                            const sel = selectedBed === bed.id;
                            return (
                              <button
                                key={bed.id}
                                type="button"
                                onClick={() => onSelectBed(bed.id)}
                                aria-label={`${fmt.digits(bed.id)} — ${s === "ON" ? t("room.mealOn") : s === "OFF" ? t("room.mealOff") : t("room.unassigned")}`}
                                aria-pressed={sel}
                                className={cn(
                                  "flex h-6 items-center justify-center rounded text-[10px] font-bold text-white focus-ring",
                                  DOT[s],
                                  sel && "ring-2 ring-yellow-400 ring-offset-1 ring-offset-card",
                                )}
                              >
                                {bed.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        );
      })}
    </div>
  );
}
