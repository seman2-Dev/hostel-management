"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { useHostel } from "@/store/hostel-store";
import { useAuth } from "@/store/auth";
import { useI18n } from "@/i18n";
import { MARKET_UNITS } from "./purchase-dialog";
import { todayISO } from "@/mocks/seed-utils";
import type { MarketUnit } from "@/types";

/** Residents submit what they bought; the monthly manager approves it into the shared list. */
export function PurchaseRequestDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { submitPurchaseRequest } = useHostel();
  const [itemName, setItemName] = React.useState("");
  const [quantity, setQuantity] = React.useState("1");
  const [unit, setUnit] = React.useState<MarketUnit>("kg");
  const [unitPrice, setUnitPrice] = React.useState("");
  const [date, setDate] = React.useState(todayISO());
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    if (!itemName.trim() || !(Number(quantity) > 0) || !(Number(unitPrice) > 0)) {
      setError(t("validation.required"));
      return;
    }
    setError("");
    submitPurchaseRequest({
      residentId: user.residentId ?? user.id,
      residentName: user.name,
      date,
      itemName: itemName.trim(),
      quantity: Number(quantity),
      unit,
      unitPrice: Number(unitPrice),
      note: note.trim(),
    });
    toast.success(t("market.requestSent"));
    setItemName("");
    setQuantity("1");
    setUnitPrice("");
    setNote("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("market.submitRequest")}</DialogTitle>
          <DialogDescription>{t("market.requestHint")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-4">
          {error && <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <FormField label={t("market.requestItem")} htmlFor="pr-item">
            <Input id="pr-item" value={itemName} onChange={(e) => setItemName(e.target.value)} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label={t("common.quantity")} htmlFor="pr-qty">
              <Input id="pr-qty" type="number" min="0" step="any" inputMode="decimal" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </FormField>
            <FormField label={t("common.unit")} htmlFor="pr-unit">
              <Select value={unit} onValueChange={(v) => setUnit(v as MarketUnit)}>
                <SelectTrigger id="pr-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARKET_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>{t(`market.units.${u}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={t("market.unitPrice")} htmlFor="pr-price">
              <Input id="pr-price" type="number" min="0" step="any" inputMode="decimal" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
            </FormField>
          </div>
          <FormField label={t("common.date")} htmlFor="pr-date">
            <Input id="pr-date" type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
          </FormField>
          <FormField label={t("market.requestNote")} htmlFor="pr-note">
            <Textarea id="pr-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit"><Send />{t("market.submitRequest")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
