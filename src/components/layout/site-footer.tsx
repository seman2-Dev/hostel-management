"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { LogoMark } from "./logo";
import { useI18n, type TranslationKey } from "@/i18n";

const LINKS: Array<{ href: string; key: TranslationKey }> = [
  { href: "/overview", key: "nav.overview" },
  { href: "/menu", key: "nav.menu" },
  { href: "/market", key: "nav.market" },
  { href: "/announcements", key: "nav.announcements" },
  { href: "/verify", key: "nav.verify" },
  { href: "/login", key: "nav.login" },
];

export function SiteFooter() {
  const { t, fmt } = useI18n();
  return (
    <footer className="print:hidden mt-16 border-t border-border/70 bg-muted/25">
      <div className="h-0.5 w-full bg-gradient-to-r from-brass via-primary/60 to-transparent" aria-hidden="true" />
      <div className="container grid gap-8 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg border border-border/70 bg-card">
              <LogoMark className="size-6" />
            </span>
            <span className="font-semibold tracking-tight">{t("brand.name")}</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{t("footer.about")}</p>
          <p className="eyebrow">{t("brand.tagline")}</p>
        </div>
        <nav aria-label={t("footer.links")}>
          <p className="eyebrow mb-4">{t("footer.links")}</p>
          <ul className="space-y-2 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted-foreground hover:text-foreground focus-ring rounded">
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="eyebrow mb-4">{t("footer.contact")}</p>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            {t("footer.address")}
          </p>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {fmt.digits(new Date().getFullYear())} {t("brand.name")} · {t("footer.rights")}
      </div>
    </footer>
  );
}
