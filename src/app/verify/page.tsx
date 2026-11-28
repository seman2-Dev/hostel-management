"use client";

import * as React from "react";
import { BadgeCheck, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { HostelVerification } from "@/components/shared/hostel-verification";
import { VerificationSeal } from "@/components/shared/verification-seal";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import type { Resident } from "@/types";

export default function VerifyPage() {
  const { t, fmt, pick } = useI18n();
  const { residents, allBeds } = useHostel();
  const [query, setQuery] = React.useState("");
  const [result, setResult] = React.useState<Resident | null>(null);
  const [searched, setSearched] = React.useState(false);

  const check = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim().toLowerCase();
    setSearched(true);
    if (!value) {
      setResult(null);
      return;
    }

    const byRoom = /^\d+$/.test(value)
      ? allBeds.find((bed) => bed.roomNumber === Number(value) && bed.residentId)?.residentId
      : undefined;
    const found =
      residents.find((r) => r.id === byRoom) ??
      residents.find((r) => r.studentId.toLowerCase().includes(value)) ??
      residents.find((r) => r.name.toLowerCase().includes(value) || r.nameBn.includes(value));
    setResult(found ?? null);
  };

  const bed = result?.bedId ? allBeds.find((b) => b.id === result.bedId) : undefined;

  return (
    <div className="container py-8 sm:py-10">
      <PageHeader eyebrow={t("verify.badge")} title={t("verify.checkTitle")} subtitle={t("verify.subtitle")} />

      <HostelVerification compact className="mb-8" />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader>
            <div className="section-kicker">{t("verify.checkTitle")}</div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="size-4 text-brass" />
              {t("verify.checkHint")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={check} className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("verify.placeholder")}
                aria-label={t("verify.checkTitle")}
                dir="ltr"
                className="sm:flex-1"
              />
              <Button type="submit">
                <ShieldCheck />
                {t("verify.button")}
              </Button>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">{t("verify.note")}</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brass to-transparent" aria-hidden="true" />
          <CardContent className="p-5 sm:p-6">
            {result ? (
              <div className="flex flex-wrap items-start gap-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.photo} alt="" className="size-20 rounded-full border-2 border-brass/50 object-cover" />
                <VerificationSeal className="size-20" />
                <div className="min-w-0 flex-1">
                  <Badge variant="success" className="mb-2">
                    <BadgeCheck className="size-3" />
                    {t("verify.found")}
                  </Badge>
                  <h2 className="text-xl font-semibold tracking-tight">{pick(result, "name")}</h2>
                  <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("verify.id")}</dt>
                      <dd className="font-medium" dir="ltr">{result.studentId}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("auth.dateOfBirth")}</dt>
                      <dd className="font-medium">{fmt.date(result.dateOfBirth)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("verify.room")}</dt>
                      <dd className="font-medium">
                        {bed ? `${fmt.digits(bed.roomNumber)}-${fmt.digits(bed.label)}` : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("verify.department")}</dt>
                      <dd className="font-medium">{result.department}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("verify.status")}</dt>
                      <dd>
                        <Badge variant={result.active ? "success" : "secondary"}>
                          {result.active ? t("verify.active") : t("verify.inactive")}
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-xs text-muted-foreground">{t("verify.sealed")}</p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
                <ShieldCheck className="size-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {searched ? t("verify.notFound") : t("verify.checkHint")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
