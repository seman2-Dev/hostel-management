import type { FoodRating, MarketCategory, MarketPurchase, MealType, Resident, Room } from "@/types";
import { daysAgoISO } from "@/mocks/seed-utils";
import { average, round2, sum } from "./utils";
import { mealHistoryFor, monthOf } from "./hostel";

export interface DayTotal {
  date: string;
  total: number;
}

/** Expense per calendar day for the last `days` days (oldest first, zero-filled). */
export function dailyExpenses(purchases: MarketPurchase[], days: number): DayTotal[] {
  const map = new Map<string, number>();
  for (const p of purchases) map.set(p.date, (map.get(p.date) ?? 0) + p.totalPrice);
  const out: DayTotal[] = [];
  for (let d = days - 1; d >= 0; d--) {
    const date = daysAgoISO(d);
    out.push({ date, total: round2(map.get(date) ?? 0) });
  }
  return out;
}

export function categoryTotals(purchases: MarketPurchase[]): Array<{ category: MarketCategory; total: number }> {
  const map = new Map<MarketCategory, number>();
  for (const p of purchases) map.set(p.category, (map.get(p.category) ?? 0) + p.totalPrice);
  return Array.from(map, ([category, total]) => ({ category, total: round2(total) })).sort((a, b) => b.total - a.total);
}

export function monthlyTotals(purchases: MarketPurchase[]): Array<{ month: string; total: number }> {
  const map = new Map<string, number>();
  for (const p of purchases) map.set(monthOf(p.date), (map.get(monthOf(p.date)) ?? 0) + p.totalPrice);
  return Array.from(map, ([month, total]) => ({ month, total: round2(total) })).sort((a, b) => a.month.localeCompare(b.month));
}

export function currentMonth(): string {
  return daysAgoISO(0).slice(0, 7);
}

export function previousMonth(): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const HISTORY_DAYS = 62;

export interface ResidentMonth {
  resident: Resident;
  meals: number;
  days: number;
}

/** Per-resident meal totals for one month, derived from the deterministic mock history. */
export function residentMonthlyMeals(residents: Resident[], month: string): ResidentMonth[] {
  return residents
    .filter((r) => r.bedId)
    .map((resident) => {
      const entries = mealHistoryFor(resident, HISTORY_DAYS).filter((e) => monthOf(e.date) === month);
      const meals = sum(entries.map((e) => Number(e.breakfast) + Number(e.lunch) + Number(e.dinner)));
      const days = entries.filter((e) => e.breakfast || e.lunch || e.dinner).length;
      return { resident, meals, days };
    });
}

/** Total hostel meals served per day for the last `days` days (oldest first). */
export function hostelMealTrend(residents: Resident[], days: number): Array<{ date: string; meals: number }> {
  const totals = new Map<string, number>();
  for (const r of residents) {
    if (!r.bedId || !r.active) continue;
    for (const e of mealHistoryFor(r, days)) {
      totals.set(e.date, (totals.get(e.date) ?? 0) + Number(e.breakfast) + Number(e.lunch) + Number(e.dinner));
    }
  }
  const out: Array<{ date: string; meals: number }> = [];
  for (let d = days - 1; d >= 0; d--) {
    const date = daysAgoISO(d);
    out.push({ date, meals: totals.get(date) ?? 0 });
  }
  return out;
}

export function monthlyMealTotals(residents: Resident[]): Array<{ month: string; meals: number }> {
  const prev = previousMonth();
  const cur = currentMonth();
  return [prev, cur].map((month) => ({ month, meals: sum(residentMonthlyMeals(residents, month).map((r) => r.meals)) }));
}

export function ratingAverageByMeal(ratings: FoodRating[]): Array<{ mealType: MealType; average: number; count: number }> {
  return (["BREAKFAST", "LUNCH", "DINNER"] as const).map((mealType) => {
    const list = ratings.filter((r) => r.mealType === mealType);
    return { mealType, average: round2(average(list.map((r) => r.stars))), count: list.length };
  });
}

export function occupancyByFloor(rooms: Room[]): Array<{ floor: 1 | 2 | 3; occupied: number; vacant: number }> {
  return ([1, 2, 3] as const).map((floor) => {
    const beds = rooms.filter((r) => r.floor === floor).flatMap((r) => r.beds);
    const occupied = beds.filter((b) => b.residentId).length;
    return { floor, occupied, vacant: beds.length - occupied };
  });
}
