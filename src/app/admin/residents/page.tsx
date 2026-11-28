"use client";

import * as React from "react";
import { toast } from "sonner";
import { History, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { ResidentFormDialog, ResidentHistoryDialog } from "@/components/admin/resident-dialogs";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Pager, usePagination } from "@/components/shared/pager";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import type { Resident } from "@/types";

export default function AdminResidentsPage() {
  const { t, pick, fmt } = useI18n();
  const { residents, removeResident, setResidentActive } = useHostel();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"all" | "active" | "inactive" | "nobed">("all");
  const [editing, setEditing] = React.useState<Resident | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [removing, setRemoving] = React.useState<Resident | null>(null);
  const [history, setHistory] = React.useState<Resident | null>(null);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return residents
      .filter((r) => status === "all" || (status === "active" && r.active) || (status === "inactive" && !r.active) || (status === "nobed" && !r.bedId))
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.nameBn.includes(query.trim()) || r.studentId.includes(q) || r.email.toLowerCase().includes(q) || r.department.toLowerCase().includes(q) || (r.bedId ?? "").toLowerCase().includes(q));
  }, [residents, query, status]);
  const { page, pages, slice, setPage } = usePagination(rows, 12);
  React.useEffect(() => setPage(1), [query, status, setPage]);

  return (
    <>
      <PageHeader
        title={t("admin.residents")}
        subtitle={t("admin.residentsDesc")}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus />
            {t("admin.addResident")}
          </Button>
        }
      />

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("admin.search")} aria-label={t("common.search")} className="ps-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger aria-label={t("common.status")} className="sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            <SelectItem value="active">{t("common.active")}</SelectItem>
            <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
            <SelectItem value="nobed">{t("admin.noBed")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState title={residents.length === 0 ? t("common.noData") : t("common.noResults")} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.resident")}</TableHead>
                <TableHead>{t("auth.department")}</TableHead>
                <TableHead>{t("common.phone")}</TableHead>
                <TableHead>{t("common.bed")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-end">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="min-w-[12rem]">
                    <p className="font-medium">{pick(r, "name")}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.studentId} · {r.email}
                    </p>
                  </TableCell>
                  <TableCell>{r.department}</TableCell>
                  <TableCell className="whitespace-nowrap" dir="ltr">
                    {r.phone}
                  </TableCell>
                  <TableCell>{r.bedId ? <Badge variant="default">{fmt.digits(r.bedId)}</Badge> : <span className="text-muted-foreground">{t("admin.noBed")}</span>}</TableCell>
                  <TableCell>
                    <label className="flex items-center gap-2 text-xs">
                      <Switch
                        checked={r.active}
                        aria-label={r.active ? t("admin.deactivate") : t("admin.activate")}
                        onCheckedChange={(on) => {
                          setResidentActive(r.id, on);
                          toast.success(t("common.success"));
                        }}
                      />
                      {r.active ? t("common.active") : t("common.inactive")}
                    </label>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label={`${t("admin.mealHistory")}: ${r.name}`} onClick={() => setHistory(r)}>
                        <History />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`${t("common.edit")}: ${r.name}`}
                        onClick={() => {
                          setEditing(r);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`${t("admin.removeResident")}: ${r.name}`} onClick={() => setRemoving(r)}>
                        <Trash2 className="text-danger" />
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

      <ResidentFormDialog open={formOpen} onOpenChange={setFormOpen} resident={editing} />
      <ResidentHistoryDialog resident={history} onClose={() => setHistory(null)} />
      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={t("admin.removeTitle")}
        description={t("admin.removeBody")}
        destructive
        confirmLabel={t("admin.removeResident")}
        onConfirm={() => {
          if (removing) removeResident(removing.id);
          toast.success(t("common.success"));
        }}
      />
    </>
  );
}
