"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="container gap-8 py-6 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:py-8">
      <aside className="mb-6 print:hidden lg:mb-0" aria-label={t("admin.modules")}>
        <nav className="lg:sticky lg:top-24">
          <p className="mb-2 hidden px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:block">{t("admin.title")}</p>
          <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {NAV.map((item) => (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-ring [&_svg]:size-4 [&_svg]:shrink-0",
                    isActive(item.href) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
      <div className="min-w-0">{children}</div>
    </div>
  );
}
