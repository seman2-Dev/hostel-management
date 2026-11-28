import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONES = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  danger: "bg-danger/15 text-danger",
  warning: "bg-warning/20 text-warning",
  neutral: "bg-secondary text-secondary-foreground",
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
  return (
    <Card className="flex items-center gap-4 p-4">
      {icon && (
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5", TONES[tone])} aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="line-clamp-2 text-xs font-medium leading-snug text-muted-foreground sm:text-sm">{label}</p>
        <p className="truncate text-lg font-bold leading-tight sm:text-xl 2xl:text-2xl">{value}</p>
        {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </Card>
  );
}
