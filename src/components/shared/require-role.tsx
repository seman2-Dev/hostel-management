"use client";

import * as React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { useAuth } from "@/store/auth";
import { useI18n } from "@/i18n";
import type { Role } from "@/types";

/** UI-level guard for Phase 1. The real enforcement happens on the server in Phase 2. */
export function RequireRole({ role, children }: { role: Role | Role[]; children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const { t } = useI18n();

  if (!ready) return <LoadingState />;

  if (!user) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={<Lock className="size-6" />}
          title={t("auth.loginRequired")}
          action={
            <Button asChild>
              <Link href="/login">{t("nav.login")}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(user.role)) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={<Lock className="size-6" />}
          title={t("auth.accessDenied")}
          action={
            <Button asChild variant="outline">
              <Link href="/">{t("states.goHome")}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
}
