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
  { href: "/login", key: "nav.login" },
];

export function SiteFooter() {
  const { t, fmt } = useI18n();
  return (
    <footer className="print:hidden mt-16 border-t bg-muted/30">
      <div className="container grid gap-8 py-10 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-bold">{t("brand.name")}</span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">{t("footer.about")}</p>
        </div>
        <nav aria-label={t("footer.links")}>
          <p className="mb-3 text-sm font-semibold">{t("footer.links")}</p>
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
          <p className="mb-3 text-sm font-semibold">{t("footer.contact")}</p>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            {t("footer.address")}
          </p>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {fmt.digits(new Date().getFullYear())} {t("brand.name")} · {t("footer.rights")}
      </div>
    </footer>
  );
}
