"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { OFFICIAL_ROOM_NUMBERS } from "@/mocks/structure";

const schema = z.object({
  hostelNameEn: z.string().trim().min(2, "validation.required").max(80, "validation.minLength"),
  hostelNameBn: z.string().trim().min(2, "validation.required").max(80, "validation.minLength"),
  established: z.number({ required_error: "validation.positive", invalid_type_error: "validation.positive" }).int("validation.positive").min(1800, "validation.positive").max(2100, "validation.positive"),
});
type FormValues = z.infer<typeof schema>;

export default function AdminHostelPage() {
  const { t, fmt } = useI18n();
  const { settings, updateSettings } = useHostel();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { hostelNameEn: settings.hostelNameEn, hostelNameBn: settings.hostelNameBn, established: settings.established },
  });

  const onSubmit = handleSubmit((v) => {
    updateSettings(v);
    toast.success(t("admin.settingsSaved"));
  });

  return (
    <>
      <PageHeader title={t("admin.hostel")} subtitle={t("admin.hostelInfo")} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.hostelInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} noValidate className="grid gap-4">
              <FormField label={t("admin.hostelNameEn")} htmlFor="h-en" error={errors.hostelNameEn?.message}>
                <Input id="h-en" aria-invalid={!!errors.hostelNameEn} {...register("hostelNameEn")} />
              </FormField>
              <FormField label={t("admin.hostelNameBn")} htmlFor="h-bn" error={errors.hostelNameBn?.message}>
                <Input id="h-bn" lang="bn" aria-invalid={!!errors.hostelNameBn} {...register("hostelNameBn")} />
              </FormField>
              <FormField label={t("admin.established")} htmlFor="h-est" error={errors.established?.message}>
                <Input id="h-est" type="number" inputMode="numeric" aria-invalid={!!errors.established} {...register("established", { valueAsNumber: true })} />
              </FormField>
              <div>
                <Button type="submit">
                  <Save />
                  {t("common.save")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="size-4" />
              {t("admin.floors")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{t("admin.structureLocked")}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {([1, 2, 3] as const).map((f) => (
              <div key={f}>
                <p className="mb-1.5 text-sm font-semibold">{t(`overview.floorsLabel.${f}`)}</p>
                <ol className="flex flex-wrap gap-1.5" aria-label={t("overview.westToEast")}>
                  {OFFICIAL_ROOM_NUMBERS[f].map((n) => (
                    <li key={n} className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold">
                      {fmt.digits(n)}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              {t("hero.west")} → {t("hero.east")}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
