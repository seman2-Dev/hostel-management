"use client";

/**
 * Phase 1 mock "database" held in React state.
 * Every action below maps 1:1 to a future API call (see src/services/contract.ts).
 * Replace the bodies with service calls in Phase 2 without touching the UI.
 */

import * as React from "react";
import type {
  ActivityActionKey,
  ActivityLogEntry,
  Announcement,
  AppNotification,
  Bed,
  DailyMenu,
  FloorNumber,
  FoodRating,
  HostelSettings,
  MarketItem,
  MarketPurchase,
  MealType,
  Resident,
  Room,
} from "@/types";
import { seedHostel } from "@/mocks/residents";
import {
  DEFAULT_MARKET_ITEMS,
  DEFAULT_SETTINGS,
  seedActivityLog,
  seedAnnouncements,
  seedMenus,
  seedNotifications,
  seedPurchases,
  seedRatings,
} from "@/mocks/content";
import { uid } from "@/lib/utils";

export type MealScope =
  | { type: "bed"; bedId: string }
  | { type: "room"; roomNumber: number }
  | { type: "floor"; floor: FloorNumber }
  | { type: "all" };

export type ActionResult = { ok: true } | { ok: false; error: string };

interface HostelState {
  rooms: Room[];
  residents: Resident[];
  menus: DailyMenu[];
  ratings: FoodRating[];
  announcements: Announcement[];
  marketItems: MarketItem[];
  purchases: MarketPurchase[];
  notifications: AppNotification[];
  activity: ActivityLogEntry[];
  settings: HostelSettings;
}

interface HostelActions {
  /* meals */
  setBedMeal: (bedId: string, on: boolean, actor?: string) => ActionResult;
  countBedsInScope: (scope: MealScope) => number;
  bulkSetMeal: (scope: MealScope, on: boolean) => number;
  /* residents */
  saveResident: (resident: Omit<Resident, "id" | "joinedAt"> & { id?: string }) => ActionResult;
  removeResident: (id: string) => void;
  assignResident: (residentId: string, bedId: string | null) => ActionResult;
  setResidentActive: (id: string, active: boolean) => void;
  /* menus */
  saveMenu: (menu: DailyMenu) => void;
  deleteMenu: (id: string) => void;
  setMenuPublished: (id: string, published: boolean) => void;
  /* ratings */
  addRating: (rating: Omit<FoodRating, "id" | "createdAt">) => ActionResult;
  /* announcements */
  saveAnnouncement: (a: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
  /* market */
  savePurchase: (p: MarketPurchase) => void;
  deletePurchase: (id: string) => void;
  saveMarketItem: (item: MarketItem) => void;
  deleteMarketItem: (id: string) => void;
  /* misc */
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateSettings: (patch: Partial<HostelSettings>) => void;
}

interface HostelSelectors {
  allBeds: Bed[];
  getResident: (id: string | null | undefined) => Resident | undefined;
  getRoom: (roomNumber: number) => Room | undefined;
  getBed: (bedId: string) => Bed | undefined;
}

type Store = HostelState & HostelActions & HostelSelectors;

const HostelContext = React.createContext<Store | null>(null);

function initialState(): HostelState {
  const { rooms, residents } = seedHostel();
  return {
    rooms,
    residents,
    menus: seedMenus(),
    ratings: seedRatings(residents.map((r) => ({ id: r.id, name: r.name }))),
    announcements: seedAnnouncements(),
    marketItems: DEFAULT_MARKET_ITEMS,
    purchases: seedPurchases(),
    notifications: seedNotifications(),
    activity: seedActivityLog(),
    settings: DEFAULT_SETTINGS,
  };
}

export function HostelStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<HostelState>(initialState);

  const log = React.useCallback((action: ActivityActionKey, previousValue: string, newValue: string, actor = "Admin", params?: Record<string, string | number>) => {
    const entry: ActivityLogEntry = {
      id: uid("al"),
      action,
      params,
      adminName: actor,
      createdAt: new Date().toISOString(),
      previousValue,
      newValue,
    };
    setState((s) => ({ ...s, activity: [entry, ...s.activity].slice(0, 200) }));
  }, []);

