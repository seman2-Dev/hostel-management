"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/shared/form-field";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { calculateMealCost } from "@/lib/hostel";
import type { BillingFormula } from "@/types";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "validation.time");
const schema = z.object({
  mealRate: z.number({ required_error: "validation.positive", invalid_type_error: "validation.positive" }).positive("validation.positive").max(100000, "validation.positive"),
  billingFormula: z.enum(["PER_MEAL", "PER_DAY_MEALS", "FIXED_PLUS_PER_MEAL"]),
  fixedMonthlyCharge: z.number({ invalid_type_error: "validation.positive" }).min(0, "validation.positive").max(1000000, "validation.positive"),
  cancelDeadline: time,
  activateDeadline: time,
  autoResetDaily: z.boolean(),
  defaultMealState: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const FORMULAS: Array<{ value: BillingFormula; key: "meal.formulaPerMeal" | "meal.formulaPerDay" | "meal.formulaFixed" }> = [
  { value: "PER_MEAL", key: "meal.formulaPerMeal" },
  { value: "PER_DAY_MEALS", key: "meal.formulaPerDay" },
  { value: "FIXED_PLUS_PER_MEAL", key: "meal.formulaFixed" },
];

/** Admin-configurable meal rules and billing formula (nothing is hard-coded to one hostel's billing). */
export function RulesForm() {
  const { settings, updateSettings } = useHostel();
  const { t, fmt } = useI18n();
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mealRate: settings.mealRate,
      billingFormula: settings.billingFormula,
      fixedMonthlyCharge: settings.fixedMonthlyCharge,
      cancelDeadline: settings.cancelDeadline,
      activateDeadline: settings.activateDeadline,
      autoResetDaily: settings.autoResetDaily,
      defaultMealState: settings.defaultMealState,
    },
  });

  const formula = watch("billingFormula");
  const rate = watch("mealRate");
  const fixed = watch("fixedMonthlyCharge");
  // Live example: 60 meals over 24 days.
  const example = calculateMealCost(60, 24, { ...settings, mealRate: Number(rate) || 0, billingFormula: formula, fixedMonthlyCharge: Number(fixed) || 0 });

  const onSubmit = handleSubmit((v) => {
    updateSettings(v);
    toast.success(t("admin.settingsSaved"));
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <FormField label={t("meal.rate")} htmlFor="r-rate" error={errors.mealRate?.message}>
        <Input id="r-rate" type="number" step="any" min="0" inputMode="decimal" aria-invalid={!!errors.mealRate} {...register("mealRate", { valueAsNumber: true })} />
      </FormField>
      <Controller
        control={control}
        name="billingFormula"
        render={({ field }) => (
          <FormField label={t("meal.billingFormula")} htmlFor="r-formula">
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="r-formula">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMULAS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {t(f.key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
      />
      <FormField label={t("meal.fixedCharge")} htmlFor="r-fixed" error={errors.fixedMonthlyCharge?.message}>
        <Input id="r-fixed" type="number" step="any" min="0" inputMode="decimal" disabled={formula !== "FIXED_PLUS_PER_MEAL"} aria-invalid={!!errors.fixedMonthlyCharge} {...register("fixedMonthlyCharge", { valueAsNumber: true })} />
      </FormField>
      <div className="flex flex-col justify-end rounded-lg bg-accent px-4 py-2.5" aria-live="polite">
        <span className="text-xs text-accent-foreground/80">
          {t("meal.cost")} (60 {t("common.meals")} · 24 days)
        </span>
        <span className="text-lg font-bold text-accent-foreground">{fmt.currency(example)}</span>
      </div>
      <FormField label={t("meal.cancelDeadline")} htmlFor="r-cancel" error={errors.cancelDeadline?.message}>
        <Input id="r-cancel" type="time" aria-invalid={!!errors.cancelDeadline} {...register("cancelDeadline")} />
      </FormField>
      <FormField label={t("meal.activateDeadline")} htmlFor="r-activate" error={errors.activateDeadline?.message}>
        <Input id="r-activate" type="time" aria-invalid={!!errors.activateDeadline} {...register("activateDeadline")} />
      </FormField>
      <Controller
        control={control}
        name="autoResetDaily"
        render={({ field }) => (
          <label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm font-medium">
            {t("meal.autoReset")}
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </label>
        )}
      />
      <Controller
        control={control}
        name="defaultMealState"
        render={({ field }) => (
          <label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm font-medium">
            <span>
              {t("meal.defaultState")}
              <span className="block text-xs font-normal text-muted-foreground">{field.value ? t("meal.on") : t("meal.off")}</span>
            </span>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </label>
        )}
      />
      <div className="sm:col-span-2">
        <Button type="submit">
          <Save />
          {t("admin.saveSettings")}
        </Button>
      </div>
    </form>
  );
}
