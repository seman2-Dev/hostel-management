"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogIn, LogOut, Menu, ShieldCheck, User as UserIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogoMark } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { NotificationBell } from "./notification-bell";
import { useAuth } from "@/store/auth";
import { useI18n, type TranslationKey } from "@/i18n";
import { cn } from "@/lib/utils";
import { isAdminRole } from "@/lib/roles";

const NAV: Array<{ href: string; key: TranslationKey }> = [
  { href: "/", key: "nav.home" },
  { href: "/overview", key: "nav.overview" },
  { href: "/menu", key: "nav.menu" },
  { href: "/market", key: "nav.market" },
  { href: "/announcements", key: "nav.announcements" },
  { href: "/verify", key: "nav.verify" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const dashboardHref = isAdminRole(user?.role) ? "/admin" : "/dashboard";
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const handleLogout = () => {
    logout();
    toast.success(t("auth.loggedOut"));
    router.push("/");
  };

  const navLinks = [
    ...NAV,
    ...(user
      ? [
          { href: dashboardHref, key: "nav.dashboard" as TranslationKey },
          { href: "/profile", key: "nav.profile" as TranslationKey },
        ]
      : []),
  ];

  return (
    <header className="print:hidden sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-violet-500 to-brass" aria-hidden="true" />
      <div className="container flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-lg focus-ring" aria-label={t("brand.name")}>
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-glow">
            <LogoMark className="size-7" />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold tracking-tight sm:text-[15px]">{t("brand.name")}</span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-brass sm:block">{t("brand.established")}</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-all focus-ring",
                isActive(item.href)
                  ? "bg-primary/10 text-primary shadow-[inset_0_-2px_0_hsl(var(--primary))]"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 border-l border-border/70 pl-2.5">
          <LanguageToggle />
          <ThemeToggle />
          {user && <NotificationBell />}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label={t("nav.profile")} className="hidden sm:inline-flex">
                  <UserIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user.name}
                  <span className="block font-normal">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push("/profile")}>
                  <UserIcon />
                  {t("nav.profile")}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push(dashboardHref)}>
                  {isAdminRole(user.role) ? <ShieldCheck /> : <LayoutDashboard />}
                  {isAdminRole(user.role) ? t("nav.adminPanel") : t("nav.myDashboard")}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex shine">
              <Link href="/login">
                <LogIn />
                {t("nav.login")}
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="xl:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? t("nav.menuClose") : t("nav.menuOpen")} onClick={() => setOpen((v) => !v)}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t bg-background xl:hidden"
          >
            <div className="container flex flex-col gap-1 py-3">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-3 text-base font-medium focus-ring",
                    isActive(item.href) ? "bg-primary/10 text-primary shadow-[inset_2px_0_0_hsl(var(--brass))]" : "hover:bg-muted",
                  )}
                >
                  {t(item.key)}
                </Link>
              ))}
              <div className="mt-2 border-t pt-3">
                {user ? (
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    <LogOut />
                    {t("nav.logout")}
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/login">
                      <LogIn />
                      {t("nav.login")}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
