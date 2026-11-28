"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Calculator, CalendarDays, Coins, Download, FileText, Printer, ReceiptText, Search, Settings2, Utensils, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, LoadingState, useSimulatedLoad } from "@/components/ui/states";
import { BarSeriesChart, DonutChart } from "@/components/charts/charts";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { useHostel } from "@/store/hostel-store";
import { useI18n, type TranslationKey } from "@/i18n";
import { downloadCsv } from "@/lib/files";
import { calculateMealCost, totalCost } from "@/lib/hostel";
import { categoryTotals, currentMonth, monthlyTotals, previousMonth, residentMonthlyMeals } from "@/lib/stats";
import { round2, sum } from "@/lib/utils";
import { todayISO } from "@/mocks/seed-utils";
import type { MarketCategory } from "@/types";

const pad = (n: number) => String(n).padStart(2, "0");

/** Number of days of `month` that should be counted (today's date for the current month). */
function daysInScope(month: string): number {
  if (month === currentMonth()) return new Date().getDate();
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

const FORMULA_KEY: Record<string, TranslationKey> = {
  PER_MEAL: "meal.formulaPerMeal",
  PER_DAY_MEALS: "meal.formulaPerDay",
  FIXED_PLUS_PER_MEAL: "meal.formulaFixed",
};

export default function AdminReportsPage() {
  const { t, fmt, locale } = useI18n();
  const { purchases, residents, settings, getBed } = useHostel();
  const loading = useSimulatedLoad(300);
  const months = React.useMemo(() => [currentMonth(), previousMonth()], []);
  const [month, setMonth] = React.useState(months[0]);
  const [tab, setTab] = React.useState("expenses");
  const [query, setQuery] = React.useState("");

  const monthLabel = (m: string) => fmt.date(`${m}-01`, { month: "long", year: "numeric" });
  const days = daysInScope(month);

  /* ------------------------------ expenses ------------------------------ */
  const monthPurchases = React.useMemo(() => purchases.filter((p) => p.date.startsWith(month)), [purchases, month]);
  const monthTotal = totalCost(monthPurchases);
  const daily = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const p of monthPurchases) map.set(p.date, (map.get(p.date) ?? 0) + p.totalPrice);
    return Array.from({ length: days }, (_, i) => {
      const date = `${month}-${pad(i + 1)}`;
      return { date, items: monthPurchases.filter((p) => p.date === date).length, total: round2(map.get(date) ?? 0) };
    });
  }, [monthPurchases, month, days]);
  const categories = React.useMemo(() => categoryTotals(monthPurchases), [monthPurchases]);
  const comparison = React.useMemo(() => monthlyTotals(purchases).filter((m) => months.includes(m.month)), [purchases, months]);

  /* ------------------------------ meals & billing ------------------------------ */
  const mealRows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return residentMonthlyMeals(residents, month)
      .map((r) => ({ ...r, cost: calculateMealCost(r.meals, r.days, settings) }))
      .filter((r) => !q || r.resident.name.toLowerCase().includes(q) || r.resident.nameBn.includes(query.trim()) || (r.resident.bedId ?? "").toLowerCase().includes(q))
      .sort((a, b) => (a.resident.bedId ?? "").localeCompare(b.resident.bedId ?? "", undefined, { numeric: true }));
  }, [residents, month, settings, query]);
  const totalMeals = sum(mealRows.map((r) => r.meals));
  const totalBilled = round2(sum(mealRows.map((r) => r.cost)));
  const residentName = (r: { name: string; nameBn: string }) => (locale === "bn" ? r.nameBn : r.name);

  if (loading) return <LoadingState />;

  const exportExpenses = () => {
    downloadCsv(`market-expenses-${month}.csv`, [
      ["Date", "Item (English)", "Item (বাংলা)", "Category", "Quantity", "Unit", "Unit price (BDT)", "Total (BDT)", "Note"],
      ...monthPurchases
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((p) => [p.date, p.nameEn, p.nameBn, p.category, p.quantity, p.unit, p.unitPrice, p.totalPrice, p.description]),
    ]);
    toast.success(t("reports.csvDone"));
  };

  const exportMeals = () => {
    downloadCsv(`meal-report-${month}.csv`, [
      ["Resident (English)", "Resident (বাংলা)", "Bed", "Meals", "Days with meals", "Cost (BDT)"],
      ...mealRows.map((r) => [r.resident.name, r.resident.nameBn, r.resident.bedId ?? "", r.meals, r.days, r.cost]),
      ["", "", "Total", totalMeals, "", totalBilled],
    ]);
    toast.success(t("reports.csvDone"));
  };

  const printPdf = () => {
    toast.info(t("reports.pdfDone"));
    window.setTimeout(() => window.print(), 250);
  };

  return (
    <>
      {/* Only visible on the printed / saved-as-PDF copy */}
      <div className="mb-4 hidden border-b pb-3 print:block">
        <p className="text-lg font-bold">{locale === "bn" ? settings.hostelNameBn : settings.hostelNameEn}</p>
        <p className="text-sm">
          {tab === "expenses" ? t("admin.reports") : t("reports.monthlyMeals")} — {monthLabel(month)}
        </p>
        <p className="text-xs text-muted-foreground">{t("reports.generatedOn", { date: fmt.date(todayISO()) })}</p>
      </div>

      <PageHeader
        title={t("reports.title")}
        subtitle={t("admin.reports")}
        actions={
          <>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger aria-label={t("reports.selectMonth")} className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>
                    {monthLabel(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={tab === "expenses" ? exportExpenses : exportMeals}>
              <Download />
              {t("common.exportCsv")}
            </Button>
            <Button onClick={printPdf}>
              <Printer />
              {t("common.exportPdf")}
            </Button>
          </>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="print:hidden">
          <TabsTrigger value="expenses">
            <ReceiptText className="me-2 size-4" aria-hidden="true" />
            {t("reports.expensesTab")}
          </TabsTrigger>
          <TabsTrigger value="meals">
            <Utensils className="me-2 size-4" aria-hidden="true" />
            {t("reports.mealsTab")}
          </TabsTrigger>
        </TabsList>

        {/* ------------------------------ Expenses ------------------------------ */}
        <TabsContent value="expenses" className="space-y-6">
          {monthPurchases.length === 0 ? (
            <EmptyState title={t("reports.noExpenses")} icon={<FileText className="size-6" />} />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label={t("reports.totalMonth")} value={fmt.currency(monthTotal)} icon={<Wallet />} tone="primary" />
                <StatCard label={t("reports.avgDaily")} value={fmt.currency(round2(monthTotal / days))} icon={<Calculator />} tone="warning" />
                <StatCard label={t("market.itemsBought")} value={fmt.number(monthPurchases.length)} icon={<ReceiptText />} tone="neutral" />
                <StatCard label={t("reports.activeDays")} value={fmt.number(daily.filter((d) => d.total > 0).length)} icon={<CalendarDays />} tone="success" />
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("reports.expenseTrend")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarSeriesChart
                      data={daily.map((d) => ({ date: d.date, total: Math.round(d.total) }))}
                      xKey="date"
                      series={[{ key: "total", label: t("market.totalPrice"), color: "#e0a526" }]}
                      ariaLabel={t("reports.expenseTrend")}
                      formatX={(v) => fmt.date(String(v), { day: "numeric", month: "short" })}
                      formatY={(v) => fmt.currency(v)}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("reports.categoryBreakdown")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DonutChart
                      data={categories.map((c) => ({ name: t(`market.cat.${c.category as MarketCategory}`), value: Math.round(c.total) }))}
                      ariaLabel={t("reports.categoryBreakdown")}
                      formatValue={(v) => fmt.currency(v)}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("reports.monthCompare")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarSeriesChart
                      data={comparison.map((m) => ({ month: m.month, total: Math.round(m.total) }))}
                      xKey="month"
                      series={[{ key: "total", label: t("reports.totalMonth") }]}
                      ariaLabel={t("reports.monthCompare")}
                      formatX={(v) => monthLabel(String(v))}
                      formatY={(v) => fmt.currency(v)}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("reports.categoryBreakdown")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("common.category")}</TableHead>
                          <TableHead className="text-end">{t("reports.share")}</TableHead>
                          <TableHead className="text-end">{t("market.totalPrice")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((c) => (
                          <TableRow key={c.category}>
                            <TableCell className="font-medium">{t(`market.cat.${c.category}`)}</TableCell>
                            <TableCell className="text-end text-muted-foreground">{fmt.number(round2((c.total / monthTotal) * 100), { maximumFractionDigits: 1 })}%</TableCell>
                            <TableCell className="text-end">{fmt.currency(c.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={2} className="font-semibold">
                            {t("common.total")}
                          </TableCell>
                          <TableCell className="text-end font-semibold">{fmt.currency(monthTotal)}</TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t("reports.dailyBreakdown")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[26rem] overflow-auto print:max-h-none print:overflow-visible">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("common.date")}</TableHead>
                          <TableHead className="text-end">{t("reports.itemsCount")}</TableHead>
                          <TableHead className="text-end">{t("market.totalPrice")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {daily
                          .slice()
                          .reverse()
                          .map((d) => (
                            <TableRow key={d.date}>
                              <TableCell>{fmt.date(d.date, { weekday: "short", day: "numeric", month: "short" })}</TableCell>
                              <TableCell className="text-end text-muted-foreground">{fmt.number(d.items)}</TableCell>
                              <TableCell className="text-end">{d.total ? fmt.currency(d.total) : "—"}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ------------------------------ Meals & billing ------------------------------ */}
        <TabsContent value="meals" className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label={t("reports.hostelTotal")} value={fmt.number(totalMeals)} icon={<Utensils />} tone="primary" />
            <StatCard label={t("reports.avgMealsPerDay")} value={fmt.number(Math.round(totalMeals / days))} icon={<Calculator />} tone="success" />
            <StatCard label={t("reports.totalBilled")} value={fmt.currency(totalBilled)} icon={<Coins />} tone="warning" />
            <StatCard
              label={t("reports.formulaInUse")}
              value={<span className="text-sm font-semibold leading-snug">{t(FORMULA_KEY[settings.billingFormula])}</span>}
              hint={`${t("meal.rate")}: ${fmt.currency(settings.mealRate)}`}
              icon={<Settings2 />}
              tone="neutral"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("reports.searchResident")} aria-label={t("common.search")} className="ps-9" />
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/settings">
                <Settings2 />
                {t("reports.changeRules")}
              </Link>
            </Button>
          </div>

          {mealRows.length === 0 ? (
            <EmptyState title={t("common.noResults")} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t("reports.perResident")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[32rem] overflow-auto print:max-h-none print:overflow-visible">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("common.resident")}</TableHead>
                        <TableHead>{t("common.bed")}</TableHead>
                        <TableHead className="text-end">{t("reports.mealsLabel")}</TableHead>
                        <TableHead className="text-end">{t("reports.activeDays")}</TableHead>
                        <TableHead className="text-end">{t("reports.costLabel")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mealRows.map((r) => (
                        <TableRow key={r.resident.id}>
                          <TableCell className="font-medium">{residentName(r.resident)}</TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">{r.resident.bedId ? getBed(r.resident.bedId)?.id : "—"}</TableCell>
                          <TableCell className="text-end">{fmt.number(r.meals)}</TableCell>
                          <TableCell className="text-end text-muted-foreground">{fmt.number(r.days)}</TableCell>
                          <TableCell className="text-end">{fmt.currency(r.cost)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={2} className="font-semibold">
                          {t("common.total")}
                        </TableCell>
                        <TableCell className="text-end font-semibold">{fmt.number(totalMeals)}</TableCell>
                        <TableCell />
                        <TableCell className="text-end font-semibold">{fmt.currency(totalBilled)}</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{t("reports.mealCostNote")}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
