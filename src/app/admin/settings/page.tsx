"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RulesForm } from "@/components/admin/rules-form";
import { FormField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/store/auth";
import { useI18n } from "@/i18n";

const schema = z
  .object({
    current: z.string().min(1, "validation.required"),
    next: z.string().min(8, "validation.minPassword").max(72, "validation.minPassword"),
    confirm: z.string().min(1, "validation.required"),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "validation.passwordMatch" });
type FormValues = z.infer<typeof schema>;

export default function AdminSettingsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(() => {
    // Phase 1: no real credential store. Phase 2 verifies the current password and re-hashes on the server.
    toast.success(t("admin.settingsSaved"));
    reset();
  });

  return (
    <>
      <PageHeader title={t("admin.settings")} subtitle={t("admin.settingsDesc")} />
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">{t("admin.accountSection")}</TabsTrigger>
          <TabsTrigger value="rules">{t("admin.rulesSection")}</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>{t("admin.accountSection")}</CardTitle>
              <CardDescription>
                {user?.name} · {user?.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} noValidate className="grid gap-4">
                <FormField label={t("admin.currentPassword")} htmlFor="s-current" error={errors.current?.message}>
                  <Input id="s-current" type="password" autoComplete="current-password" aria-invalid={!!errors.current} {...register("current")} />
                </FormField>
                <FormField label={t("admin.newPassword")} htmlFor="s-next" error={errors.next?.message}>
                  <Input id="s-next" type="password" autoComplete="new-password" aria-invalid={!!errors.next} {...register("next")} />
                </FormField>
                <FormField label={t("auth.confirmPassword")} htmlFor="s-confirm" error={errors.confirm?.message}>
                  <Input id="s-confirm" type="password" autoComplete="new-password" aria-invalid={!!errors.confirm} {...register("confirm")} />
                </FormField>
                <div>
                  <Button type="submit">
                    <KeyRound />
                    {t("admin.saveSettings")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.rulesSection")}</CardTitle>
            </CardHeader>
            <CardContent>
              <RulesForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
