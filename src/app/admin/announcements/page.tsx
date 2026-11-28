"use client";

import * as React from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { AnnouncementDialog } from "@/components/admin/announcement-dialog";
import { STYLE_META } from "@/components/announcements/announcement-style";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Pager, usePagination } from "@/components/shared/pager";
import { useHostel } from "@/store/hostel-store";
import { useI18n, type TranslationKey } from "@/i18n";
import { announcementState, type AnnouncementState } from "@/lib/hostel";
import type { Announcement, AnnouncementStyle } from "@/types";

const STATE_META: Record<AnnouncementState, { key: TranslationKey; variant: "success" | "warning" | "secondary" | "outline" }> = {
  visible: { key: "announcements.visible", variant: "success" },
  scheduled: { key: "announcements.scheduled", variant: "warning" },
  expired: { key: "announcements.expired", variant: "secondary" },
  disabled: { key: "announcements.disabled", variant: "outline" },
};

const STYLES: AnnouncementStyle[] = ["GENERAL", "IMPORTANT", "EMERGENCY", "EVENT"];
const STATES: AnnouncementState[] = ["visible", "scheduled", "expired", "disabled"];
const ALL = "__all";

export default function AdminAnnouncementsPage() {
  const { t, pick, fmt } = useI18n();
  const { announcements, saveAnnouncement, deleteAnnouncement } = useHostel();
  const [query, setQuery] = React.useState("");
  const [stateFilter, setStateFilter] = React.useState<string>(ALL);
  const [styleFilter, setStyleFilter] = React.useState<string>(ALL);
  const [editing, setEditing] = React.useState<Announcement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Announcement | null>(null);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return announcements
      .filter((a) => (styleFilter === ALL || a.style === styleFilter) && (stateFilter === ALL || announcementState(a) === stateFilter))
      .filter((a) => !q || a.titleEn.toLowerCase().includes(q) || a.titleBn.includes(query.trim()))
      .sort((a, b) => b.priority - a.priority || b.startsAt.localeCompare(a.startsAt));
  }, [announcements, query, stateFilter, styleFilter]);
  const { page, pages, slice, setPage } = usePagination(rows, 10);

  const dateTime = (iso: string) => fmt.date(iso, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

  return (
    <>
      <PageHeader
        title={t("admin.announcements")}
        subtitle={t("admin.announcementsDesc")}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus />
            {t("admin.addAnnouncement")}
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_12rem]">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t("announcements.searchPlaceholder")}
            aria-label={t("common.search")}
            className="ps-9"
          />
        </div>
        <Select
          value={stateFilter}
          onValueChange={(v) => {
            setStateFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger aria-label={t("announcements.statusFilter")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("common.all")}</SelectItem>
            {STATES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(STATE_META[s].key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={styleFilter}
          onValueChange={(v) => {
            setStyleFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger aria-label={t("announcements.style")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("common.all")}</SelectItem>
            {STYLES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(STYLE_META[s].labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState title={announcements.length === 0 ? t("common.noData") : t("common.noResults")} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("announcements.title")}</TableHead>
                <TableHead>{t("announcements.style")}</TableHead>
                <TableHead>{t("announcements.priority")}</TableHead>
                <TableHead>{t("announcements.startsAt")} / {t("announcements.expiresAt")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("announcements.live")}</TableHead>
                <TableHead className="text-end">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((a) => {
                const meta = STYLE_META[a.style];
                const state = STATE_META[announcementState(a)];
                const other = pick({ titleEn: a.titleBn, titleBn: a.titleEn }, "title");
                return (
                  <TableRow key={a.id}>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-2 font-medium">{pick(a, "title")}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{other}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={meta.badge}>
                        {meta.icon}
                        {t(meta.labelKey)}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {fmt.number(a.priority)}/{fmt.number(5)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      <p>{dateTime(a.startsAt)}</p>
                      <p>{a.expiresAt ? dateTime(a.expiresAt) : t("announcements.noExpiry")}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={state.variant}>{t(state.key)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="flex items-center gap-2">
                          <Switch
                            checked={a.scrolling}
                            aria-label={t("announcements.scrolling")}
                            onCheckedChange={(on) => {
                              saveAnnouncement({ ...a, scrolling: on });
                              toast.success(t("admin.annSaved"));
                            }}
                          />
                          {t("announcements.play")}
                        </label>
                        <label className="flex items-center gap-2">
                          <Switch
                            checked={a.active}
                            aria-label={t("announcements.enabledLabel")}
                            onCheckedChange={(on) => {
                              saveAnnouncement({ ...a, active: on });
                              toast.success(t("admin.annSaved"));
                            }}
                          />
                          {t("common.active")}
                        </label>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("admin.editAnnouncement")}
                          onClick={() => {
                            setEditing(a);
                            setOpen(true);
                          }}
                        >
                          <Pencil />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label={t("common.delete")} onClick={() => setDeleting(a)}>
                          <Trash2 className="text-danger" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Pager page={page} pages={pages} total={rows.length} onPage={setPage} />
        </>
      )}

      <AnnouncementDialog open={open} onOpenChange={setOpen} announcement={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("admin.deleteAnnTitle")}
        description={t("admin.deleteAnnBody")}
        destructive
        confirmLabel={t("common.delete")}
        onConfirm={() => {
          if (deleting) deleteAnnouncement(deleting.id);
          toast.success(t("admin.annDeleted"));
        }}
      />
    </>
  );
}
