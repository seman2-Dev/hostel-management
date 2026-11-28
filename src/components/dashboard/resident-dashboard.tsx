"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BedDouble, Building, CalendarCheck, Check, DoorOpen, Receipt, Utensils, Wallet, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, LoadingState, useSimulatedLoad } from "@/components/ui/states";
import { AnnouncementTicker } from "@/components/announcements/announcement-ticker";
import { STYLE_META } from "@/components/announcements/announcement-style";
import { BarSeriesChart } from "@/components/charts/charts";
import { MenuView } from "@/components/menu/menu-view";
import { PageHeader } from "@/components/shared/page-header";
import { StarDisplay } from "@/components/shared/star-rating";
import { StatCard } from "@/components/shared/stat-card";
import { useAuth } from "@/store/auth";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { bedStatus, calculateMealCost, daysWithAnyMeal, mealHistoryFor, monthOf, countMeals, totalCost, visibleAnnouncements } from "@/lib/hostel";
import { dailyExpenses } from "@/lib/stats";
import { todayISO } from "@/mocks/seed-utils";

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function Mark({ on }: { on: boolean }) {
  return on ? <Check className="mx-auto size-4 text-success" aria-label="✓" /> : <X className="mx-auto size-4 text-muted-foreground/60" aria-label="–" />;
}

