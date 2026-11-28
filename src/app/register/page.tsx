"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { ImageUpload } from "@/components/shared/image-upload";
import { LogoMark } from "@/components/layout/logo";
import { useAuth } from "@/store/auth";
import { useI18n } from "@/i18n";
import { todayISO } from "@/mocks/seed-utils";
import { isAdminRole } from "@/lib/roles";

const schema = z
  .object({
    name: z.string().trim().min(2, "validation.minLength").max(80, "validation.minLength"),
    email: z.string().trim().min(1, "validation.required").email("validation.email"),
    phone: z.string().trim().regex(/^(\+?88)?01[3-9]\d{8}$/, "validation.phone"),
    studentId: z.string().trim().min(3, "validation.minLength").max(20, "validation.minLength"),
    dateOfBirth: z
      .string()
      .min(1, "validation.required")
      .refine((v) => {
        const date = new Date(v);
        return !Number.isNaN(date.getTime()) && date.getTime() <= Date.now();
      }, "validation.dob"),
    photo: z.string().min(1, "validation.photoRequired"),
    department: z.string().trim().min(2, "validation.minLength").max(60, "validation.minLength"),
    password: z.string().min(8, "validation.minPassword").max(72, "validation.minPassword"),
    confirm: z.string().min(1, "validation.required"),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "validation.passwordMatch" });
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { register: registerUser, user } = useAuth();
  const [emailTaken, setEmailTaken] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  React.useEffect(() => {
    if (user) router.replace(isAdminRole(user.role) ? "/admin" : "/dashboard");
  }, [user, router]);

  const onSubmit = handleSubmit((v) => {
    const result = registerUser({
      name: v.name,
      email: v.email,
      phone: v.phone,
      studentId: v.studentId,
      dateOfBirth: v.dateOfBirth,
      photo: v.photo,
      department: v.department,
      password: v.password,
    });
    if (result.ok) {
      toast.success(t("auth.registerPending"));
      setPending(true);
    } else {
      setEmailTaken(result.error === "emailTaken");
    }
  });

  return (
    <div className="container flex justify-center py-10 sm:py-16">
      <Card className="w-full max-w-xl">
        <CardHeader className="items-center text-center">
          <LogoMark className="size-14" />
          <CardTitle as="h1" className="text-2xl">{t("auth.registerTitle")}</CardTitle>
          <CardDescription>{t("auth.registerSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {pending ? (
            <div className="rounded-2xl border border-brass/30 bg-brass/[0.08] p-6 text-center">
              <div className="gold-rule mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-xl font-semibold tracking-tight">{t("auth.pendingTitle")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("auth.pendingBody")}</p>
              <Button asChild className="mt-4">
                <Link href="/login">{t("nav.login")}</Link>
              </Button>
            </div>
          ) : (
            <>
          <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
            {emailTaken && (
              <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm font-medium text-danger sm:col-span-2">
                {t("auth.emailTaken")}
              </p>
            )}
            <FormField label={t("auth.fullName")} htmlFor="name" error={errors.name?.message} className="sm:col-span-2">
              <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
            </FormField>
            <FormField label={t("auth.email")} htmlFor="email" error={errors.email?.message} className="sm:col-span-2">
              <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
            </FormField>
            <FormField label={t("auth.phone")} htmlFor="phone" error={errors.phone?.message}>
              <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" aria-invalid={!!errors.phone} {...register("phone")} />
            </FormField>
            <FormField label={t("auth.studentId")} htmlFor="studentId" error={errors.studentId?.message}>
              <Input id="studentId" aria-invalid={!!errors.studentId} {...register("studentId")} />
            </FormField>
            <FormField label={t("auth.dateOfBirth")} htmlFor="dob" error={errors.dateOfBirth?.message}>
              <Input id="dob" type="date" max={todayISO()} aria-invalid={!!errors.dateOfBirth} {...register("dateOfBirth")} />
            </FormField>
            <FormField label={t("auth.department")} htmlFor="department" error={errors.department?.message} className="sm:col-span-2">
              <Input id="department" aria-invalid={!!errors.department} {...register("department")} />
            </FormField>
            <Controller
              control={control}
              name="photo"
              render={({ field }) => (
                <FormField label={t("auth.photo")} htmlFor="photo" error={errors.photo?.message} className="sm:col-span-2">
                  <ImageUpload
                    id="photo"
                    value={field.value || null}
                    onChange={(url) => field.onChange(url ?? "")}
                    uploadLabel={t("auth.uploadPhoto")}
                    removeLabel={t("auth.removePhoto")}
                  />
                </FormField>
              )}
            />
            <FormField label={t("auth.password")} htmlFor="password" error={errors.password?.message}>
              <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
            </FormField>
            <FormField label={t("auth.confirmPassword")} htmlFor="confirm" error={errors.confirm?.message}>
              <Input id="confirm" type="password" autoComplete="new-password" aria-invalid={!!errors.confirm} {...register("confirm")} />
            </FormField>
            <Button type="submit" className="sm:col-span-2" disabled={isSubmitting}>
              <UserPlus />
              {t("auth.registerButton")}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            {t("auth.haveAccount")}{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              {t("nav.login")}
            </Link>
          </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
