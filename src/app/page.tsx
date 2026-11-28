"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BedDouble, Building2, Radio, ShoppingBasket, Utensils, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { AnnouncementTicker } from "@/components/announcements/announcement-ticker";
import { HostelViewer } from "@/components/hostel/hostel-viewer";
import { MenuView } from "@/components/menu/menu-view";
import { StatCard } from "@/components/shared/stat-card";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { totalCost } from "@/lib/hostel";
import { todayISO } from "@/mocks/seed-utils";

function SectionHead({ title, subtitle, href, cta }: { title: string; subtitle?: string; href: string; cta: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href={href}>
          {cta}
          <ArrowRight className="rtl:rotate-180" />
        </Link>
      </Button>
    </div>
  );
}

export default function HomePage() {
  const { t, pick, fmt } = useI18n();
  const { allBeds, rooms, purchases } = useHostel();

  const occupied = allBeds.filter((b) => b.residentId);
  const mealsOn = occupied.filter((b) => b.mealOn).length;
  const todays = purchases.filter((p) => p.date === todayISO());

  return (
    <>
      <section className="border-b bg-gradient-to-b from-accent/70 to-background">
        <div className="container py-8 sm:py-12">
          <div className="mb-6 max-w-3xl space-y-4">
            <Badge className="gap-1.5">
              <Radio className="size-3" />
              {t("hero.badge")}
            </Badge>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{t("hero.title")}</h1>
            <p className="text-base text-muted-foreground sm:text-lg">{t("hero.subtitle")}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild size="lg">
                <Link href="/overview">
                  <Building2 />
                  {t("hero.ctaOverview")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/menu">
                  <Utensils />
                  {t("hero.ctaMenu")}
                </Link>
              </Button>
            </div>
          </div>

          <HostelViewer />
          <AnnouncementTicker className="mt-4" />
        </div>
      </section>

      <section className="container py-8 sm:py-10" aria-label={t("overview.title")}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t("admin.stats.beds")} value={fmt.number(allBeds.length)} icon={<BedDouble />} tone="neutral" hint={`${fmt.number(rooms.length)} ${t("admin.rooms")}`} />
          <StatCard label={t("admin.stats.occupied")} value={fmt.number(occupied.length)} icon={<Building2 />} tone="primary" />
          <StatCard label={t("admin.stats.mealsActive")} value={fmt.number(mealsOn)} icon={<Utensils />} tone="success" />
          <StatCard label={t("admin.stats.mealsInactive")} value={fmt.number(occupied.length - mealsOn)} icon={<UtensilsCrossed />} tone="danger" />
        </div>
      </section>

      <section className="container pb-8 sm:pb-10">
        <SectionHead title={t("menu.title")} subtitle={t("menu.subtitle")} href="/menu" cta={t("nav.menu")} />
        <MenuView compact />
      </section>

      <section className="container pb-12">
        <SectionHead title={t("market.title")} subtitle={t("market.subtitle")} href="/market" cta={t("nav.market")} />
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <ShoppingBasket className="size-4" />
                {t("market.todayTotal")}
              </CardTitle>
              <p className="text-3xl font-bold">{fmt.currency(totalCost(todays))}</p>
              <p className="text-sm text-muted-foreground">
                {fmt.number(todays.length)} {t("common.items")}
              </p>
            </CardHeader>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>{t("market.shoppingList")}</CardTitle>
            </CardHeader>
            <CardContent>
              {todays.length === 0 ? (
                <EmptyState title={t("market.noPurchases")} className="p-6" />
              ) : (
                <ul className="divide-y">
                  {todays.slice(0, 6).map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="min-w-0 truncate font-medium">{pick(p, "name")}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {fmt.number(p.quantity)} {t(`market.units.${p.unit}`)}
                      </span>
                      <span className="w-24 shrink-0 text-end font-semibold">{fmt.currency(p.totalPrice)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
