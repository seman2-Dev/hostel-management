"use client";

import * as React from "react";
import { MarketView } from "@/components/market/market-view";
import { PageHeader } from "@/components/shared/page-header";
import { useI18n } from "@/i18n";

export default function AdminMarketPage() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader title={t("admin.market")} subtitle={t("market.subtitle")} />
      <MarketView admin />
    </>
  );
}
