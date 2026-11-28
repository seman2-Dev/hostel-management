"use client";

import * as React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/shared/form-field";
import { ImageUpload } from "@/components/shared/image-upload";
import { MEAL_TYPES, useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { daysAheadISO } from "@/mocks/seed-utils";
import { uid } from "@/lib/utils";
import type { DailyMenu, MealType } from "@/types";

const itemSchema = z.object({
  itemId: z.string(),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER"]),
  nameEn: z.string().trim().min(1, "validation.required").max(80, "validation.minLength"),
  nameBn: z.string().trim().min(1, "validation.required").max(80, "validation.minLength"),
  descriptionEn: z.string().trim().max(200, "validation.minLength"),
  descriptionBn: z.string().trim().max(200, "validation.minLength"),
  image: z.string(),
  special: z.boolean(),
});
const schema = z.object({
  date: z.string().min(1, "validation.required"),
  published: z.boolean(),
  items: z.array(itemSchema).min(1, "validation.required"),
});
type FormValues = z.infer<typeof schema>;

const blank = (mealType: MealType): FormValues["items"][number] => ({
  itemId: uid("mi"),
  mealType,
  nameEn: "",
  nameBn: "",
  descriptionEn: "",
  descriptionBn: "",
  image: "",
  special: false,
});

function MenuForm({ menu, onDone }: { menu: DailyMenu | null; onDone: () => void }) {
  const { menus, saveMenu } = useHostel();
  const { t } = useI18n();
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: menu
      ? { date: menu.date, published: menu.published, items: menu.items.map((i) => ({ itemId: i.id, mealType: i.mealType, nameEn: i.nameEn, nameBn: i.nameBn, descriptionEn: i.descriptionEn, descriptionBn: i.descriptionBn, image: i.image, special: i.special })) }
      : { date: daysAheadISO(1), published: false, items: MEAL_TYPES.map(blank) },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const onSubmit = handleSubmit((v) => {
    if (menus.some((m) => m.id !== menu?.id && m.date === v.date)) {
      setError("date", { message: "admin.menuDateExists" });
      return;
    }
    saveMenu({
      id: menu?.id ?? uid("menu"),
      date: v.date,
      published: v.published,
      items: v.items.map((i) => ({ id: i.itemId, mealType: i.mealType, nameEn: i.nameEn, nameBn: i.nameBn, descriptionEn: i.descriptionEn, descriptionBn: i.descriptionBn, image: i.image, special: i.special })),
    });
    toast.success(t("admin.menuSaved"));
    onDone();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("common.date")} htmlFor="mn-date" error={errors.date?.message}>
          <Input id="mn-date" type="date" aria-invalid={!!errors.date} {...register("date")} />
        </FormField>
        <Controller
          control={control}
          name="published"
          render={({ field }) => (
            <label className="flex items-center justify-between gap-3 self-end rounded-lg border px-3 py-2.5 text-sm font-medium">
              {field.value ? t("common.published") : t("common.draft")}
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </label>
          )}
        />
      </div>

      {errors.items?.message && (
        <p role="alert" className="text-xs font-medium text-danger">
          {t(errors.items.message as "validation.required")}
        </p>
      )}

      <ul className="space-y-4">
        {fields.map((f, idx) => {
          const e = errors.items?.[idx];
          return (
            <li key={f.id} className="space-y-3 rounded-xl border bg-muted/20 p-3">
              <div className="flex items-end gap-2">
                <Controller
                  control={control}
                  name={`items.${idx}.mealType`}
                  render={({ field }) => (
                    <FormField label={t("common.meal")} htmlFor={`mn-type-${idx}`} className="flex-1">
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id={`mn-type-${idx}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MEAL_TYPES.map((m) => (
                            <SelectItem key={m} value={m}>
                              {t(`meal.${m.toLowerCase() as "breakfast" | "lunch" | "dinner"}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" disabled={fields.length <= 1} aria-label={t("common.delete")} onClick={() => remove(idx)}>
                  <Trash2 className="text-danger" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label={t("admin.dishNameEn")} htmlFor={`mn-en-${idx}`} error={e?.nameEn?.message}>
                  <Input id={`mn-en-${idx}`} aria-invalid={!!e?.nameEn} {...register(`items.${idx}.nameEn`)} />
                </FormField>
                <FormField label={t("admin.dishNameBn")} htmlFor={`mn-bn-${idx}`} error={e?.nameBn?.message}>
                  <Input id={`mn-bn-${idx}`} lang="bn" aria-invalid={!!e?.nameBn} {...register(`items.${idx}.nameBn`)} />
                </FormField>
                <FormField label={t("admin.dishDescEn")} htmlFor={`mn-den-${idx}`} error={e?.descriptionEn?.message}>
                  <Textarea id={`mn-den-${idx}`} className="min-h-[64px]" {...register(`items.${idx}.descriptionEn`)} />
                </FormField>
                <FormField label={t("admin.dishDescBn")} htmlFor={`mn-dbn-${idx}`} error={e?.descriptionBn?.message}>
                  <Textarea id={`mn-dbn-${idx}`} lang="bn" className="min-h-[64px]" {...register(`items.${idx}.descriptionBn`)} />
                </FormField>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Controller
                  control={control}
                  name={`items.${idx}.image`}
                  render={({ field }) => <ImageUpload id={`mn-img-${idx}`} value={field.value || null} onChange={(v) => field.onChange(v ?? "")} uploadLabel={t("admin.uploadImage")} removeLabel={t("market.removeReceipt")} />}
                />
                <Controller
                  control={control}
                  name={`items.${idx}.special`}
                  render={({ field }) => (
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                      {t("admin.isSpecial")}
                    </label>
                  )}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <Button type="button" variant="outline" onClick={() => append(blank("DINNER"))}>
        <Plus />
        {t("admin.addDish")}
      </Button>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">{t("common.save")}</Button>
      </DialogFooter>
    </form>
  );
}

export function MenuDialog({ open, onOpenChange, menu }: { open: boolean; onOpenChange: (o: boolean) => void; menu: DailyMenu | null }) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{menu ? t("admin.editMenu") : t("admin.addMenu")}</DialogTitle>
          <DialogDescription>{t("admin.menusDesc")}</DialogDescription>
        </DialogHeader>
        <MenuForm key={menu?.id ?? "new"} menu={menu} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
