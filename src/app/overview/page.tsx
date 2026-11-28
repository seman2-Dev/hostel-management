"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/states";
import { HostelViewer } from "@/components/hostel/hostel-viewer";
import { RoomPanel } from "@/components/hostel/room-panel";
import { PageHeader } from "@/components/shared/page-header";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { bedStatus, roomMealsOn, roomOccupied } from "@/lib/hostel";
import { cn } from "@/lib/utils";
import type { FloorNumber } from "@/types";

const DOT = { ON: "bg-green-500", OFF: "bg-red-500", UNASSIGNED: "bg-slate-400" } as const;

export default function OverviewPage() {
  const { t, fmt } = useI18n();
  const { rooms } = useHostel();
  const [floor, setFloor] = React.useState<"all" | `${FloorNumber}`>("all");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<{ room: number; bed: string | null } | null>(null);

  const visible = React.useMemo(() => {
    const q = query.trim();
    return rooms
      .filter((r) => floor === "all" || r.floor === Number(floor))
      .filter((r) => !q || String(r.number).includes(q))
      .sort((a, b) => a.floor - b.floor || a.position - b.position);
  }, [rooms, floor, query]);

  const floors: FloorNumber[] = [1, 2, 3];

  return (
    <div className="container py-8 sm:py-10">
      <PageHeader title={t("overview.title")} subtitle={t("overview.subtitle")} />
      <HostelViewer tall />

      <section className="mt-10" aria-labelledby="rooms-heading">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="rooms-heading" className="text-xl font-bold">
              {t("admin.rooms")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("overview.westToEast")} · {fmt.number(visible.length)} {t("overview.roomsShown")}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Tabs value={floor} onValueChange={(v) => setFloor(v as typeof floor)}>
              <TabsList aria-label={t("overview.filterFloor")}>
                <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
                {floors.map((f) => (
                  <TabsTrigger key={f} value={String(f)}>
                    {fmt.digits(f)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder={t("overview.searchRoom")}
              aria-label={t("overview.searchRoom")}
              className="sm:w-52"
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState title={t("common.noResults")} />
        ) : (
          <div className="space-y-6">
            {floors
              .filter((f) => visible.some((r) => r.floor === f))
              .map((f) => (
                <div key={f}>
                  <h3 className="mb-2 flex items-center justify-between text-sm font-semibold text-muted-foreground">
                    <span>{t(`overview.floorsLabel.${f}`)}</span>
                    <span className="text-xs font-normal">
                      {t("hero.west")} → {t("hero.east")}
                    </span>
                  </h3>
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10">
                    {visible
                      .filter((r) => r.floor === f)
                      .map((r) => (
                        <li key={r.number}>
                          <button
                            type="button"
                            onClick={() => setSelected({ room: r.number, bed: null })}
                            className="w-full rounded-xl border bg-card p-3 text-start shadow-sm transition-colors hover:border-primary hover:bg-accent/40 focus-ring"
                            aria-label={`${t("common.room")} ${fmt.digits(r.number)}, ${fmt.digits(roomMealsOn(r))} ${t("overview.mealsOn")}`}
                          >
                            <span className="block text-lg font-bold">{fmt.digits(r.number)}</span>
                            <span className="mt-1 flex gap-1" aria-hidden="true">
                              {r.beds.map((b) => (
                                <span key={b.id} className={cn("size-3 rounded-full", DOT[bedStatus(b)])} />
                              ))}
                            </span>
                            <span className="mt-1.5 block text-xs text-muted-foreground">
                              {fmt.number(roomMealsOn(r))}/{fmt.number(roomOccupied(r))} {t("overview.mealsOn")}
                            </span>
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
          </div>
        )}
      </section>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-sm p-0">
          <DialogTitle className="sr-only">{t("room.details")}</DialogTitle>
          <DialogDescription className="sr-only">{t("room.tapBed")}</DialogDescription>
          {selected && (
            <RoomPanel
              roomNumber={selected.room}
              bedId={selected.bed}
              onSelectBed={(bedId) => setSelected({ room: selected.room, bed: bedId })}
              onClose={() => setSelected(null)}
              className="border-0 shadow-none"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
