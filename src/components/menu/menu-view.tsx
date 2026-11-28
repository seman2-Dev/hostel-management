"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, Coffee, EyeOff, Moon, Sparkles, Sun } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { FoodImage } from "@/components/shared/food-image";
import { StarDisplay } from "@/components/shared/star-rating";
import { RatingBox } from "./rating-box";
import { useAuth } from "@/store/auth";
import { MEAL_TYPES, useHostel } from "@/store/hostel-store";
import { useI18n, type TranslationKey } from "@/i18n";
import { ratingStats, ratingsFor } from "@/lib/hostel";
import { todayISO } from "@/mocks/seed-utils";
import type { MealType } from "@/types";

const MEAL_ICON: Record<MealType, React.ReactNode> = {
  BREAKFAST: <Coffee className="size-5" />,
  LUNCH: <Sun className="size-5" />,
  DINNER: <Moon className="size-5" />,
};
const MEAL_KEY: Record<MealType, TranslationKey> = {
  BREAKFAST: "meal.breakfast",
  LUNCH: "meal.lunch",
  DINNER: "meal.dinner",
};

/** Today's published menu with ratings. `compact` hides the rating forms (used on the homepage). */
export function MenuView({ compact = false }: { compact?: boolean }) {
  const { menus, ratings, setMenuPublished } = useHostel();
  const { user } = useAuth();
  const { t, pick, fmt } = useI18n();
  const today = todayISO();

  const todays = menus.find((m) => m.date === today);
  const menu = todays?.published ? todays : undefined;
  const todaysRatings = ratingsFor(ratings, today);
  const overall = ratingStats(todaysRatings);

  const dateLabel = fmt.date(today, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CalendarDays className="size-4" />
          <time dateTime={today}>{dateLabel}</time>
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {menu && overall.count > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{t("menu.overallRating")}</span>
              <StarDisplay value={overall.average} />
              <span className="font-semibold">{fmt.number(overall.average, { maximumFractionDigits: 1 })}</span>
              <span className="text-muted-foreground">
                ({fmt.number(overall.count)} {t("menu.ratings")})
              </span>
            </div>
          )}
          {user?.role === "ADMIN" && todays && (
            <Button
              size="sm"
              variant={todays.published ? "outline" : "default"}
              onClick={() => {
                setMenuPublished(todays.id, !todays.published);
                toast.success(todays.published ? t("menu.unpublish") : t("menu.publish"));
              }}
            >
              {todays.published ? <EyeOff /> : <Sparkles />}
              {todays.published ? t("menu.unpublish") : t("menu.publish")}
            </Button>
          )}
        </div>
      </div>

      {!menu ? (
        <EmptyState
          title={t("menu.noMenu")}
          hint={user?.role === "ADMIN" && todays ? undefined : t("menu.noMenuHint")}
          action={
            user?.role === "ADMIN" ? (
              <Button asChild size="sm">
                <Link href="/admin/menus">{t("admin.menus")}</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {MEAL_TYPES.map((mealType) => {
            const items = menu.items.filter((i) => i.mealType === mealType);
            if (items.length === 0) return null;
            const stats = ratingStats(ratingsFor(ratings, today, mealType));
            return (
              <Card key={mealType} className="flex flex-col overflow-hidden">
                <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{MEAL_ICON[mealType]}</span>
                    {t(MEAL_KEY[mealType])}
                  </CardTitle>
                  {stats.count > 0 && (
                    <div className="text-end text-xs">
                      <StarDisplay value={stats.average} size="size-3.5" />
                      <p className="text-muted-foreground">
                        {fmt.number(stats.average, { maximumFractionDigits: 1 })} · {fmt.number(stats.count)} {t("menu.ratings")}
                      </p>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <ul className="space-y-3">
                    {items.map((item) => (
                      <li key={item.id} className="flex gap-3">
                        <div className="size-20 shrink-0 overflow-hidden rounded-xl border">
                          <FoodImage src={item.image} mealType={mealType} alt={pick(item, "name")} />
                        </div>
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-center gap-1.5 font-semibold leading-snug">
                            {pick(item, "name")}
                            {item.special && (
                              <Badge variant="warning">
                                <Sparkles className="size-3" />
                                {t("menu.special")}
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">{pick(item, "description")}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {!compact && (
                    <div className="mt-auto">
                      <RatingBox date={today} mealType={mealType} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
