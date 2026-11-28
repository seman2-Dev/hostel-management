"use client";

import * as React from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { Pager, usePagination } from "@/components/shared/pager";
import { BedAssignSelect } from "./bed-assign-select";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { bedStatus } from "@/lib/hostel";
import type { BedStatus, FloorNumber } from "@/types";

const BADGE = { ON: "success", OFF: "danger", UNASSIGNED: "secondary" } as const;

/**
 * Bed list in west → east, floor-by-floor order.
 * `meals` mode: occupied beds with a meal switch. `manage` mode: all beds with resident assignment.
 */
export function BedsTable({ mode }: { mode: "meals" | "manage" }) {
  const { allBeds, getResident, setBedMeal } = useHostel();
  const { t, pick, fmt } = useI18n();
  const [floor, setFloor] = React.useState<"all" | `${FloorNumber}`>("all");
  const [status, setStatus] = React.useState<"all" | BedStatus>("all");
  const [query, setQuery] = React.useState("");

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return allBeds
      .filter((b) => (mode === "manage" ? true : !!b.residentId))
      .filter((b) => floor === "all" || b.floor === Number(floor))
      .filter((b) => status === "all" || bedStatus(b) === status)
      .filter((b) => {
        if (!q) return true;
        const r = getResident(b.residentId);
        return b.id.toLowerCase().includes(q) || String(b.roomNumber).includes(q) || r?.name.toLowerCase().includes(q) || r?.nameBn.includes(query.trim());
      });
  }, [allBeds, mode, floor, status, query, getResident]);

  const { page, pages, slice, setPage } = usePagination(rows, 15);
  React.useEffect(() => setPage(1), [floor, status, query, setPage]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("admin.search")} aria-label={t("common.search")} className="ps-9" />
        </div>
        <Select value={floor} onValueChange={(v) => setFloor(v as typeof floor)}>
          <SelectTrigger aria-label={t("overview.filterFloor")} className="sm:w-44">
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
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger aria-label={t("common.status")} className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")} · {t("common.status")}</SelectItem>
            <SelectItem value="ON">{t("room.mealOn")}</SelectItem>
            <SelectItem value="OFF">{t("room.mealOff")}</SelectItem>
            {mode === "manage" && <SelectItem value="UNASSIGNED">{t("room.unassigned")}</SelectItem>}
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
                <TableHead>{t("common.bed")}</TableHead>
                <TableHead>{t("common.room")}</TableHead>
                <TableHead>{t("common.floor")}</TableHead>
                <TableHead>{t("common.resident")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-end">{t("meal.toggle")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((b) => {
                const r = getResident(b.residentId);
                const s = bedStatus(b);
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-semibold">{fmt.digits(b.id)}</TableCell>
                    <TableCell>{fmt.digits(b.roomNumber)}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{t(`overview.floorsLabel.${b.floor}`)}</TableCell>
                    <TableCell className="min-w-[14rem]">
                      {mode === "manage" ? (
                        <BedAssignSelect bed={b} className="h-9" />
                      ) : (
                        <>
                          <p className="font-medium">{r ? pick(r, "name") : "—"}</p>
                          {r && !r.active && <p className="text-xs text-danger">{t("common.inactive")}</p>}
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={BADGE[s]}>{s === "ON" ? t("room.mealOn") : s === "OFF" ? t("room.mealOff") : t("room.unassigned")}</Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <Switch
                        checked={b.mealOn}
                        disabled={!b.residentId}
                        aria-label={`${t("meal.toggle")} ${b.id}`}
                        onCheckedChange={(on) => {
                          setBedMeal(b.id, on);
                          toast.success(on ? t("meal.turnedOn") : t("meal.turnedOff"));
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Pager page={page} pages={pages} total={rows.length} onPage={setPage} />
        </>
      )}
    </div>
  );
}