  const store = React.useMemo<Store>(() => {
    const allBeds = state.rooms.flatMap((r) => r.beds);
    const getResident: Store["getResident"] = (id) => (id ? state.residents.find((r) => r.id === id) : undefined);
    const getRoom: Store["getRoom"] = (n) => state.rooms.find((r) => r.number === n);
    const getBed: Store["getBed"] = (id) => allBeds.find((b) => b.id === id);

    const bedsInScope = (scope: MealScope): Bed[] => {
      switch (scope.type) {
        case "bed":
          return allBeds.filter((b) => b.id === scope.bedId);
        case "room":
          return allBeds.filter((b) => b.roomNumber === scope.roomNumber);
        case "floor":
          return allBeds.filter((b) => b.floor === scope.floor);
        default:
          return allBeds;
      }
    };

    const mapBeds = (fn: (b: Bed) => Bed) =>
      setState((s) => ({ ...s, rooms: s.rooms.map((r) => ({ ...r, beds: r.beds.map(fn) })) }));

    return {
      ...state,
      allBeds,
      getResident,
      getRoom,
      getBed,

      setBedMeal: (bedId, on, actor) => {
        const bed = getBed(bedId);
        if (!bed) return { ok: false, error: "Bed not found" };
        if (!bed.residentId) return { ok: false, error: "Bed is unassigned" };
        mapBeds((b) => (b.id === bedId ? { ...b, mealOn: on } : b));
        log("bedMeal", bed.mealOn ? "ON" : "OFF", on ? "ON" : "OFF", actor, { bed: bedId });
        return { ok: true };
      },

      countBedsInScope: (scope) => bedsInScope(scope).filter((b) => b.residentId).length,

      bulkSetMeal: (scope, on) => {
        const targets = new Set(bedsInScope(scope).filter((b) => b.residentId).map((b) => b.id));
        mapBeds((b) => (targets.has(b.id) ? { ...b, mealOn: on } : b));
        log("bulkMeal", on ? "OFF" : "ON", `${on ? "ON" : "OFF"} × ${targets.size}`, undefined, { scope: scope.type });
        return targets.size;
      },

      saveResident: (input) => {
        const existing = input.id ? getResident(input.id) : undefined;
        if (input.bedId) {
          const bed = getBed(input.bedId);
          if (!bed) return { ok: false, error: "Bed not found" };
          if (bed.residentId && bed.residentId !== input.id) return { ok: false, error: "bedTaken" };
        }
        const id = input.id ?? uid("res");
        const resident: Resident = {
          ...(existing ?? { joinedAt: new Date().toISOString().slice(0, 10) }),
          ...input,
          id,
          joinedAt: existing?.joinedAt ?? new Date().toISOString().slice(0, 10),
        };
        setState((s) => {
          const residents = existing
            ? s.residents.map((r) => (r.id === id ? resident : r))
            : [...s.residents, resident];
          const rooms = s.rooms.map((room) => ({
            ...room,
            beds: room.beds.map((b) => {
              if (b.residentId === id && b.id !== resident.bedId) return { ...b, residentId: null, mealOn: false };
              if (b.id === resident.bedId) return { ...b, residentId: id };
              return b;
            }),
          }));
          return { ...s, residents, rooms };
        });
        log(existing ? "residentUpdated" : "residentAdded", existing ? existing.name : "—", resident.name, undefined, { name: resident.name });
        return { ok: true };
      },

      removeResident: (id) => {
        const r = getResident(id);
        setState((s) => ({
          ...s,
          residents: s.residents.filter((x) => x.id !== id),
          rooms: s.rooms.map((room) => ({
            ...room,
            beds: room.beds.map((b) => (b.residentId === id ? { ...b, residentId: null, mealOn: false } : b)),
          })),
        }));
        log("residentRemoved", r?.bedId ?? "—", "Removed", undefined, { name: r?.name ?? id });
      },

      assignResident: (residentId, bedId) => {
        if (bedId) {
          const bed = getBed(bedId);
          if (!bed) return { ok: false, error: "Bed not found" };
          if (bed.residentId && bed.residentId !== residentId) return { ok: false, error: "bedTaken" };
        }
        const prev = getResident(residentId)?.bedId ?? null;
        setState((s) => ({
          ...s,
          residents: s.residents.map((r) => (r.id === residentId ? { ...r, bedId } : r)),
          rooms: s.rooms.map((room) => ({
            ...room,
            beds: room.beds.map((b) => {
              if (b.residentId === residentId && b.id !== bedId) return { ...b, residentId: null, mealOn: false };
              if (b.id === bedId) return { ...b, residentId };
              return b;
            }),
          })),
        }));
        log("bedAssignment", prev ?? "Vacant", bedId ?? "Vacant");
        return { ok: true };
      },

      setResidentActive: (id, active) => {
        setState((s) => ({
          ...s,
          residents: s.residents.map((r) => (r.id === id ? { ...r, active } : r)),
          rooms: active
            ? s.rooms
            : s.rooms.map((room) => ({
                ...room,
                beds: room.beds.map((b) => (b.residentId === id ? { ...b, mealOn: false } : b)),
              })),
        }));
        log("accountStatus", active ? "Inactive" : "Active", active ? "Active" : "Inactive");
      },

      saveMenu: (menu) => {
        setState((s) => ({
          ...s,
          menus: s.menus.some((m) => m.id === menu.id)
            ? s.menus.map((m) => (m.id === menu.id ? menu : m))
            : [...s.menus, menu],
        }));
        log("menuSaved", "—", menu.date);
      },

      deleteMenu: (id) => {
        setState((s) => ({ ...s, menus: s.menus.filter((m) => m.id !== id) }));
        log("menuDeleted", id, "—");
      },

      setMenuPublished: (id, published) => {
        setState((s) => ({ ...s, menus: s.menus.map((m) => (m.id === id ? { ...m, published } : m)) }));
        log("menuPublish", published ? "Draft" : "Published", published ? "Published" : "Draft");
      },

      addRating: (rating) => {
        const dup = state.ratings.some(
          (r) => r.residentId === rating.residentId && r.date === rating.date && r.mealType === rating.mealType,
        );
        if (dup) return { ok: false, error: "alreadyRated" };
        const entry: FoodRating = { ...rating, id: uid("rt"), createdAt: new Date().toISOString() };
        setState((s) => ({ ...s, ratings: [entry, ...s.ratings] }));
        return { ok: true };
      },

      saveAnnouncement: (a) => {
        setState((s) => ({
          ...s,
          announcements: s.announcements.some((x) => x.id === a.id)
            ? s.announcements.map((x) => (x.id === a.id ? a : x))
            : [a, ...s.announcements],
        }));
        log("announcementSaved", "—", a.titleEn);
      },

      deleteAnnouncement: (id) => {
        setState((s) => ({ ...s, announcements: s.announcements.filter((a) => a.id !== id) }));
        log("announcementDeleted", id, "—");
      },

      savePurchase: (p) => {
        setState((s) => ({
          ...s,
          purchases: s.purchases.some((x) => x.id === p.id)
            ? s.purchases.map((x) => (x.id === p.id ? p : x))
            : [p, ...s.purchases],
        }));
        log("purchaseSaved", "—", `${p.nameEn} ৳${p.totalPrice}`);
      },

      deletePurchase: (id) => {
        setState((s) => ({ ...s, purchases: s.purchases.filter((p) => p.id !== id) }));
        log("purchaseDeleted", id, "—");
      },

      saveMarketItem: (item) => {
        setState((s) => ({
          ...s,
          marketItems: s.marketItems.some((x) => x.id === item.id)
            ? s.marketItems.map((x) => (x.id === item.id ? item : x))
            : [...s.marketItems, item],
        }));
        log("defaultItemSaved", "—", item.nameEn);
      },

      deleteMarketItem: (id) => {
        setState((s) => ({ ...s, marketItems: s.marketItems.filter((i) => i.id !== id) }));
        log("defaultItemDeleted", id, "—");
      },

      markNotificationRead: (id) =>
        setState((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),

      markAllNotificationsRead: () =>
        setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      updateSettings: (patch) => {
        setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
        log("settingsUpdated", "—", Object.keys(patch).join(", "));
      },
    };
  }, [state, log]);

  return <HostelContext.Provider value={store}>{children}</HostelContext.Provider>;
}

export function useHostel(): Store {
  const ctx = React.useContext(HostelContext);
  if (!ctx) throw new Error("useHostel must be used inside <HostelStoreProvider>");
  return ctx;
}

export const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];
