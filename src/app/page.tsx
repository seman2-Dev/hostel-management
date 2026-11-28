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
import { MealSchedule } from "@/components/meal/meal-schedule";
import { HostelVerification } from "@/components/shared/hostel-verification";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { totalCost } from "@/lib/hostel";
import { todayISO } from "@/mocks/seed-utils";

function SectionHead({ index, title, subtitle, href, cta }: { index: string; title: string; subtitle?: string; href: string; cta: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-4">
      <div>
        <p className="section-kicker">{index}</p>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
      </div>
      <Button asChild variant="outline" size="sm" className="shadow-none">
        <Link href={href}>
          {cta}
          <ArrowRight className="rtl:rotate-180" />
        </Link>
      </Button>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="metric-value text-primary">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

export default function HomePage() {
  const { t, pick, fmt } = useI18n();
  const { allBeds, rooms, purchases } = useHostel();

  const occupied = allBeds.filter((b) => b.residentId);
  const mealsOn = occupied.filter((b) => b.mealOn).length;
  const todays = purchases.filter((p) => p.date === todayISO());
  const floorCount = new Set(rooms.map((r) => r.floor)).size;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="pointer-events-none absolute inset-0 bg-aurora" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 bg-dot-grid bg-dots opacity-[0.35] [mask-image:radial-gradient(70%_60%_at_60%_30%,black,transparent)]"
          aria-hidden="true"
        />
        <span className="pointer-events-none absolute -right-6 -top-16 select-none text-[16rem] font-black leading-none tracking-tighter text-primary/[0.045] sm:text-[22rem]" aria-hidden="true">
          1963
        </span>

        <div className="container relative grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-16">
          <div className="max-w-xl space-y-7">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-card/70 px-3.5 py-1.5 shadow-panel backdrop-blur">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-success" />
              </span>
              <span className="eyebrow !text-primary">{t("hero.eyebrow")}</span>
            </div>

            <div>
              <div className="gold-rule mb-6" aria-hidden="true" />
              <h1 className="display-title">
                <span className="gradient-text">{t("hero.title")}</span>
              </h1>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">{t("hero.subtitle")}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="shine">
                <Link href="/overview">
                  <Building2 />
                  {t("hero.ctaOverview")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="shadow-none backdrop-blur">
                <Link href="/menu">
                  <Utensils />
                  {t("hero.ctaMenu")}
                </Link>
              </Button>
            </div>

            <div className="grid max-w-lg grid-cols-3 divide-x divide-border/70 border-y border-border/70 py-6">
              <Fact label={t("hero.facts.floors")} value={fmt.digits(floorCount)} />
              <Fact label={t("hero.facts.rooms")} value={fmt.digits(rooms.length)} />
              <Fact label={t("hero.facts.beds")} value={fmt.digits(allBeds.length)} />
            </div>
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <span className="font-serif text-3xl leading-none text-brass">“</span>
              {t("hero.statement")}
            </p>
          </div>

          <div className="relative">
            <span className="orb -left-6 top-6 size-32" aria-hidden="true" />
            <span className="orb -right-4 bottom-10 size-44 border-brass/25" aria-hidden="true" />
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-violet-500/10 to-brass/20 blur-2xl" aria-hidden="true" />
            <div className="glass-card relative p-2.5 shadow-lift sm:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1.5">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-success shadow-[0_0_0_5px_hsl(var(--success)/0.15)]" aria-hidden="true" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{t("hero.viewerLabel")}</span>
                </div>
                <Badge className="gap-1.5 bg-primary/10 text-primary">
                  <Radio className="size-3" />
                  {t("hero.badge")}
                </Badge>
              </div>
              <div className="overflow-hidden rounded-xl border border-border/60 bg-card/60">
                <HostelViewer />
              </div>
              <div className="hairline my-3" aria-hidden="true" />
              <AnnouncementTicker />
            </div>
            <div className="absolute -bottom-5 -left-3 hidden items-center gap-2 rounded-xl border border-border/70 bg-card/90 px-3 py-2 shadow-lift backdrop-blur sm:flex">
              <BedDouble className="size-4 text-brass" />
              <span className="text-xs font-semibold">{fmt.digits(rooms.length)} {t("hero.facts.rooms")}</span>
            </div>
            <span className="pointer-events-none absolute -left-2 -top-2 size-7 border-l-2 border-t-2 border-primary/60" aria-hidden="true" />
            <span className="pointer-events-none absolute -bottom-2 -right-2 size-7 border-b-2 border-r-2 border-brass/60" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="container py-10 sm:py-12" aria-label={t("overview.title")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t("admin.stats.beds")} value={fmt.number(allBeds.length)} icon={<BedDouble />} tone="neutral" hint={`${fmt.number(rooms.length)} ${t("admin.rooms")}`} />
          <StatCard label={t("admin.stats.occupied")} value={fmt.number(occupied.length)} icon={<Building2 />} tone="primary" />
          <StatCard label={t("admin.stats.mealsActive")} value={fmt.number(mealsOn)} icon={<Utensils />} tone="success" />
          <StatCard label={t("admin.stats.mealsInactive")} value={fmt.number(occupied.length - mealsOn)} icon={<UtensilsCrossed />} tone="danger" />
        </div>
      </section>

      <section className="container grid gap-4 pb-10 sm:pb-12 lg:grid-cols-2">
        <MealSchedule compact />
        <HostelVerification compact />
      </section>

      <section className="container pb-10 sm:pb-12">
        <SectionHead index={fmt.digits("01")} title={t("menu.title")} subtitle={t("menu.subtitle")} href="/menu" cta={t("nav.menu")} />
        <MenuView compact />
      </section>

      <section className="container pb-14">
        <SectionHead index={fmt.digits("02")} title={t("market.title")} subtitle={t("market.subtitle")} href="/market" cta={t("nav.market")} />
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="relative overflow-hidden lg:col-span-1">
            <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary to-brass" aria-hidden="true" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <ShoppingBasket className="size-4 text-brass" />
                {t("market.todayTotal")}
              </CardTitle>
              <p className="metric-value mt-2">{fmt.currency(totalCost(todays))}</p>
              <p className="text-sm text-muted-foreground">
                {fmt.number(todays.length)} {t("common.items")}
              </p>
            </CardHeader>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="section-kicker">{t("market.title")}</div>
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