export function ResidentDashboard() {
  const { user } = useAuth();
  const { t, pick, fmt } = useI18n();
  const { residents, getBed, getResident, setBedMeal, settings, ratings, announcements, purchases } = useHostel();
  const loading = useSimulatedLoad(400);

  const resident = getResident(user?.residentId);
  const bed = resident?.bedId ? getBed(resident.bedId) : undefined;
  void residents;

  const history = React.useMemo(() => (resident ? mealHistoryFor(resident, 62) : []), [resident]);
  const month = todayISO().slice(0, 7);
  const monthEntries = history.filter((e) => monthOf(e.date) === month);
  const mealsThisMonth = countMeals(monthEntries);
  const daysThisMonth = daysWithAnyMeal(monthEntries);
  const estimated = calculateMealCost(mealsThisMonth, daysThisMonth, settings);
  const chartData = [...history.slice(0, 14)].reverse().map((e) => ({ date: e.date, meals: Number(e.breakfast) + Number(e.lunch) + Number(e.dinner) }));
  const myRatings = ratings.filter((r) => r.residentId === resident?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const expenses = dailyExpenses(purchases, 7);
  const news = visibleAnnouncements(announcements).slice(0, 4);

  if (loading) return <LoadingState />;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const turningOff = bed?.mealOn ?? false;
  const deadline = turningOff ? settings.cancelDeadline : settings.activateDeadline;
  const beforeDeadline = nowMin < minutesOf(deadline);
  const canToggle = !!bed && !!resident?.active && beforeDeadline;

  const deadlineLabel = (hhmm: string) => fmt.time(new Date(2000, 0, 1, ...(hhmm.split(":").map(Number) as [number, number])));

  const toggle = (on: boolean) => {
    if (!bed || !resident) return;
    if (!canToggle) {
      toast.error(t("meal.deadlinePassed"));
      return;
    }
    setBedMeal(bed.id, on, resident.name);
    toast.success(on ? t("meal.turnedOn") : t("meal.turnedOff"));
  };

  const status = bed ? bedStatus(bed) : "UNASSIGNED";

  return (
    <div className="container space-y-6 py-8 sm:py-10">
      <PageHeader title={t("dashboard.welcome", { name: resident ? pick(resident, "name") : (user?.name ?? "") })} subtitle={t("dashboard.readOnly")} />

      {!bed && (
        <div role="status" className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm font-medium">
          {t("dashboard.notAssigned")}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("dashboard.myFloor")} value={bed ? t(`overview.floorsLabel.${bed.floor}`) : "—"} icon={<Building />} tone="neutral" />
        <StatCard label={t("dashboard.myRoom")} value={bed ? fmt.digits(bed.roomNumber) : "—"} icon={<DoorOpen />} tone="primary" />
        <StatCard label={t("dashboard.myBed")} value={bed ? fmt.digits(bed.id) : "—"} icon={<BedDouble />} tone="warning" />
        <Card className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">{t("dashboard.myMeal")}</p>
            <Badge variant={status === "ON" ? "success" : status === "OFF" ? "danger" : "secondary"} className="mt-1 text-sm">
              {status === "ON" ? t("room.mealOn") : status === "OFF" ? t("room.mealOff") : t("room.unassigned")}
            </Badge>
          </div>
          <Switch checked={bed?.mealOn ?? false} onCheckedChange={toggle} disabled={!bed || !resident?.active} aria-label={t("meal.toggle")} />
        </Card>
      </div>
      {bed && (
        <p className="-mt-3 text-xs text-muted-foreground" aria-live="polite">
          {turningOff ? t("meal.deadlineCancel") : t("meal.deadlineActivate")} {deadlineLabel(deadline)}
          {!beforeDeadline && ` · ${t("meal.deadlinePassed")}`}
        </p>
      )}

      <AnnouncementTicker />

      <Tabs defaultValue="overview">
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="overview">{t("dashboard.overviewTab")}</TabsTrigger>
          <TabsTrigger value="history">{t("dashboard.historyTab")}</TabsTrigger>
          <TabsTrigger value="ratings">{t("dashboard.ratingsTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label={t("dashboard.mealsConsumed")} value={fmt.number(mealsThisMonth)} icon={<Utensils />} tone="success" hint={t("reports.thisMonth")} />
            <StatCard label={t("dashboard.daysOn")} value={fmt.number(daysThisMonth)} icon={<CalendarCheck />} tone="primary" hint={t("reports.thisMonth")} />
            <StatCard label={t("dashboard.estimatedCost")} value={fmt.currency(estimated)} icon={<Wallet />} tone="warning" hint={`${t("meal.rate")}: ${fmt.currency(settings.mealRate)}`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.monthlyStats")}</CardTitle>
                <CardDescription>{t("meal.history")}</CardDescription>
              </CardHeader>
              <CardContent>
                <BarSeriesChart
                  data={chartData}
                  xKey="date"
                  series={[{ key: "meals", label: t("reports.mealsLabel") }]}
                  ariaLabel={t("dashboard.monthlyStats")}
                  formatX={(v) => fmt.date(String(v), { day: "numeric", month: "short" })}
                  formatY={(v) => fmt.number(v)}
                  height={220}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="size-4" />
                  {t("dashboard.marketExpenses")}
                </CardTitle>
                <CardDescription>
                  {t("market.todayTotal")}: <span className="font-semibold text-foreground">{fmt.currency(totalCost(purchases.filter((p) => p.date === todayISO())))}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarSeriesChart
                  data={expenses.map((d) => ({ date: d.date, total: Math.round(d.total) }))}
                  xKey="date"
                  series={[{ key: "total", label: t("market.totalPrice"), color: "#e0a526" }]}
                  ariaLabel={t("dashboard.marketExpenses")}
                  formatX={(v) => fmt.date(String(v), { day: "numeric", month: "short" })}
                  formatY={(v) => fmt.currency(v)}
                  height={220}
                />
              </CardContent>
            </Card>
          </div>

          <section aria-labelledby="res-menu">
            <h2 id="res-menu" className="mb-3 text-xl font-bold">
              {t("dashboard.todayMenu")}
            </h2>
            <MenuView />
          </section>

          <section aria-labelledby="res-news">
            <h2 id="res-news" className="mb-3 text-xl font-bold">
              {t("dashboard.recentAnnouncements")}
            </h2>
            {news.length === 0 ? (
              <EmptyState title={t("announcements.none")} />
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {news.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 rounded-xl border bg-card p-3">
                    <Badge variant={STYLE_META[a.style].badge} className="shrink-0 gap-1">
                      {STYLE_META[a.style].icon}
                      {t(STYLE_META[a.style].labelKey)}
                    </Badge>
                    <p className="text-sm font-medium">{pick(a, "title")}</p>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="link" className="mt-1 px-0">
              <Link href="/announcements">{t("nav.announcements")}</Link>
            </Button>
          </section>
        </TabsContent>

        <TabsContent value="history">
          {history.length === 0 ? (
            <EmptyState title={t("common.noData")} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead className="text-center">{t("meal.breakfast")}</TableHead>
                  <TableHead className="text-center">{t("meal.lunch")}</TableHead>
                  <TableHead className="text-center">{t("meal.dinner")}</TableHead>
                  <TableHead className="text-end">{t("common.total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.slice(0, 30).map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap font-medium">{fmt.date(e.date, { weekday: "short", day: "numeric", month: "short" })}</TableCell>
                    <TableCell><Mark on={e.breakfast} /></TableCell>
                    <TableCell><Mark on={e.lunch} /></TableCell>
                    <TableCell><Mark on={e.dinner} /></TableCell>
                    <TableCell className="text-end font-semibold">{fmt.number(Number(e.breakfast) + Number(e.lunch) + Number(e.dinner))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="ratings">
          {myRatings.length === 0 ? (
            <EmptyState title={t("dashboard.noRatings")} icon={<Utensils className="size-6" />} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("common.meal")}</TableHead>
                  <TableHead>{t("menu.yourRating")}</TableHead>
                  <TableHead>{t("admin.feedback")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRatings.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap">{fmt.date(r.date)}</TableCell>
                    <TableCell>{t(`meal.${r.mealType.toLowerCase() as "breakfast" | "lunch" | "dinner"}`)}</TableCell>
                    <TableCell><StarDisplay value={r.stars} /></TableCell>
                    <TableCell className="text-muted-foreground">{r.feedback || t("admin.noFeedback")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
