"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, Search, X } from "lucide-react";
import {
  BarChart3,
  BedDouble,
  Building2,
  ClipboardList,
  DoorOpen,
  History,
  Layers,
  LayoutDashboard,
  Megaphone,
  Receipt,
  Settings,
  ShoppingBasket,
  Star,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n, type TranslationKey } from "@/i18n";
import { cn } from "@/lib/utils";

const NAV: Array<{ href: string; key: TranslationKey; icon: React.ReactNode }> = [
  { href: "/admin", key: "admin.overview", icon: <LayoutDashboard /> },
  { href: "/admin/hostel", key: "admin.hostel", icon: <Building2 /> },
  { href: "/admin/floors", key: "admin.floors", icon: <Layers /> },
  { href: "/admin/rooms", key: "admin.rooms", icon: <DoorOpen /> },
  { href: "/admin/beds", key: "admin.beds", icon: <BedDouble /> },
  { href: "/admin/residents", key: "admin.residents", icon: <Users /> },
  { href: "/admin/meals", key: "admin.meals", icon: <UtensilsCrossed /> },
  { href: "/admin/menus", key: "admin.menus", icon: <ClipboardList /> },
  { href: "/admin/ratings", key: "admin.ratings", icon: <Star /> },
  { href: "/admin/announcements", key: "admin.announcements", icon: <Megaphone /> },
  { href: "/admin/market", key: "admin.market", icon: <ShoppingBasket /> },
  { href: "/admin/reports", key: "admin.reports", icon: <Receipt /> },
  { href: "/admin/statistics", key: "admin.statistics", icon: <BarChart3 /> },
  { href: "/admin/activity", key: "admin.activity", icon: <History /> },
  { href: "/admin/settings", key: "admin.settings", icon: <Settings /> },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const current = NAV.filter((item) => isActive(item.href)).sort((a, b) => b.href.length - a.href.length)[0];
  const visible = NAV.filter((item) => t(item.key).toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="container gap-8 py-6 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:py-8">
      <aside className="mb-4 print:hidden lg:mb-0" aria-label={t("admin.modules")}>
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            {open ? <X /> : <Menu />}
            {t("admin.modules")}
          </Button>
          <span className="truncate text-xs font-semibold text-brass">{current ? t(current.key) : t("admin.title")}</span>
        </div>
        <nav className={cn("rounded-2xl border border-border/60 bg-gradient-to-b from-primary/[0.07] via-card/60 to-card/80 p-3 shadow-panel backdrop-blur lg:sticky lg:top-24 dark:from-primary/[0.14]", open ? "block" : "hidden lg:block")}>
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("admin.globalSearch")}
              aria-label={t("admin.globalSearch")}
              className="ps-9"
            />
          </div>
          <p className="mb-2 hidden px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:block">{t("admin.title")}</p>
          <ul className="-mx-4 flex max-h-[70vh] gap-1 overflow-x-auto overflow-y-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {visible.length === 0 && <li className="px-3 py-2 text-xs text-muted-foreground">{t("common.noResults")}</li>}
            {visible.map((item) => (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-ring [&_svg]:size-4 [&_svg]:shrink-0",
                    isActive(item.href) ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
                  )}
                >
                  {item.icon}
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="min-w-0">
        <nav aria-label={t("admin.breadcrumb")} className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <Link href="/" className="rounded focus-ring hover:text-foreground">{t("nav.home")}</Link>
          <ChevronRight className="size-3" />
          <span className="font-medium text-foreground">{current ? t(current.key) : t("admin.title")}</span>
        </nav>
        {children}
      </div>
    </div>
  );
}
