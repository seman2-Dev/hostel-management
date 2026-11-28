import * as React from "react";
import { Coffee, Moon, Sun, UtensilsCrossed } from "lucide-react";
import type { MealType } from "@/types";
import { cn } from "@/lib/utils";

const FALLBACK: Record<MealType, { icon: React.ReactNode; bg: string }> = {
  BREAKFAST: { icon: <Coffee className="size-8" />, bg: "from-amber-200 to-orange-100 text-amber-800 dark:from-amber-900/50 dark:to-orange-900/30 dark:text-amber-200" },
  LUNCH: { icon: <Sun className="size-8" />, bg: "from-emerald-200 to-lime-100 text-emerald-800 dark:from-emerald-900/50 dark:to-lime-900/30 dark:text-emerald-200" },
  DINNER: { icon: <Moon className="size-8" />, bg: "from-indigo-200 to-sky-100 text-indigo-800 dark:from-indigo-900/50 dark:to-sky-900/30 dark:text-indigo-200" },
};

/** Shows the uploaded dish photo, or a tinted placeholder when no image has been uploaded yet. */
export function FoodImage({ src, mealType, alt, className }: { src: string; mealType: MealType; alt: string; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" className={cn("size-full object-cover", className)} />;
  }
  const f = FALLBACK[mealType] ?? { icon: <UtensilsCrossed className="size-8" />, bg: "from-muted to-muted" };
  return (
    <div className={cn("flex size-full items-center justify-center bg-gradient-to-br", f.bg, className)} role="img" aria-label={alt}>
      {f.icon}
    </div>
  );
}
