"use client";

import * as React from "react";
import { Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBulkMeal } from "@/components/admin/use-bulk-meal";
import { PageHeader } from "@/components/shared/page-header";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { roomMealsOn, roomOccupied } from "@/lib/hostel";

export default function AdminFloorsPage() {
  const { t, fmt } = useI18n();
  const { rooms } = useHostel();
  const bulk = useBulkMeal();

  return (
    <>
      <PageHeader title={t("admin.floors")} subtitle={t("admin.floorsDesc")} />
      <div className="grid gap-4 lg:grid-cols-3">
        {([1, 2, 3] as const).map((f) => {
          const floorRooms = rooms.filter((r) => r.floor === f).sort((a, b) => a.position - b.position);
          const occupied = floorRooms.reduce((n, r) => n + roomOccupied(r), 0);
          const on = floorRooms.reduce((n, r) => n + roomMealsOn(r), 0);
          return (
            <Card key={f}>
              <CardHeader>
                <CardTitle>{t(`overview.floorsLabel.${f}`)}</CardTitle>
                <CardDescription>
                  {fmt.number(floorRooms.length)} {t("admin.rooms")} · {fmt.number(floorRooms.length * 4)} {t("admin.beds")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted p-2">
                    <dd className="text-lg font-bold">{fmt.number(occupied)}</dd>
                    <dt className="text-xs text-muted-foreground">{t("overview.occupied")}</dt>
                  </div>
                  <div className="rounded-lg bg-success/10 p-2">
                    <dd className="text-lg font-bold text-success">{fmt.number(on)}</dd>
                    <dt className="text-xs text-muted-foreground">{t("room.mealOn")}</dt>
                  </div>
                  <div className="rounded-lg bg-danger/10 p-2">
                    <dd className="text-lg font-bold text-danger">{fmt.number(occupied - on)}</dd>
                    <dt className="text-xs text-muted-foreground">{t("room.mealOff")}</dt>
                  </div>
                </dl>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    {t("hero.west")} → {t("hero.east")}
                  </p>
                  <ol className="flex flex-wrap gap-1.5">
                    {floorRooms.map((r) => (
                      <li key={r.number} className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold">
                        {fmt.digits(r.number)}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="success" size="sm" onClick={() => bulk.request({ type: "floor", floor: f }, true)}>
                    <Power />
                    {t("meal.setOn")}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => bulk.request({ type: "floor", floor: f }, false)}>
                    <PowerOff />
                    {t("meal.setOff")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {bulk.dialog}
    </>
  );
}
