import type {
  Announcement,
  Bed,
  BedStatus,
  FoodRating,
  HostelSettings,
  MealHistoryEntry,
  MarketPurchase,
  MealType,
  Resident,
  Room,
} from "@/types";
import { average, round2, sum } from "./utils";
import { daysAgoISO, mulberry32 } from "@/mocks/seed-utils";

export function bedStatus(bed: Bed): BedStatus {
  if (!bed.residentId) return "UNASSIGNED";
  return bed.mealOn ? "ON" : "OFF";
}

export const BED_COLORS: Record<BedStatus, string> = {
  ON: "#16a34a",
  OFF: "#dc2626",
  UNASSIGNED: "#8b949e",
};

export function roomMealsOn(room: Room): number {
  return room.beds.filter((b) => b.residentId && b.mealOn).length;
}

export function roomOccupied(room: Room): number {
  return room.beds.filter((b) => b.residentId).length;
}

export function ratingStats(ratings: FoodRating[]) {
  return { average: round2(average(ratings.map((r) => r.stars))), count: ratings.length };
}

export function ratingsFor(ratings: FoodRating[], date: string, mealType?: MealType) {
  return ratings.filter((r) => r.date === date && (!mealType || r.mealType === mealType));
}

/** Server rule mirrored on the client: total = quantity × unit price. */
export function purchaseTotal(quantity: number, unitPrice: number): number {
  return round2(quantity * unitPrice);
}

export function totalCost(purchases: MarketPurchase[]): number {
  return round2(sum(purchases.map((p) => p.totalPrice)));
}

export function monthOf(date: string): string {
  return date.slice(0, 7);
}

/** Meal cost using the admin-configurable billing formula. */
export function calculateMealCost(meals: number, daysWithMeals: number, settings: HostelSettings): number {
  switch (settings.billingFormula) {
    case "PER_DAY_MEALS":
      return round2(settings.mealRate * daysWithMeals);
    case "FIXED_PLUS_PER_MEAL":
      return round2(settings.fixedMonthlyCharge + settings.mealRate * meals);
    case "PER_MEAL":
    default:
      return round2(settings.mealRate * meals);
  }
}

/** Deterministic mock meal history for a resident (most recent day first). */
export function mealHistoryFor(resident: Resident, days = 30): MealHistoryEntry[] {
  let seed = 0;
  for (const ch of resident.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = mulberry32(seed);
  const entries: MealHistoryEntry[] = [];
  for (let d = 0; d < days; d++) {
    const date = daysAgoISO(d);
    entries.push({
      id: `${resident.id}-${date}`,
      residentId: resident.id,
      bedId: resident.bedId ?? "",
      date,
      breakfast: rand() > 0.25,
      lunch: rand() > 0.08,
      dinner: rand() > 0.12,
    });
  }
  return entries;
}

export function countMeals(entries: MealHistoryEntry[]): number {
  return sum(entries.map((e) => Number(e.breakfast) + Number(e.lunch) + Number(e.dinner)));
}

export function daysWithAnyMeal(entries: MealHistoryEntry[]): number {
  return entries.filter((e) => e.breakfast || e.lunch || e.dinner).length;
}

export type AnnouncementState = "visible" | "scheduled" | "expired" | "disabled";

export function announcementState(a: Announcement, now: Date = new Date()): AnnouncementState {
  if (!a.active) return "disabled";
  if (new Date(a.startsAt) > now) return "scheduled";
  if (a.expiresAt && new Date(a.expiresAt) < now) return "expired";
  return "visible";
}

/** Announcements residents should currently see, highest priority first. */
export function visibleAnnouncements(list: Announcement[], now: Date = new Date()): Announcement[] {
  return list
    .filter((a) => announcementState(a, now) === "visible")
    .sort((a, b) => b.priority - a.priority || b.startsAt.localeCompare(a.startsAt));
}

export function floorLabelKey(floor: number): "overview.floorsLabel.1" | "overview.floorsLabel.2" | "overview.floorsLabel.3" {
  return `overview.floorsLabel.${floor as 1 | 2 | 3}`;
}
