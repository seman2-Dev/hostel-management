"use client";

import * as React from "react";
import { CalendarDays, Coins, Eye, Pencil, Plus, Receipt, Search, ShoppingBasket, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, LoadingState, useSimulatedLoad } from "@/components/ui/states";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatCard } from "@/components/shared/stat-card";
import { BarSeriesChart } from "@/components/charts/charts";
import { DefaultItemsManager } from "./default-items-manager";
import { MARKET_CATEGORIES, PurchaseDialog } from "./purchase-dialog";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { totalCost } from "@/lib/hostel";
import { dailyExpenses } from "@/lib/stats";
import { daysAgoISO, todayISO } from "@/mocks/seed-utils";
import type { MarketCategory, MarketPurchase } from "@/types";

type CategoryFilter = MarketCategory | "ALL";

/** Daily market module. `admin` unlocks add / edit / delete and the default item list. */
export function MarketView({ admin = false }: { admin?: boolean }) {
  const { purchases, deletePurchase } = useHostel();
  const { t, pick, fmt } = useI18n();
  const loading = useSimulatedLoad(350);

  const [tab, setTab] = React.useState("list");
  const [date, setDate] = React.useState(todayISO());
  const [category, setCategory] = React.useState<CategoryFilter>("ALL");
  const [query, setQuery] = React.useState("");
  const [from, setFrom] = React.useState(daysAgoISO(13));
  const [to, setTo] = React.useState(todayISO());

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MarketPurchase | null>(null);
  const [deleting, setDeleting] = React.useState<MarketPurchase | null>(null);
  const [receipt, setReceipt] = React.useState<string | null>(null);

  const today = todayISO();
  const todays = React.useMemo(() => purchases.filter((p) => p.date === today), [purchases, today]);
  const avgDaily = React.useMemo(() => {
    const days = dailyExpenses(purchases, 30);
    return days.reduce((n, d) => n + d.total, 0) / days.length;
  }, [purchases]);

  const dayList = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return purchases
      .filter((p) => p.date === date)
      .filter((p) => category === "ALL" || p.category === category)
      .filter((p) => !q || p.nameEn.toLowerCase().includes(q) || p.nameBn.includes(query.trim()));
  }, [purchases, date, category, query]);

  const history = React.useMemo(() => {
    const rows = new Map<string, { date: string; total: number; items: number }>();
    for (const p of purchases) {
      if (p.date < from || p.date > to) continue;
      if (category !== "ALL" && p.category !== category) continue;
      const row = rows.get(p.date) ?? { date: p.date, total: 0, items: 0 };
      row.total += p.totalPrice;
      row.items += 1;
      rows.set(p.date, row);
    }
    return Array.from(rows.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [purchases, from, to, category]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  if (loading) return <LoadingState />;

  const categorySelect = (
    <Select value={category} onValueChange={(v) => setCategory(v as CategoryFilter)}>
      <SelectTrigger aria-label={t("common.category")} className="sm:w-52">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">{t("market.categoryAll")}</SelectItem>
        {MARKET_CATEGORIES.map((c) => (
          <SelectItem key={c} value={c}>
            {t(`market.cat.${c}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const chartData = [...history].reverse().map((h) => ({ date: h.date, total: Math.round(h.total) }));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("market.todayTotal")} value={fmt.currency(totalCost(todays))} icon={<Coins />} tone="primary" />
        <StatCard label={t("market.itemsBought")} value={fmt.number(todays.length)} icon={<ShoppingBasket />} tone="success" hint={t("common.today")} />
        <StatCard label={t("market.avgDaily")} value={fmt.currency(Math.round(avgDaily))} icon={<TrendingUp />} tone="warning" />
        <StatCard label={t("market.summary")} value={fmt.currency(totalCost(purchases.filter((p) => p.date.slice(0, 7) === today.slice(0, 7))))} icon={<CalendarDays />} tone="neutral" hint={t("reports.thisMonth")} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="list">{t("market.shoppingList")}</TabsTrigger>
            <TabsTrigger value="history">{t("market.history")}</TabsTrigger>
            {admin && <TabsTrigger value="defaults">{t("market.defaultItems")}</TabsTrigger>}
          </TabsList>
          {admin && (
            <Button onClick={openAdd}>
              <Plus />
              {t("market.addPurchase")}
            </Button>
          )}
        </div>

        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input type="date" value={date} max={daysAgoISO(-30)} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label={t("common.date")} className="sm:w-48" />
            {categorySelect}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("common.search")} aria-label={t("common.search")} className="ps-9" />
            </div>
          </div>

          {dayList.length === 0 ? (
            <EmptyState title={t("market.noPurchases")} icon={<ShoppingBasket className="size-6" />} action={admin ? <Button size="sm" onClick={openAdd}><Plus />{t("market.addPurchase")}</Button> : undefined} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("market.itemName")}</TableHead>
                  <TableHead>{t("common.category")}</TableHead>
                  <TableHead className="text-end">{t("common.quantity")}</TableHead>
                  <TableHead className="text-end">{t("market.unitPrice")}</TableHead>
                  <TableHead className="text-end">{t("market.totalPrice")}</TableHead>
                  <TableHead className="text-end">{t("market.receipt")}</TableHead>
                  {admin && <TableHead className="text-end">{t("common.actions")}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dayList.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium">{pick(p, "name")}</p>
                      {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{t(`market.cat.${p.category}`)}</TableCell>
                    <TableCell className="whitespace-nowrap text-end">
                      {fmt.number(p.quantity)} {t(`market.units.${p.unit}`)}
                    </TableCell>
                    <TableCell className="text-end">{fmt.currency(p.unitPrice)}</TableCell>
                    <TableCell className="text-end font-semibold">{fmt.currency(p.totalPrice)}</TableCell>
                    <TableCell className="text-end">
                      {p.receiptImage ? (
                        <Button variant="ghost" size="icon" aria-label={t("market.viewReceipt")} onClick={() => setReceipt(p.receiptImage)}>
                          <Receipt />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    {admin && (
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`${t("common.edit")}: ${pick(p, "name")}`}
                            onClick={() => {
                              setEditing(p);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil />
                          </Button>
                          <Button variant="ghost" size="icon" aria-label={`${t("common.delete")}: ${pick(p, "name")}`} onClick={() => setDeleting(p)}>
                            <Trash2 className="text-danger" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="font-semibold">
                    {t("common.total")} · {fmt.number(dayList.length)} {t("common.items")}
                  </TableCell>
                  <TableCell className="text-end text-base font-bold">{fmt.currency(totalCost(dayList))}</TableCell>
                  <TableCell colSpan={admin ? 2 : 1} />
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <label htmlFor="mk-from" className="text-sm text-muted-foreground">
                {t("common.from")}
              </label>
              <Input id="mk-from" type="date" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} className="w-40" />
              <label htmlFor="mk-to" className="text-sm text-muted-foreground">
                {t("common.to")}
              </label>
              <Input id="mk-to" type="date" value={to} min={from} onChange={(e) => e.target.value && setTo(e.target.value)} className="w-40" />
            </div>
            {categorySelect}
          </div>

          {history.length === 0 ? (
            <EmptyState title={t("common.noResults")} />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{t("market.byDay")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarSeriesChart
                    data={chartData}
                    xKey="date"
                    series={[{ key: "total", label: t("market.totalPrice") }]}
                    ariaLabel={t("market.byDay")}
                    formatX={(v) => fmt.date(String(v), { day: "numeric", month: "short" })}
                    formatY={(v) => fmt.currency(v)}
                  />
                </CardContent>
              </Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.date")}</TableHead>
                    <TableHead className="text-end">{t("market.itemsBought")}</TableHead>
                    <TableHead className="text-end">{t("market.totalPrice")}</TableHead>
                    <TableHead className="text-end">{t("common.view")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.date}>
                      <TableCell className="font-medium">{fmt.date(h.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</TableCell>
                      <TableCell className="text-end">{fmt.number(h.items)}</TableCell>
                      <TableCell className="text-end font-semibold">{fmt.currency(h.total)}</TableCell>
                      <TableCell className="text-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`${t("common.view")} ${fmt.date(h.date)}`}
                          onClick={() => {
                            setDate(h.date);
                            setTab("list");
                          }}
                        >
                          <Eye />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </TabsContent>

        {admin && (
          <TabsContent value="defaults">
            <DefaultItemsManager />
          </TabsContent>
        )}
      </Tabs>

      {admin && <PurchaseDialog open={formOpen} onOpenChange={setFormOpen} purchase={editing} />}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("market.deleteTitle")}
        description={t("market.deleteBody")}
        destructive
        confirmLabel={t("common.delete")}
        onConfirm={() => {
          if (deleting) deletePurchase(deleting.id);
          toast.success(t("market.deleted"));
        }}
      />

      <Dialog open={!!receipt} onOpenChange={(o) => !o && setReceipt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("market.receipt")}</DialogTitle>
          </DialogHeader>
          {receipt && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={receipt} alt={t("market.receipt")} className="max-h-[70vh] w-full rounded-lg object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
