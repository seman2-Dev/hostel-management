"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="container flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-bold">{t("states.notFoundTitle")}</h1>
      <p className="text-muted-foreground">{t("states.notFoundBody")}</p>
      <Button asChild>
        <Link href="/">{t("states.goHome")}</Link>
      </Button>
    </div>
  );
}
