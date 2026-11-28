"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { MarketView } from "@/components/market/market-view";
import { useAuth } from "@/store/auth";
import { useI18n } from "@/i18n";
import { isAdminRole } from "@/lib/roles";

export default function MarketPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  return (
    <div className="container py-8 sm:py-10">
      <PageHeader
        title={t("market.title")}
        subtitle={t("market.subtitle")}
        actions={
          isAdminRole(user?.role) ? (
            <Button asChild variant="outline">
              <Link href="/admin/market">
                <ShieldCheck />
                {t("admin.market")}
              </Link>
            </Button>
          ) : undefined
        }
      />
      <MarketView />
    </div>
  );
}
