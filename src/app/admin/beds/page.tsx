"use client";

import * as React from "react";
import { BedsTable } from "@/components/admin/beds-table";
import { PageHeader } from "@/components/shared/page-header";
import { useI18n } from "@/i18n";

export default function AdminBedsPage() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader title={t("admin.beds")} subtitle={t("admin.bedsDesc")} />
      <BedsTable mode="manage" />
    </>
  );
}
