"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormField } from "@/components/shared/form-field";
import { EmptyState } from "@/components/ui/states";
import { MARKET_CATEGORIES, MARKET_UNITS } from "./purchase-dialog";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { uid } from "@/lib/utils";
import type { MarketItem } from "@/types";

const schema = z.object({
  nameEn: z.string().trim().min(1, "validation.required").max(80, "validation.minLength"),
  nameBn: z.string().trim().min(1, "validation.required").max(80, "validation.minLength"),
  category: z.enum(["GRAIN", "VEGETABLE", "PROTEIN", "DAIRY_EGG", "OIL_SPICE", "OTHER"]),
  defaultUnit: z.enum(["kg", "gram", "liter", "piece", "packet", "dozen"]),
  defaultUnitPrice: z
    .number({ required_error: "validation.positive", invalid_type_error: "validation.positive" })
    .positive("validation.positive")
    .max(1_000_000, "validation.positive"),
});
type FormValues = z.infer<typeof schema>;

function ItemForm({ item, onDone }: { item: MarketItem | null; onDone: () => void }) {
  const { saveMarketItem } = useHostel();
  const { t } = useI18n();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: item
      ? { nameEn: item.nameEn, nameBn: item.nameBn, category: item.category, defaultUnit: item.defaultUnit, defaultUnitPrice: item.defaultUnitPrice }
      : { nameEn: "", nameBn: "", category: "OTHER", defaultUnit: "kg" },
  });

  const onSubmit = handleSubmit((v) => {
    saveMarketItem({ id: item?.id ?? uid("mk"), isDefault: true, ...v });
    toast.success(t("common.success"));
    onDone();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={`${t("market.itemName")} (English)`} htmlFor="di-en" error={errors.nameEn?.message}>
          <Input id="di-en" aria-invalid={!!errors.nameEn} {...register("nameEn")} />
        </FormField>
        <FormField label={`${t("market.itemName")} (বাংলা)`} htmlFor="di-bn" error={errors.nameBn?.message}>
          <Input id="di-bn" lang="bn" aria-invalid={!!errors.nameBn} {...register("nameBn")} />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <FormField label={t("common.category")} htmlFor="di-cat">
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="di-cat">
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
        <Controller
          control={control}
          name="defaultUnit"
          render={({ field }) => (
            <FormField label={t("common.unit")} htmlFor="di-unit">
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="di-unit">
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
        <FormField label={t("market.unitPrice")} htmlFor="di-price" error={errors.defaultUnitPrice?.message}>
          <Input id="di-price" type="number" step="any" min="0" inputMode="decimal" aria-invalid={!!errors.defaultUnitPrice} {...register("defaultUnitPrice", { valueAsNumber: true })} />
        </FormField>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">{t("common.save")}</Button>
      </DialogFooter>
    </form>
  );
}

export function DefaultItemsManager() {
  const { marketItems, deleteMarketItem } = useHostel();
  const { t, pick, fmt } = useI18n();
  const [editing, setEditing] = React.useState<MarketItem | null>(null);
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<MarketItem | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{t("market.defaultItems")}</h2>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus />
          {t("market.addDefaultItem")}
        </Button>
      </div>

      {marketItems.length === 0 ? (
        <EmptyState title={t("common.noData")} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("common.category")}</TableHead>
              <TableHead>{t("common.unit")}</TableHead>
              <TableHead className="text-end">{t("market.unitPrice")}</TableHead>
              <TableHead className="text-end">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marketItems.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{pick(i, "name")}</TableCell>
                <TableCell>{t(`market.cat.${i.category}`)}</TableCell>
                <TableCell>{t(`market.units.${i.defaultUnit}`)}</TableCell>
                <TableCell className="text-end">{fmt.currency(i.defaultUnitPrice)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`${t("common.edit")}: ${pick(i, "name")}`}
                      onClick={() => {
                        setEditing(i);
                        setOpen(true);
                      }}
                    >
                      <Pencil />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={`${t("common.delete")}: ${pick(i, "name")}`} onClick={() => setDeleting(i)}>
                      <Trash2 className="text-danger" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t("common.edit") : t("market.addDefaultItem")}</DialogTitle>
          </DialogHeader>
          <ItemForm key={editing?.id ?? "new"} item={editing} onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("common.delete")}
        description={deleting ? pick(deleting, "name") : ""}
        destructive
        confirmLabel={t("common.delete")}
        onConfirm={() => {
          if (deleting) deleteMarketItem(deleting.id);
          toast.success(t("common.success"));
        }}
      />
    </div>
  );
}
