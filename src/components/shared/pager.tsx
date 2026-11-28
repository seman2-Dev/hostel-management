"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = React.useState(1);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pages);
  const slice = React.useMemo(() => items.slice((safePage - 1) * pageSize, safePage * pageSize), [items, safePage, pageSize]);
  return { page: safePage, pages, slice, setPage };
}

export function Pager({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (p: number) => void }) {
  const { t, fmt } = useI18n();
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-3 flex items-center justify-between gap-2 text-sm print:hidden">
      <span className="text-muted-foreground">
        {fmt.number(page)} / {fmt.number(pages)} · {fmt.number(total)}
      </span>
      <div className="flex gap-1">
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label={t("common.previous")}>
          <ChevronLeft className="rtl:rotate-180" />
        </Button>
        <Button variant="outline" size="icon" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label={t("common.next")}>
          <ChevronRight className="rtl:rotate-180" />
        </Button>
      </div>
    </nav>
  );
}
