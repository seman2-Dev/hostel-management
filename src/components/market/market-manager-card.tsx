"use client";

import * as React from "react";
import { Crown, UserRoundCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { todayISO } from "@/mocks/seed-utils";
import { cn } from "@/lib/utils";

/** Monthly market manager: chosen by an admin, visible to everybody. */
export function MarketManagerCard({ admin = false }: { admin?: boolean }) {
  const { t, fmt, pick } = useI18n();
  const { residents, marketManagerByMonth, setMarketManager } = useHostel();
  const [month, setMonth] = React.useState(todayISO().slice(0, 7));
  const managerId = marketManagerByMonth[month];
  const manager = managerId ? residents.find((r) => r.id === managerId) : undefined;
  const activeResidents = residents.filter((r) => r.active);

  return (
    <section className={cn("relative overflow-hidden rounded-2xl border border-brass/30 bg-gradient-to-r from-brass/[0.10] via-card/80 to-primary/[0.06] p-4 shadow-panel sm:p-5")} aria-label={t("market.managerOfMonth")}>
      <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brass via-primary to-transparent" aria-hidden="true" />
      <div className="flex flex-wrap items-center gap-4">
        {manager ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={manager.photo} alt="" className="size-14 rounded-full border-2 border-brass/50 object-cover" />
        ) : (
          <span className="grid size-14 place-items-center rounded-full border border-dashed border-border text-muted-foreground">
            <UserRoundCheck className="size-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="section-kicker !mb-1">{t("market.managerOfMonth")}</p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold tracking-tight">{manager ? pick(manager, "name") : t("market.noManager")}</p>
            {manager && (
              <Badge variant="outline" className="border-brass/40 text-brass">
                <Crown className="size-3" />
                {fmt.date(`${month}-01`, { month: "long", year: "numeric" })}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("market.managerHint")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input type="month" value={month} max={todayISO().slice(0, 7)} onChange={(e) => e.target.value && setMonth(e.target.value)} aria-label={t("reports.month")} className="w-40" />
          {admin && (
            <Select value={managerId ?? "__none"} onValueChange={(v) => setMarketManager(month, v === "__none" ? null : v)}>
              <SelectTrigger aria-label={t("market.assignManager")} className="w-52">
                <SelectValue placeholder={t("market.selectManager")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">{t("market.noManager")}</SelectItem>
                {activeResidents.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {pick(r, "name")} · {r.studentId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </section>
  );
}
