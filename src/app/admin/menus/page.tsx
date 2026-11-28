"use client";

import * as React from "react";
import { toast } from "sonner";
import { CalendarClock, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { MenuDialog } from "@/components/admin/menu-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Pager, usePagination } from "@/components/shared/pager";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { todayISO } from "@/mocks/seed-utils";
import type { DailyMenu } from "@/types";

export default function AdminMenusPage() {
  const { t, pick, fmt } = useI18n();
  const { menus, deleteMenu, setMenuPublished } = useHostel();
  const [editing, setEditing] = React.useState<DailyMenu | null>(null);
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<DailyMenu | null>(null);
  const today = todayISO();

  const rows = React.useMemo(() => [...menus].sort((a, b) => b.date.localeCompare(a.date)), [menus]);
  const { page, pages, slice, setPage } = usePagination(rows, 10);

  return (
    <>
      <PageHeader
        title={t("admin.menus")}
        subtitle={t("admin.menusDesc")}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus />
            {t("admin.addMenu")}
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title={t("common.noData")} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead>{t("common.items")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-end">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="whitespace-nowrap">
                    <p className="font-medium">{fmt.date(m.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p>
                    <div className="mt-1 flex gap-1">
                      {m.date === today && <Badge variant="default">{t("common.today")}</Badge>}
                      {m.date > today && (
                        <Badge variant="warning" className="gap-1">
                          <CalendarClock className="size-3" />
                          {t("announcements.scheduled")}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="font-medium">
                      {fmt.number(m.items.length)} {t("common.items")}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{m.items.map((i) => pick(i, "name")).join(" · ")}</p>
                  </TableCell>
                  <TableCell>
                    <label className="flex items-center gap-2 text-xs">
                      <Switch
                        checked={m.published}
                        aria-label={m.published ? t("menu.unpublish") : t("menu.publish")}
                        onCheckedChange={(on) => {
                          setMenuPublished(m.id, on);
                          toast.success(on ? t("menu.publish") : t("menu.unpublish"));
                        }}
                      />
                      {m.published ? t("common.published") : t("common.draft")}
                    </label>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t("admin.editMenu")}
                        onClick={() => {
                          setEditing(m);
                          setOpen(true);
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={t("common.delete")} onClick={() => setDeleting(m)}>
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

      <MenuDialog open={open} onOpenChange={setOpen} menu={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("admin.deleteMenuTitle")}
        description={t("admin.deleteMenuBody")}
        destructive
        confirmLabel={t("common.delete")}
        onConfirm={() => {
          if (deleting) deleteMenu(deleting.id);
          toast.success(t("admin.menuDeleted"));
        }}
      />
    </>
  );
}
