"use client";

import * as React from "react";
import { Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BedsTable } from "@/components/admin/beds-table";
import { RulesForm } from "@/components/admin/rules-form";
import { useBulkMeal } from "@/components/admin/use-bulk-meal";
import { FormField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { useHostel, type MealScope } from "@/store/hostel-store";
import { useI18n } from "@/i18n";

type ScopeType = "room" | "floor" | "all";

export default function AdminMealsPage() {
  const { t, fmt } = useI18n();
  const { rooms } = useHostel();
  const bulk = useBulkMeal();
  const [scope, setScope] = React.useState<ScopeType>("floor");
  const [floor, setFloor] = React.useState("1");
  const [room, setRoom] = React.useState("100");

  const target: MealScope = scope === "all" ? { type: "all" } : scope === "floor" ? { type: "floor", floor: Number(floor) as 1 | 2 | 3 } : { type: "room", roomNumber: Number(room) };

  return (
    <>
      <PageHeader title={t("admin.meals")} subtitle={t("meal.history")} />
      <Tabs defaultValue="control">
        <TabsList>
          <TabsTrigger value="control">{t("meal.scope")}</TabsTrigger>
          <TabsTrigger value="rules">{t("meal.rules")}</TabsTrigger>
        </TabsList>

        <TabsContent value="control" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("meal.scope")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label={t("meal.scope")} htmlFor="bulk-scope">
                  <Select value={scope} onValueChange={(v) => setScope(v as ScopeType)}>
                    <SelectTrigger id="bulk-scope">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="room">{t("meal.scopeRoom")}</SelectItem>
                      <SelectItem value="floor">{t("meal.scopeFloor")}</SelectItem>
                      <SelectItem value="all">{t("meal.scopeAll")}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                {scope === "floor" && (
                  <FormField label={t("common.floor")} htmlFor="bulk-floor">
                    <Select value={floor} onValueChange={setFloor}>
                      <SelectTrigger id="bulk-floor">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {([1, 2, 3] as const).map((f) => (
                          <SelectItem key={f} value={String(f)}>
                            {t(`overview.floorsLabel.${f}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
                {scope === "room" && (
                  <FormField label={t("common.room")} htmlFor="bulk-room">
                    <Select value={room} onValueChange={setRoom}>
                      <SelectTrigger id="bulk-room">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((r) => (
                          <SelectItem key={r.number} value={String(r.number)}>
                            {fmt.digits(r.number)} · {t(`overview.floorsLabel.${r.floor}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="success" onClick={() => bulk.request(target, true)}>
                  <Power />
                  {t("meal.setOn")}
                </Button>
                <Button variant="danger" onClick={() => bulk.request(target, false)}>
                  <PowerOff />
                  {t("meal.setOff")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <section aria-labelledby="meal-beds">
            <h2 id="meal-beds" className="mb-3 text-lg font-semibold">
              {t("admin.beds")}
            </h2>
            <BedsTable mode="meals" />
          </section>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>{t("meal.rules")}</CardTitle>
            </CardHeader>
            <CardContent>
              <RulesForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {bulk.dialog}
    </>
  );
}
