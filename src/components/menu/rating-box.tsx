"use client";

import * as React from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { StarDisplay, StarInput } from "@/components/shared/star-rating";
import { useAuth } from "@/store/auth";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import type { MealType } from "@/types";

const schema = z.object({
  stars: z
    .number({ required_error: "validation.rating", invalid_type_error: "validation.rating" })
    .int("validation.rating")
    .min(1, "validation.rating")
    .max(5, "validation.rating"),
  feedback: z.string().trim().max(300, "validation.minLength").optional(),
});
type FormValues = z.infer<typeof schema>;

export function RatingBox({ date, mealType }: { date: string; mealType: MealType }) {
  const { user } = useAuth();
  const { ratings, addRating, getResident } = useHostel();
  const { t } = useI18n();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { stars: 0, feedback: "" } });

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm" className="w-full">
        <Link href="/login">
          <LogIn />
          {t("menu.loginToRate")}
        </Link>
      </Button>
    );
  }
  if (user.role !== "RESIDENT" || !user.residentId) return null;

  const residentId = user.residentId;
  const mine = ratings.find((r) => r.residentId === residentId && r.date === date && r.mealType === mealType);

  if (mine) {
    return (
      <div className="space-y-1 rounded-lg bg-success/10 p-3 text-sm">
        <p className="flex items-center gap-1.5 font-medium text-success">
          <CheckCircle2 className="size-4" />
          {t("menu.alreadyRated")}
        </p>
        <StarDisplay value={mine.stars} />
        {mine.feedback && <p className="text-muted-foreground">“{mine.feedback}”</p>}
      </div>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    const resident = getResident(residentId);
    const result = addRating({
      residentId,
      residentName: resident?.name ?? user.name,
      date,
      mealType,
      stars: values.stars as 1 | 2 | 3 | 4 | 5,
      feedback: values.feedback ?? "",
    });
    if (result.ok) {
      toast.success(t("menu.ratingSaved"));
      reset();
    } else {
      toast.error(t("menu.alreadyRated"));
    }
  });

  const id = `rate-${mealType}`;
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3 rounded-lg border bg-muted/30 p-3" aria-label={t("menu.rateThisMeal")}>
      <p className="text-sm font-semibold">{t("menu.rateThisMeal")}</p>
      <Controller
        control={control}
        name="stars"
        render={({ field }) => (
          <FormField label={t("menu.yourRating")} htmlFor={`${id}-stars`} error={errors.stars?.message}>
            <div id={`${id}-stars`}>
              <StarInput value={field.value} onChange={field.onChange} label={t("menu.yourRating")} />
            </div>
          </FormField>
        )}
      />
      <FormField label={t("menu.feedbackLabel")} htmlFor={`${id}-fb`} error={errors.feedback?.message}>
        <Textarea id={`${id}-fb`} maxLength={300} placeholder={t("menu.feedbackPlaceholder")} {...register("feedback")} />
      </FormField>
      <Button type="submit" size="sm" disabled={isSubmitting} className="w-full">
        {t("menu.submitRating")}
      </Button>
    </form>
  );
}
