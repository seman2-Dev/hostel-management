"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  DoorOpen,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogoMark } from "@/components/layout/logo";
import { VerificationSeal } from "@/components/shared/verification-seal";
import { RequireRole } from "@/components/shared/require-role";
import { useAuth } from "@/store/auth";
import { useHostel } from "@/store/hostel-store";
import { useI18n, type TranslationKey } from "@/i18n";
import { isAdminRole, ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";

function Info({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</dt>
      <dd className={cn("mt-1 truncate text-sm font-medium", mono && "font-mono tracking-wide")} dir={mono ? "ltr" : undefined}>
        {value}
      </dd>
    </div>
  );
}

function ProfileView() {
  const { user, logout } = useAuth();
  const { getResident, getBed } = useHostel();
  const { t, fmt, pick } = useI18n();
  const router = useRouter();

  if (!user) return null;

  const resident = getResident(user.residentId);
  const bed = resident?.bedId ? getBed(resident.bedId) : undefined;
  const name = resident ? pick(resident, "name") : user.name;
  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
  const memberId = `HMS-${(resident?.studentId ?? user.id).toUpperCase()}`;

  const roleKey: TranslationKey = isAdminRole(user.role)
    ? "profile.roleAdmin"
    : user.role === "MANAGER"
      ? "profile.roleManager"
      : "profile.roleResident";

  const status = resident?.approvalStatus ?? (user.active ? "APPROVED" : "PENDING");
  const statusKey: TranslationKey =
    status === "PENDING" ? "profile.pending" : status === "REJECTED" ? "profile.rejected" : "profile.verified";
  const statusVariant = status === "PENDING" ? "warning" : status === "REJECTED" ? "danger" : "success";

  const handleLogout = () => {
    logout();
    toast.success(t("auth.loggedOut"));
    router.push("/");
  };

  return (
    <div className="container py-8 sm:py-10">
      {/* Signature hero — gradient, dotted halo and a conic-ring avatar. */}
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary via-violet-600 to-[#241554] p-6 text-primary-foreground shadow-lift sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full border border-white/20" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-10 -top-14 size-56 rounded-full border border-white/15" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.13]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }}
          aria-hidden="true"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className="relative shrink-0 rounded-full p-[3px]"
              style={{ background: "conic-gradient(from 140deg, #f4b740, #ffffffaa, #8b5cf6, #f4b740)" }}
            >
              <div className="grid size-24 place-items-center overflow-hidden rounded-full bg-background text-2xl font-bold text-primary sm:size-28">
                {resident?.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resident.photo} alt={name} className="size-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <span className="absolute bottom-1 right-1 grid size-7 place-items-center rounded-full bg-success text-success-foreground ring-2 ring-white/70">
                <BadgeCheck className="size-4" />
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">{t("profile.badge")}</p>
              <h1 className="mt-1 truncate text-2xl font-bold tracking-tight sm:text-3xl">{name}</h1>
              <p className="mt-1 truncate text-sm text-white/80" dir="ltr">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="border-white/30 bg-white/15 text-white">
                  <ShieldCheck className="size-3" />
                  {t(roleKey)}
                </Badge>
                <Badge className="border-white/30 bg-white/15 text-white">{t(statusKey)}</Badge>
              </div>
            </div>
          </div>
          <LogoMark className="size-14 opacity-90" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        {/* Digital identity card */}
        <Card className="relative overflow-hidden border-brass/30">
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brass via-primary to-violet-500" aria-hidden="true" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="section-kicker">{t("profile.idCard")}</p>
                <h2 className="truncate text-lg font-semibold tracking-tight">{t("brand.name")}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{t("profile.idHint")}</p>
              </div>
              <VerificationSeal className="size-16 shrink-0" />
            </div>

            {resident ? (
              <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <Info label={t("profile.memberId")} value={memberId} mono />
                <Info label={t("auth.studentId")} value={resident.studentId} mono />
                <Info label={t("auth.department")} value={resident.department} />
                <Info label={t("auth.dateOfBirth")} value={fmt.date(resident.dateOfBirth)} />
                <Info label={t("auth.phone")} value={resident.phone} mono />
                <Info label={t("auth.email")} value={resident.email} />
              </dl>
            ) : (
              <p className="mt-6 rounded-xl border border-dashed border-border/70 bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
                {t("profile.noRecord")}
              </p>
            )}

            {/* Hologram-style barcode strip */}
            <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-dashed border-border/70 pt-4">
              <div className="flex h-8 items-end gap-[3px]" aria-hidden="true">
                {Array.from({ length: 38 }, (_, i) => (
                  <span
                    key={i}
                    className="w-[2px] rounded-sm bg-foreground/70"
                    style={{ height: `${i % 7 === 0 ? 30 : i % 3 === 0 ? 20 : 12}px` }}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground" dir="ltr">
                {memberId}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          {/* At a glance */}
          <Card>
            <CardContent className="p-6">
              <p className="section-kicker">{t("profile.overview")}</p>
              <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <Info label={t("profile.roomBed")} value={bed ? `${fmt.digits(bed.roomNumber)}-${fmt.digits(bed.label)}` : t("profile.noBed")} mono />
                <Info
                  label={t("profile.mealStatus")}
                  value={
                    <Badge variant={bed?.mealOn ? "success" : "secondary"}>
                      <UtensilsCrossed className="size-3" />
                      {bed?.mealOn ? t("profile.mealsOn") : t("profile.mealsOff")}
                    </Badge>
                  }
                />
                <Info label={t("profile.role")} value={t(roleKey)} />
                <Info label={t("profile.status")} value={<Badge variant={statusVariant}>{t(statusKey)}</Badge>} />
                <Info label={t("profile.joined")} value={resident ? fmt.date(resident.joinedAt) : t("profile.noBed")} />
              </dl>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardContent className="p-6">
              <p className="section-kicker">{t("profile.quickActions")}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button asChild className="shine">
                  <Link href={isAdminRole(user.role) ? "/admin" : "/dashboard"}>
                    {isAdminRole(user.role) ? <ShieldCheck /> : <LayoutDashboard />}
                    {isAdminRole(user.role) ? t("profile.openAdmin") : t("profile.openDashboard")}
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/menu">
                    <UtensilsCrossed />
                    {t("profile.browseMenu")}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/verify">
                    <DoorOpen />
                    {t("nav.verify")}
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut />
                  {t("profile.logout")}
                </Button>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" />
                {t("profile.subtitle")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireRole role={[...ROLES]}>
      <ProfileView />
    </RequireRole>
  );
}
