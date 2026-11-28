"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { MenuView } from "@/components/menu/menu-view";
import { LoadingState, useSimulatedLoad } from "@/components/ui/states";
import { useI18n } from "@/i18n";

export default function MenuPage() {
  const { t } = useI18n();
  const loading = useSimulatedLoad(300);
  return (
    <div className="container py-8 sm:py-10">
      <PageHeader title={t("menu.title")} subtitle={t("menu.subtitle")} />
      {loading ? <LoadingState /> : <MenuView />}
    </div>
  );
}
