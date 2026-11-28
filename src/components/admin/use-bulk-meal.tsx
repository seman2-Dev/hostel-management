"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useHostel, type MealScope } from "@/store/hostel-store";
import { useI18n } from "@/i18n";

/** Bulk meal changes always go through a confirmation dialog that shows how many beds are affected. */
export function useBulkMeal() {
  const { countBedsInScope, bulkSetMeal } = useHostel();
  const { t } = useI18n();
  const [pending, setPending] = React.useState<{ scope: MealScope; on: boolean } | null>(null);
  const count = pending ? countBedsInScope(pending.scope) : 0;

  const dialog = (
    <ConfirmDialog
      open={!!pending}
      onOpenChange={(o) => !o && setPending(null)}
      title={t("meal.bulkTitle")}
      description={t("meal.bulkBody", { count })}
      confirmLabel={pending?.on ? t("meal.setOn") : t("meal.setOff")}
      destructive={pending ? !pending.on : false}
      onConfirm={() => {
        if (!pending) return;
        const n = bulkSetMeal(pending.scope, pending.on);
        toast.success(t("meal.bulkDone", { count: n }));
      }}
    />
  );

  return { request: (scope: MealScope, on: boolean) => setPending({ scope, on }), dialog };
}
