"use client";

import * as React from "react";
import { Power, PowerOff, Search, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { RoomManageDialog } from "@/components/admin/room-manage-dialog";
import { useBulkMeal } from "@/components/admin/use-bulk-meal";
import { PageHeader } from "@/components/shared/page-header";
import { Pager, usePagination } from "@/components/shared/pager";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { roomMealsOn, roomOccupied } from "@/lib/hostel";
import type { FloorNumber } from "@/types";

export default function AdminRoomsPage() {
  const { t, fmt } = useI18n();
  const { rooms } = useHostel();
  const bulk = useBulkMeal();
  const [floor, setFloor] = React.useState<"all" | `${FloorNumber}`>("all");
  const [query, setQuery] = React.useState("");
  const [managing, setManaging] = React.useState<number | null>(null);

  const rows = React.useMemo(
    () =>
      rooms
        .filter((r) => floor === "all" || r.floor === Number(floor))
        .filter((r) => !query.trim() || String(r.number).includes(query.trim()))
        .sort((a, b) => a.floor - b.floor || a.position - b.position),
    [rooms, floor, query],
  );
  const { page, pages, slice, setPage } = usePagination(rows, 15);
  React.useEffect(() => setPage(1), [floor, query, setPage]);

  return (
    <>
      <PageHeader title={t("admin.rooms")} subtitle={t("admin.roomsDesc")} />
      <p className="mb-4 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">{t("admin.structureLocked")}</p>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder={t("overview.searchRoom")} aria-label={t("overview.searchRoom")} className="ps-9" />
        </div>
        <Select value={floor} onValueChange={(v) => setFloor(v as typeof floor)}>
          <SelectTrigger aria-label={t("overview.filterFloor")} className="sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")} · {t("common.floor")}</SelectItem>
            {([1, 2, 3] as const).map((f) => (
              <SelectItem key={f} value={String(f)}>
                {t(`overview.floorsLabel.${f}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState title={t("common.noResults")} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.room")}</TableHead>
                <TableHead>{t("common.floor")}</TableHead>
                <TableHead>
                  {t("hero.west")} → {t("hero.east")}
                </TableHead>
                <TableHead>{t("overview.occupied")}</TableHead>
                <TableHead>{t("overview.mealsOn")}</TableHead>
                <TableHead className="text-end">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((r) => (
                <TableRow key={r.number}>
                  <TableCell className="text-base font-bold">{fmt.digits(r.number)}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{t(`overview.floorsLabel.${r.floor}`)}</TableCell>
                  <TableCell>
                    {fmt.number(r.position + 1)}/{fmt.number(10)}
                  </TableCell>
                  <TableCell>
                    {fmt.number(roomOccupied(r))}/{fmt.number(4)}
                  </TableCell>
                  <TableCell>
                    {fmt.number(roomMealsOn(r))}/{fmt.number(roomOccupied(r))}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button variant="outline" size="sm" onClick={() => setManaging(r.number)}>
                        <Settings2 />
                        {t("room.details")}
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`${t("meal.setOn")} ${r.number}`} onClick={() => bulk.request({ type: "room", roomNumber: r.number }, true)}>
                        <Power className="text-success" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`${t("meal.setOff")} ${r.number}`} onClick={() => bulk.request({ type: "room", roomNumber: r.number }, false)}>
                        <PowerOff className="text-danger" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager page={page} pages={pages} total={rows.length} onPage={setPage} />
        </>
      )}

      <RoomManageDialog roomNumber={managing} onClose={() => setManaging(null)} />
      {bulk.dialog}
    </>
  );
}
