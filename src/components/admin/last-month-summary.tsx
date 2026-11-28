"use client";

import { CalendarRange, ShoppingBasket, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { monthlyMealTotals, monthlyTotals, previousMonth } from "@/lib/stats";

/** Previous-month market spend and meals consumed — a quick closing report for admins. */
export function LastMonthSummary() {
  const { t, fmt } = useI18n();
  const { purchases, residents } = useHostel();
  const month = previousMonth();
  const market = monthlyTotals(purchases).find((m) => m.month === month)?.total ?? 0;
  const meals = monthlyMealTotals(residents).find((m) => m.month === month)?.meals ?? 0;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-brass/30 bg-gradient-to-r from-brass/[0.12] via-card/80 to-primary/[0.06] p-4 shadow-panel sm:p-5" aria-labelledby="last-month-title">
      <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brass via-primary to-transparent" aria-hidden="true" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker !mb-1">{t("admin.lastMonth")}</p>
          <h2 id="last-month-title" className="text-lg font-semibold tracking-tight">{fmt.date(`${month}-01`, { month: "long", year: "numeric" })}</h2>
        </div>
        <Badge variant="outline" className="border-brass/40 text-brass">
          <CalendarRange className="size-3" />
          {fmt.digits(month)}
        </Badge>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/50 p-3">
          <span className="grid size-10 place-items-center rounded-lg bg-brass/15 text-brass"><ShoppingBasket className="size-5" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("admin.lastMonthMarket")}</p>
            <p className="metric-value text-primary">{fmt.currency(market)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/50 p-3">
          <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><Utensils className="size-5" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("admin.lastMonthMeals")}</p>
            <p className="metric-value text-primary">{fmt.number(meals)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
