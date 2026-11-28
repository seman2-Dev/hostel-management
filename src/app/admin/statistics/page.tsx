"use client";

import * as React from "react";
import { BedDouble, Calculator, Coins, Star, Utensils } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState, useSimulatedLoad } from "@/components/ui/states";
import { BarSeriesChart, LineSeriesChart } from "@/components/charts/charts";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { average, round2, sum } from "@/lib/utils";
import {
  currentMonth,
  dailyExpenses,
  hostelMealTrend,
  monthlyMealTotals,
  monthlyTotals,
  occupancyByFloor,
  previousMonth,
  ratingAverageByMeal,
} from "@/lib/stats";

type Range = "14" | "30";

export default function AdminStatisticsPage() {
  const { t, fmt } = useI18n();
  const { rooms, allBeds, residents, purchases, ratings } = useHostel();
  const loading = useSimulatedLoad(300);
  const [range, setRange] = React.useState<Range>("14");
  const days = Number(range);

  const trend = React.useMemo(() => hostelMealTrend(residents, days), [residents, days]);
  const expenses = React.useMemo(() => dailyExpenses(purchases, days), [purchases, days]);
  const byMeal = React.useMemo(() => ratingAverageByMeal(ratings), [ratings]);
  const occupancy = React.useMemo(() => occupancyByFloor(rooms), [rooms]);
  const monthlyMeals = React.useMemo(() => monthlyMealTotals(residents), [residents]);
  const monthlyMoney = React.useMemo(() => {
    const wanted = [previousMonth(), currentMonth()];
    const found = monthlyTotals(purchases);
    return wanted.map((month) => ({ month, total: Math.round(found.find((m) => m.month === month)?.total ?? 0) }));
  }, [purchases]);

  const distribution = React.useMemo(
    () => [5, 4, 3, 2, 1].map((s) => ({ stars: `${s}★`, count: ratings.filter((r) => r.stars === s).length })),
    [ratings],
  );
  const mealsByFloor = React.useMemo(
    () =>
      ([1, 2, 3] as const).map((floor) => {
        const occupied = rooms.filter((r) => r.floor === floor).flatMap((r) => r.beds).filter((b) => b.residentId);
        const on = occupied.filter((b) => b.mealOn).length;
        return { floor: t(`overview.floorsLabel.${floor}`), on, off: occupied.length - on };
      }),
    [rooms, t],
  );

  if (loading) return <LoadingState />;

  const occupied = allBeds.filter((b) => b.residentId).length;
  const avgMeals = Math.round(average(trend.map((d) => d.meals)));
  const avgExpense = round2(average(expenses.map((d) => d.total)));
  const overallRating = round2(average(ratings.map((r) => r.stars)));
  const shortDate = (v: string | number) => fmt.date(String(v), { day: "numeric", month: "short" });
  const monthName = (v: string | number) => fmt.date(`${v}-01`, { month: "long", year: "numeric" });

  return (
    <>
      <PageHeader
        title={t("admin.statistics")}
        subtitle={t("reports.statistics")}
        actions={
          <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
            <TabsList aria-label={t("reports.statistics")}>
              <TabsTrigger value="14">{t("reports.range14")}</TabsTrigger>
              <TabsTrigger value="30">{t("reports.range30")}</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("reports.avgMealsPerDay")} value={fmt.number(avgMeals)} icon={<Utensils />} tone="primary" />
        <StatCard label={t("reports.avgDaily")} value={fmt.currency(avgExpense)} icon={<Coins />} tone="warning" />
        <StatCard label={t("reports.avgRating")} value={fmt.number(overallRating, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} icon={<Star />} tone="success" hint={`${fmt.number(ratings.length)} ${t("menu.ratings")}`} />
        <StatCard
          label={t("reports.occupancy")}
          value={`${fmt.number(Math.round((occupied / allBeds.length) * 100))}%`}
          icon={<BedDouble />}
          tone="neutral"
          hint={`${fmt.number(occupied)} / ${fmt.number(allBeds.length)}`}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("reports.consumption")}</CardTitle>
          </CardHeader>
          <CardContent>
            <LineSeriesChart
              data={trend}
              xKey="date"
              series={[{ key: "meals", label: t("reports.mealsLabel") }]}
              ariaLabel={t("reports.consumption")}
              formatX={shortDate}
              formatY={(v) => fmt.number(v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("reports.expenseTrend")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BarSeriesChart
              data={expenses.map((d) => ({ date: d.date, total: Math.round(d.total) }))}
              xKey="date"
              series={[{ key: "total", label: t("market.totalPrice"), color: "#e0a526" }]}
              ariaLabel={t("reports.expenseTrend")}
              formatX={shortDate}
              formatY={(v) => fmt.currency(v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("reports.ratingsTrend")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BarSeriesChart
              data={byMeal.map((m) => ({ meal: t(`meal.${m.mealType.toLowerCase() as "breakfast" | "lunch" | "dinner"}`), average: m.average }))}
              xKey="meal"
              series={[{ key: "average", label: t("reports.avgRating"), color: "#e0a526" }]}
              ariaLabel={t("reports.ratingsTrend")}
              formatY={(v) => fmt.number(v, { maximumFractionDigits: 1 })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("reports.ratingDistribution")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BarSeriesChart
              data={distribution.map((d) => ({ stars: d.stars, count: d.count }))}
              xKey="stars"
              series={[{ key: "count", label: t("menu.ratings"), color: "#3b82f6" }]}
              ariaLabel={t("reports.ratingDistribution")}
              formatX={(v) => String(v).replace(/\d/, (d) => fmt.digits(d))}
              formatY={(v) => fmt.number(v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("reports.occupancy")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BarSeriesChart
              stacked
              data={occupancy.map((o) => ({ floor: t(`overview.floorsLabel.${o.floor}`), occupied: o.occupied, vacant: o.vacant }))}
              xKey="floor"
              series={[
                { key: "occupied", label: t("reports.occupiedLabel"), color: "#0f8f6f" },
                { key: "vacant", label: t("reports.vacantLabel"), color: "#94a3b8" },
              ]}
              ariaLabel={t("reports.occupancy")}
              formatY={(v) => fmt.number(v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("reports.mealsOnByFloor")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BarSeriesChart
              stacked
              data={mealsByFloor}
              xKey="floor"
              series={[
                { key: "on", label: t("room.mealOn"), color: "#16a34a" },
                { key: "off", label: t("room.mealOff"), color: "#dc2626" },
              ]}
              ariaLabel={t("reports.mealsOnByFloor")}
              formatY={(v) => fmt.number(v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t("reports.monthlyStats")} — {t("reports.mealsLabel")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarSeriesChart
              data={monthlyMeals.map((m) => ({ month: m.month, meals: m.meals }))}
              xKey="month"
              series={[{ key: "meals", label: t("reports.mealsLabel") }]}
              ariaLabel={`${t("reports.monthlyStats")} — ${t("reports.mealsLabel")}`}
              formatX={monthName}
              formatY={(v) => fmt.number(v)}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {t("reports.hostelTotal")}: {fmt.number(sum(monthlyMeals.map((m) => m.meals)))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t("reports.monthlyStats")} — {t("reports.monthCompare")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarSeriesChart
              data={monthlyMoney}
              xKey="month"
              series={[{ key: "total", label: t("reports.totalMonth"), color: "#e0a526" }]}
              ariaLabel={t("reports.monthCompare")}
              formatX={monthName}
              formatY={(v) => fmt.currency(v)}
            />
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Calculator className="size-3.5" aria-hidden="true" />
              {t("reports.mealCostNote")}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
