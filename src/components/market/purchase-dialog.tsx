"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { ImageUpload } from "@/components/shared/image-upload";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { purchaseTotal } from "@/lib/hostel";
import { uid } from "@/lib/utils";
import { todayISO } from "@/mocks/seed-utils";
import type { MarketCategory, MarketPurchase, MarketUnit } from "@/types";

export const MARKET_CATEGORIES: MarketCategory[] = ["GRAIN", "VEGETABLE", "PROTEIN", "DAIRY_EGG", "OIL_SPICE", "OTHER"];
export const MARKET_UNITS: MarketUnit[] = ["kg", "gram", "liter", "piece", "packet", "dozen"];

const num = z.number({ required_error: "validation.positive", invalid_type_error: "validation.positive" }).positive("validation.positive").max(1_000_000, "validation.positive");

const schema = z.object({
  itemId: z.string(),
  nameEn: z.string().trim().min(1, "validation.required").max(80, "validation.minLength"),
  nameBn: z.string().trim().max(80, "validation.minLength").optional(),
  category: z.enum(["GRAIN", "VEGETABLE", "PROTEIN", "DAIRY_EGG", "OIL_SPICE", "OTHER"]),
  quantity: num,
  unit: z.enum(["kg", "gram", "liter", "piece", "packet", "dozen"]),
  unitPrice: num,
  date: z.string().min(1, "validation.required"),
  description: z.string().trim().max(200, "validation.minLength").optional(),
});
type FormValues = z.infer<typeof schema>;

const CUSTOM = "custom";

function PurchaseForm({ purchase, onDone }: { purchase: MarketPurchase | null; onDone: () => void }) {
  const { marketItems, savePurchase } = useHostel();
  const { t, pick } = useI18n();
  const [receipt, setReceipt] = React.useState<string | null>(purchase?.receiptImage ?? null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: purchase
      ? {
          itemId: purchase.itemId ?? CUSTOM,
          nameEn: purchase.nameEn,
          nameBn: purchase.nameBn,
          category: purchase.category,
          quantity: purchase.quantity,
          unit: purchase.unit,
          unitPrice: purchase.unitPrice,
          date: purchase.date,
          description: purchase.description,
        }
      : { itemId: CUSTOM, nameEn: "", nameBn: "", category: "OTHER", unit: "kg", date: todayISO(), description: "" },
  });

  const [quantity, unitPrice] = watch(["quantity", "unitPrice"]);
  const total = purchaseTotal(Number(quantity) || 0, Number(unitPrice) || 0);
  const { fmt } = useI18n();

  const pickDefault = (id: string) => {
    if (id === CUSTOM) return;
    const item = marketItems.find((i) => i.id === id);
    if (!item) return;
    setValue("nameEn", item.nameEn, { shouldValidate: true });
    setValue("nameBn", item.nameBn);
    setValue("category", item.category);
    setValue("unit", item.defaultUnit);
    setValue("unitPrice", item.defaultUnitPrice, { shouldValidate: true });
  };

  const onSubmit = handleSubmit((v) => {
    const nameEn = v.nameEn;
    savePurchase({
      id: purchase?.id ?? uid("pu"),
      itemId: v.itemId === CUSTOM ? null : v.itemId,
      nameEn,
      nameBn: v.nameBn || nameEn,
      category: v.category,
      quantity: v.quantity,
      unit: v.unit,
      unitPrice: v.unitPrice,
      totalPrice: purchaseTotal(v.quantity, v.unitPrice),
      date: v.date,
      description: v.description ?? "",
      receiptImage: receipt,
    });
    toast.success(purchase ? t("market.updated") : t("market.added"));
    onDone();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <Controller
        control={control}
        name="itemId"
        render={({ field }) => (
          <FormField label={t("market.addFromDefault")} htmlFor="pu-item">
            <Select
              value={field.value}
              onValueChange={(v) => {
                field.onChange(v);
                pickDefault(v);
              }}
            >
              <SelectTrigger id="pu-item">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CUSTOM}>{t("market.customItem")}</SelectItem>
                {marketItems.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {pick(i, "name")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={`${t("market.itemName")} (English)`} htmlFor="pu-name-en" error={errors.nameEn?.message}>
          <Input id="pu-name-en" aria-invalid={!!errors.nameEn} {...register("nameEn")} />
        </FormField>
        <FormField label={`${t("market.itemName")} (বাংলা)`} htmlFor="pu-name-bn" error={errors.nameBn?.message}>
          <Input id="pu-name-bn" lang="bn" {...register("nameBn")} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <FormField label={t("common.category")} htmlFor="pu-cat">
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="pu-cat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARKET_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {t(`market.cat.${c}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        />
        <FormField label={t("market.purchaseDate")} htmlFor="pu-date" error={errors.date?.message}>
          <Input id="pu-date" type="date" aria-invalid={!!errors.date} {...register("date")} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label={t("common.quantity")} htmlFor="pu-qty" error={errors.quantity?.message}>
          <Input id="pu-qty" type="number" inputMode="decimal" step="any" min="0" aria-invalid={!!errors.quantity} {...register("quantity", { valueAsNumber: true })} />
        </FormField>
        <Controller
          control={control}
          name="unit"
          render={({ field }) => (
            <FormField label={t("common.unit")} htmlFor="pu-unit">
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="pu-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARKET_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {t(`market.units.${u}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        />
        <FormField label={t("market.unitPrice")} htmlFor="pu-price" error={errors.unitPrice?.message}>
          <Input id="pu-price" type="number" inputMode="decimal" step="any" min="0" aria-invalid={!!errors.unitPrice} {...register("unitPrice", { valueAsNumber: true })} />
        </FormField>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-accent px-4 py-3" aria-live="polite">
        <span className="text-sm text-accent-foreground">
          {t("market.totalPrice")} <span className="text-xs opacity-70">({t("market.autoTotal")})</span>
        </span>
        <span className="text-xl font-bold text-accent-foreground">{fmt.currency(total)}</span>
      </div>

      <FormField label={`${t("common.description")} (${t("common.optional")})`} htmlFor="pu-desc" error={errors.description?.message}>
        <Textarea id="pu-desc" {...register("description")} />
      </FormField>

      <FormField label={`${t("market.receipt")} (${t("common.optional")})`} htmlFor="pu-receipt">
        <ImageUpload id="pu-receipt" value={receipt} onChange={setReceipt} uploadLabel={t("market.uploadReceipt")} removeLabel={t("market.removeReceipt")} />
      </FormField>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">{t("common.save")}</Button>
      </DialogFooter>
    </form>
  );
}

export function PurchaseDialog({
  open,
  onOpenChange,
  purchase,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase: MarketPurchase | null;
}) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{purchase ? t("market.editPurchase") : t("market.addPurchase")}</DialogTitle>
          <DialogDescription>{t("market.autoTotal")}</DialogDescription>
        </DialogHeader>
        <PurchaseForm key={purchase?.id ?? "new"} purchase={purchase} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
