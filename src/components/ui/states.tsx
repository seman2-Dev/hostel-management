"use client";

import * as React from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { Button } from "./button";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

export function EmptyState({
  title,
  hint,
  icon,
  action,
  className,
}: {
  title?: string;
  hint?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-10 text-center", className)}>
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Inbox className="size-6" />}
      </div>
      <p className="font-semibold">{title ?? t("states.emptyTitle")}</p>
      {hint && <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  const { t } = useI18n();
  return (
    <div role="alert" className={cn("flex flex-col items-center justify-center gap-2 rounded-xl border border-danger/40 bg-danger/5 p-10 text-center", className)}>
      <AlertTriangle className="size-8 text-danger" />
      <p className="font-semibold">{t("states.errorTitle")}</p>
      <p className="text-sm text-muted-foreground">{t("states.errorHint")}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("common.retry")}
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ label, className }: { label?: string; className?: string }) {
  const { t } = useI18n();
  return (
    <div role="status" aria-live="polite" className={cn("flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground", className)}>
      <Loader2 className="size-4 animate-spin" />
      {label ?? t("common.loading")}
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28" />
      ))}
    </div>
  );
}

/** Simulates network latency so loading states are demonstrable in Phase 1. */
export function useSimulatedLoad(ms = 450): boolean {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(id);
  }, [ms]);
  return loading;
}
