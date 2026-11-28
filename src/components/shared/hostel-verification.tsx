"use client";

import Link from "next/link";
import { BadgeCheck, GraduationCap, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { isAdminRole } from "@/lib/roles";
import { VerificationSeal } from "./verification-seal";
import { cn } from "@/lib/utils";

/** Trust panel that proves this is a students-only, office-verified hostel. */
export function HostelVerification({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { t, fmt } = useI18n();
  const { user } = useAuth();
  const { residents, getResident } = useHostel();
  const resident = user?.residentId ? getResident(user.residentId) : undefined;
  const activeCount = residents.filter((r) => r.active).length;

  const facts = [
    { icon: <GraduationCap />, label: t("verify.facts.studentsOnly") },
    { icon: <BadgeCheck />, label: t("verify.facts.idRequired") },
    { icon: <ShieldCheck />, label: t("verify.facts.officeApproved") },
  ];

  return (
    <section className={cn("relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-5 shadow-panel sm:p-6", compact && "p-4 sm:p-5", className)} aria-labelledby="verify-panel-title">
      <span className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-primary via-brass to-transparent" aria-hidden="true" />
      <div className="flex flex-wrap items-center gap-5">
        <VerificationSeal />
        <div className="min-w-0 flex-1">
          <Badge variant="outline" className="mb-2 border-brass/40 text-brass">
            <BadgeCheck className="size-3" />
            {t("verify.badge")}
          </Badge>
          <h2 id="verify-panel-title" className="text-xl font-semibold tracking-tight sm:text-2xl">
            {t("verify.title")}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("verify.subtitle")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {facts.map((fact) => (
              <span key={fact.label} className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium">
                <span className="text-brass [&_svg]:size-3.5">{fact.icon}</span>
                {fact.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        {resident ? (
          <p className="text-sm">
            <span className="text-muted-foreground">{t("verify.id")}: </span>
            <span className="font-semibold" dir="ltr">{resident.studentId}</span>
            <Badge variant={resident.active ? "success" : "secondary"} className="ms-2">
              {resident.active ? t("verify.active") : t("verify.inactive")}
            </Badge>
          </p>
        ) : isAdminRole(user?.role) ? (
          <p className="text-sm text-muted-foreground">
            {fmt.number(activeCount)} {t("admin.stats.activeResidents")}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">{t("verify.note")}</p>
        )}
        <Button asChild variant="outline" size="sm" className="shadow-none">
          <Link href="/verify">
            {t("verify.checkTitle")}
          </Link>
        </Button>
      </div>
    </section>
  );
}
