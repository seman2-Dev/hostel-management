"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { PageHeader } from "@/components/shared/page-header";
import { Pager, usePagination } from "@/components/shared/pager";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { useActivityText } from "@/components/admin/use-activity-text";

export default function AdminActivityPage() {
  const { t, fmt } = useI18n();
  const { activity } = useHostel();
  const activityText = useActivityText();
  const [query, setQuery] = React.useState("");

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return activity.filter((a) => !q || activityText.action(a).toLowerCase().includes(q) || a.adminName.toLowerCase().includes(q) || activityText.value(a.newValue).toLowerCase().includes(q));
  }, [activity, query, activityText]);
  const { page, pages, slice, setPage } = usePagination(rows, 12);
  React.useEffect(() => setPage(1), [query, setPage]);

  return (
    <>
      <PageHeader title={t("admin.activity")} subtitle={t("admin.activityDesc")} />
      <div className="relative mb-3 max-w-md">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("admin.search")} aria-label={t("common.search")} className="ps-9" />
      </div>
      {rows.length === 0 ? (
        <EmptyState title={t("common.noResults")} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.action")}</TableHead>
                <TableHead>{t("admin.by")}</TableHead>
                <TableHead>{t("admin.at")}</TableHead>
                <TableHead>{t("common.previous")}</TableHead>
                <TableHead>{t("common.updated")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="min-w-[14rem] font-medium">{activityText.action(a)}</TableCell>
                  <TableCell>{a.adminName}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{fmt.date(a.createdAt, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</TableCell>
                  <TableCell className="text-muted-foreground">{activityText.value(a.previousValue)}</TableCell>
                  <TableCell>{activityText.value(a.newValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager page={page} pages={pages} total={rows.length} onPage={setPage} />
        </>
      )}
    </>
  );
}
