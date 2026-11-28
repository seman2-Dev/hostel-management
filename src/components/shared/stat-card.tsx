import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONES = {
  primary: { icon: "bg-primary/10 text-primary", rule: "bg-primary" },
  success: { icon: "bg-success/15 text-success", rule: "bg-success" },
  danger: { icon: "bg-danger/15 text-danger", rule: "bg-danger" },
  warning: { icon: "bg-warning/20 text-warning", rule: "bg-warning" },
  neutral: { icon: "bg-secondary text-secondary-foreground", rule: "bg-brass" },
} as const;

export function StatCard({
  label,
  value,
  icon,
  tone = "primary",
  hint,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  tone?: keyof typeof TONES;
  hint?: string;
}) {
  const styles = TONES[tone];
  return (
    <Card className="relative flex items-center gap-4 overflow-hidden p-4 sm:p-5">
      <span className={cn("absolute inset-x-0 top-0 h-0.5", styles.rule)} aria-hidden="true" />
      {icon && (
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5", styles.icon)} aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="line-clamp-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">{label}</p>
        <p className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{value}</p>
        {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </Card>
  );
}
