"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { LogoMark } from "@/components/layout/logo";
import { useAuth } from "@/store/auth";
import { useI18n } from "@/i18n";
import { isAdminRole } from "@/lib/roles";
import type { Role } from "@/types";

const schema = z.object({
  email: z.string().trim().min(1, "validation.required").email("validation.email"),
  password: z.string().min(1, "validation.required"),
});
type FormValues = z.infer<typeof schema>;

const home = (role: Role) => (isAdminRole(role) ? "/admin" : "/dashboard");

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, login } = useAuth();
  const [show, setShow] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  React.useEffect(() => {
    if (user) router.replace(home(user.role));
  }, [user, router]);

  const onSubmit = handleSubmit((v) => {
    const result = login(v.email, v.password);
    if (result.ok && result.role) {
      setFailed(false);
      toast.success(t("auth.loggedIn"));
      router.replace(home(result.role));
    } else {
      setFailed(true);
      setPending(result.error === "pendingApproval");
    }
  });

  return (
    <div className="container flex justify-center py-10 sm:py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <LogoMark className="size-14" />
          <CardTitle as="h1" className="text-2xl">{t("auth.loginTitle")}</CardTitle>
          <CardDescription>{t("auth.loginSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {failed && (
              <p role="alert" className={`rounded-lg border px-3 py-2 text-sm font-medium ${pending ? "border-warning/40 bg-warning/10 text-warning" : "border-danger/40 bg-danger/10 text-danger"}`}>
                {pending ? t("auth.pendingApproval") : t("auth.invalid")}
              </p>
            )}
            <FormField label={t("auth.email")} htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
            </FormField>
            <FormField label={t("auth.password")} htmlFor="password" error={errors.password?.message}>
              <div className="relative">
                <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" aria-invalid={!!errors.password} className="pe-11" {...register("password")} />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? t("auth.hidePassword") : t("auth.showPassword")}
                  className="absolute end-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground focus-ring"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </FormField>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <LogIn />
              {t("auth.loginButton")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              {t("nav.register")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
