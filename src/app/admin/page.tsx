"use client";

import * as React from "react";
import Link from "next/link";
import { BedDouble, Building2, CalendarDays, Coins, DoorOpen, Layers, UserCheck, Users, Utensils, UtensilsCrossed, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingState, useSimulatedLoad } from "@/components/ui/states";
import { BarSeriesChart, LineSeriesChart } from "@/components/charts/charts";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { LastMonthSummary } from "@/components/admin/last-month-summary";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { useActivityText } from "@/components/admin/use-activity-text";
import { totalCost } from "@/lib/hostel";
import { dailyExpenses, hostelMealTrend, occupancyByFloor } from "@/lib/stats";
import { todayISO } from "@/mocks/seed-utils";

export default function AdminOverviewPage() {
  const { t, fmt } = useI18n();
  const { rooms, allBeds, residents, purchases, activity } = useHostel();
  const activityText = useActivityText();
  const loading = useSimulatedLoad(350);

  const trend = React.useMemo(() => hostelMealTrend(residents, 14), [residents]);
  const expenses = React.useMemo(() => dailyExpenses(purchases, 14), [purchases]);
  const occupancy = React.useMemo(() => occupancyByFloor(rooms), [rooms]);

  if (loading) return <LoadingState />;

  const today = todayISO();
  const occupied = allBeds.filter((b) => b.residentId);
  const mealsOn = occupied.filter((b) => b.mealOn).length;
  const month = today.slice(0, 7);

  return (
    <>
      <PageHeader title={t("admin.title")} subtitle={t("common.demoNote")} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label={t("admin.stats.floors")} value={fmt.number(3)} icon={<Layers />} tone="neutral" />
        <StatCard label={t("admin.stats.rooms")} value={fmt.number(rooms.length)} icon={<DoorOpen />} tone="neutral" />
        <StatCard label={t("admin.stats.beds")} value={fmt.number(allBeds.length)} icon={<BedDouble />} tone="neutral" />
        <StatCard label={t("admin.stats.occupied")} value={fmt.number(occupied.length)} icon={<Building2 />} tone="primary" />
        <StatCard label={t("admin.stats.available")} value={fmt.number(allBeds.length - occupied.length)} icon={<BedDouble />} tone="warning" />
        <StatCard label={t("admin.stats.members")} value={fmt.number(residents.length)} icon={<Users />} tone="primary" />
        <StatCard label={t("admin.stats.activeResidents")} value={fmt.number(residents.filter((r) => r.active).length)} icon={<UserCheck />} tone="primary" />
        <StatCard label={t("admin.stats.mealsActive")} value={fmt.number(mealsOn)} icon={<Utensils />} tone="success" />
        <StatCard label={t("admin.stats.mealsInactive")} value={fmt.number(occupied.length - mealsOn)} icon={<UtensilsCrossed />} tone="danger" />
        <StatCard label={t("admin.stats.marketToday")} value={fmt.currency(Math.round(totalCost(purchases.filter((p) => p.date === today))))} icon={<Coins />} tone="warning" />
        <StatCard label={t("admin.stats.marketMonth")} value={fmt.currency(Math.round(totalCost(purchases.filter((p) => p.date.startsWith(month)))))} icon={<Wallet />} tone="neutral" />
      </div>

      <div className="mt-6">
        <LastMonthSummary />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4 text-brass" />
            {t("admin.quickActions")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/admin/residents", label: t("admin.residents"), icon: <Users /> },
              { href: "/admin/rooms", label: t("admin.rooms"), icon: <DoorOpen /> },
              { href: "/admin/beds", label: t("admin.beds"), icon: <BedDouble /> },
              { href: "/admin/meals", label: t("admin.meals"), icon: <Utensils /> },
              { href: "/admin/menus", label: t("admin.menus"), icon: <CalendarDays /> },
              { href: "/admin/market", label: t("admin.market"), icon: <Coins /> },
              { href: "/admin/announcements", label: t("admin.announcements"), icon: <CalendarDays /> },
              { href: "/admin/settings", label: t("admin.settings"), icon: <Layers /> },
            ].map((action) => (
              <Button key={action.href} asChild variant="outline" className="justify-start shadow-none">
                <Link href={action.href}>
                  {action.icon}
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

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
              formatX={(v) => fmt.date(String(v), { day: "numeric", month: "short" })}
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
              formatX={(v) => fmt.date(String(v), { day: "numeric", month: "short" })}
              formatY={(v) => fmt.currency(v)}
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
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>{t("admin.activity")}</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/activity">
                <CalendarDays />
                {t("common.view")}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.action")}</TableHead>
                  <TableHead>{t("admin.at")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activity.slice(0, 5).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{activityText.action(a)}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{fmt.date(a.createdAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
