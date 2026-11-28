"use client";

import * as React from "react";
import { MessageSquareText, Search, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { PageHeader } from "@/components/shared/page-header";
import { Pager, usePagination } from "@/components/shared/pager";
import { StarDisplay } from "@/components/shared/star-rating";
import { MEAL_TYPES, useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { ratingAverageByMeal } from "@/lib/stats";
import type { MealType } from "@/types";

const ALL = "__all";
const mealKey = (m: MealType) => m.toLowerCase() as "breakfast" | "lunch" | "dinner";

export default function AdminRatingsPage() {
  const { t, fmt } = useI18n();
  const { ratings } = useHostel();
  const [query, setQuery] = React.useState("");
  const [meal, setMeal] = React.useState<string>(ALL);
  const [stars, setStars] = React.useState<string>(ALL);
  const [onlyFeedback, setOnlyFeedback] = React.useState(false);

  const byMeal = React.useMemo(() => ratingAverageByMeal(ratings), [ratings]);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return ratings
      .filter((r) => (meal === ALL || r.mealType === meal) && (stars === ALL || r.stars === Number(stars)))
      .filter((r) => !onlyFeedback || r.feedback.trim().length > 0)
      .filter((r) => !q || r.residentName.toLowerCase().includes(q) || r.feedback.toLowerCase().includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [ratings, query, meal, stars, onlyFeedback]);
  const { page, pages, slice, setPage } = usePagination(rows, 12);

  return (
    <>
      <PageHeader title={t("admin.ratings")} subtitle={t("admin.ratingsDesc")} />

      <section aria-label={t("admin.averageByMeal")} className="mb-6 grid gap-3 sm:grid-cols-3">
        {byMeal.map((m) => (
          <Card key={m.mealType}>
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t(`meal.${mealKey(m.mealType)}`)}</p>
                <p className="text-2xl font-bold">{fmt.number(m.average, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</p>
                <p className="text-xs text-muted-foreground">
                  {fmt.number(m.count)} {t("menu.ratings")}
                </p>
              </div>
              <StarDisplay value={m.average} size="size-5" />
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem_9rem_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t("admin.searchRatings")}
            aria-label={t("common.search")}
            className="ps-9"
          />
        </div>
        <Select
          value={meal}
          onValueChange={(v) => {
            setMeal(v);
            setPage(1);
          }}
        >
          <SelectTrigger aria-label={t("common.meal")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("common.all")}</SelectItem>
            {MEAL_TYPES.map((m) => (
              <SelectItem key={m} value={m}>
                {t(`meal.${mealKey(m)}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={stars}
          onValueChange={(v) => {
            setStars(v);
            setPage(1);
          }}
        >
          <SelectTrigger aria-label={t("admin.starsFilter")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("common.all")}</SelectItem>
            {[5, 4, 3, 2, 1].map((s) => (
              <SelectItem key={s} value={String(s)}>
                {fmt.number(s)} ★
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 rounded-lg border px-3 text-sm font-medium">
          <Switch
            checked={onlyFeedback}
            onCheckedChange={(v) => {
              setOnlyFeedback(v);
              setPage(1);
            }}
          />
          <span className="whitespace-nowrap">{t("admin.onlyFeedback")}</span>
        </label>
      </div>

      <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
        {t("admin.totalRatings")}: <span className="font-semibold text-foreground">{fmt.number(rows.length)}</span>
      </p>

      {rows.length === 0 ? (
        <EmptyState title={ratings.length === 0 ? t("common.noData") : t("common.noResults")} icon={<Star className="size-6" />} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead>{t("common.meal")}</TableHead>
                <TableHead>{t("common.resident")}</TableHead>
                <TableHead>{t("menu.overallRating")}</TableHead>
                <TableHead>{t("admin.feedback")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{fmt.date(r.date, { day: "numeric", month: "short" })}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{t(`meal.${mealKey(r.mealType)}`)}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-medium">{r.residentName}</TableCell>
                  <TableCell>
                    <StarDisplay value={r.stars} />
                  </TableCell>
                  <TableCell className="max-w-sm">
                    {r.feedback.trim() ? (
                      <span className="flex items-start gap-2 text-sm">
                        <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        {r.feedback}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{t("admin.noFeedback")}</span>
                    )}
                  </TableCell>
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
