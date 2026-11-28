/**
 * API CONTRACT (Phase 2 integration map)
 *
 * Every action exposed by `useHostel()` / `useAuth()` in Phase 1 maps to one endpoint below.
 * The backend must accept and return the shared types from `@/types`.
 * Phase 1 does NOT call any of these — the mock store implements the same behaviour locally.
 *
 * Auth rules for Phase 2: roles come from the server session only; every ADMIN route must
 * re-check the role on the server; RESIDENT routes are scoped to the caller's own records.
 */

import type {
  ActivityLogEntry,
  Announcement,
  AppNotification,
  DailyMenu,
  FloorNumber,
  FoodRating,
  HostelSettings,
  MarketItem,
  MarketPurchase,
  Resident,
  Room,
  User,
} from "@/types";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type Access = "PUBLIC" | "RESIDENT" | "ADMIN";

export interface Endpoint<Req = void, Res = void> {
  method: HttpMethod;
  path: string;
  access: Access;
  /** Phantom fields used only to carry types. */
  _req?: Req;
  _res?: Res;
}

const ep = <Req = void, Res = void>(method: HttpMethod, path: string, access: Access): Endpoint<Req, Res> => ({
  method,
  path,
  access,
});

export const API = {
  /* auth */
  login: ep<{ email: string; password: string }, { user: User }>("POST", "/auth/login", "PUBLIC"),
  register: ep<
    { name: string; email: string; phone: string; studentId: string; department: string; password: string },
    { user: User }
  >("POST", "/auth/register", "PUBLIC"),
  logout: ep("POST", "/auth/logout", "RESIDENT"),
  me: ep<void, { user: User }>("GET", "/auth/me", "RESIDENT"),

  /* hostel structure & meals */
  listRooms: ep<{ floor?: FloorNumber; q?: string }, Room[]>("GET", "/rooms", "PUBLIC"),
  setBedMeal: ep<{ on: boolean }, void>("PATCH", "/beds/:bedId/meal", "ADMIN"),
  bulkSetMeal: ep<{ scope: "room" | "floor" | "all"; target?: number; on: boolean }, { updated: number }>(
    "POST",
    "/meals/bulk",
    "ADMIN",
  ),
  myMealToggle: ep<{ on: boolean }, void>("PATCH", "/me/meal", "RESIDENT"),
  mealHistory: ep<{ residentId?: string; from?: string; to?: string }, unknown[]>("GET", "/meals/history", "RESIDENT"),

  /* residents */
  listResidents: ep<void, Resident[]>("GET", "/residents", "ADMIN"),
  saveResident: ep<Partial<Resident>, Resident>("PUT", "/residents/:id", "ADMIN"),
  removeResident: ep("DELETE", "/residents/:id", "ADMIN"),
  assignBed: ep<{ bedId: string | null }, void>("PATCH", "/residents/:id/bed", "ADMIN"),
  setResidentActive: ep<{ active: boolean }, void>("PATCH", "/residents/:id/active", "ADMIN"),

  /* menus & ratings */
  todayMenu: ep<void, DailyMenu | null>("GET", "/menus/today", "PUBLIC"),
  listMenus: ep<void, DailyMenu[]>("GET", "/menus", "ADMIN"),
  saveMenu: ep<DailyMenu, DailyMenu>("PUT", "/menus/:id", "ADMIN"),
  deleteMenu: ep("DELETE", "/menus/:id", "ADMIN"),
  publishMenu: ep<{ published: boolean }, void>("PATCH", "/menus/:id/publish", "ADMIN"),
  rateMeal: ep<Pick<FoodRating, "date" | "mealType" | "stars" | "feedback">, FoodRating>(
    "POST",
    "/ratings",
    "RESIDENT",
  ),
  listRatings: ep<void, FoodRating[]>("GET", "/ratings", "ADMIN"),

  /* announcements */
  listAnnouncements: ep<void, Announcement[]>("GET", "/announcements", "PUBLIC"),
  saveAnnouncement: ep<Announcement, Announcement>("PUT", "/announcements/:id", "ADMIN"),
  deleteAnnouncement: ep("DELETE", "/announcements/:id", "ADMIN"),

  /* market */
  listMarketItems: ep<void, MarketItem[]>("GET", "/market/items", "PUBLIC"),
  saveMarketItem: ep<MarketItem, MarketItem>("PUT", "/market/items/:id", "ADMIN"),
  deleteMarketItem: ep("DELETE", "/market/items/:id", "ADMIN"),
  listPurchases: ep<{ from?: string; to?: string; category?: string }, MarketPurchase[]>(
    "GET",
    "/market/purchases",
    "PUBLIC",
  ),
  savePurchase: ep<MarketPurchase, MarketPurchase>("PUT", "/market/purchases/:id", "ADMIN"),
  deletePurchase: ep("DELETE", "/market/purchases/:id", "ADMIN"),
  uploadReceipt: ep<FormData, { url: string }>("POST", "/uploads/receipt", "ADMIN"),
  uploadFoodImage: ep<FormData, { url: string }>("POST", "/uploads/food", "ADMIN"),

  /* misc */
  notifications: ep<void, AppNotification[]>("GET", "/notifications", "RESIDENT"),
  markNotificationRead: ep("PATCH", "/notifications/:id/read", "RESIDENT"),
  activityLog: ep<void, ActivityLogEntry[]>("GET", "/activity-log", "ADMIN"),
  getSettings: ep<void, HostelSettings>("GET", "/settings", "ADMIN"),
  updateSettings: ep<Partial<HostelSettings>, HostelSettings>("PATCH", "/settings", "ADMIN"),
  reports: ep<{ month: string }, unknown>("GET", "/reports/monthly", "ADMIN"),
} as const;
