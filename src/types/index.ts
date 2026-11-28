/**
 * Shared domain types. The Phase 2 backend (Prisma) must mirror these shapes.
 * Dates are ISO strings (YYYY-MM-DD or full ISO timestamps) so they serialize cleanly over JSON.
 */

export type Locale = "bn" | "en";
export type Role = "ADMIN" | "RESIDENT";
export type MealType = "BREAKFAST" | "LUNCH" | "DINNER";
export type BedStatus = "ON" | "OFF" | "UNASSIGNED";
export type FloorNumber = 1 | 2 | 3;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  residentId?: string;
}

export interface Resident {
  id: string;
  name: string;
  nameBn: string;
  email: string;
  phone: string;
  studentId: string;
  department: string;
  active: boolean;
  bedId: string | null;
  joinedAt: string;
}

export interface Floor {
  id: string;
  number: FloorNumber;
  nameEn: string;
  nameBn: string;
}

export interface Bed {
  id: string; // e.g. "100-A"
  roomNumber: number;
  label: "A" | "B" | "C" | "D";
  floor: FloorNumber;
  residentId: string | null;
  mealOn: boolean;
}

export interface Room {
  number: number; // unique identifier, e.g. 100, 201, 310
  floor: FloorNumber;
  /** 0 = westernmost, 9 = easternmost */
  position: number;
  beds: Bed[];
}

export interface MealHistoryEntry {
  id: string;
  residentId: string;
  bedId: string;
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export interface MenuItem {
  id: string;
  mealType: MealType;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  image: string;
  special: boolean;
}

export interface DailyMenu {
  id: string;
  date: string;
  published: boolean;
  items: MenuItem[];
}

export interface FoodRating {
  id: string;
  residentId: string;
  residentName: string;
  date: string;
  mealType: MealType;
  stars: 1 | 2 | 3 | 4 | 5;
  feedback: string;
  createdAt: string;
}

export type AnnouncementStyle = "GENERAL" | "IMPORTANT" | "EMERGENCY" | "EVENT";

export interface Announcement {
  id: string;
  titleEn: string;
  titleBn: string;
  style: AnnouncementStyle;
  priority: number; // 1 (low) - 5 (high)
  startsAt: string;
  expiresAt: string | null;
  scrolling: boolean;
  active: boolean;
}

export type MarketCategory =
  | "GRAIN"
  | "VEGETABLE"
  | "PROTEIN"
  | "DAIRY_EGG"
  | "OIL_SPICE"
  | "OTHER";

export type MarketUnit = "kg" | "gram" | "liter" | "piece" | "packet" | "dozen";

export interface MarketItem {
  id: string;
  nameEn: string;
  nameBn: string;
  category: MarketCategory;
  defaultUnit: MarketUnit;
  defaultUnitPrice: number;
  isDefault: boolean;
}

export interface MarketPurchase {
  id: string;
  itemId: string | null;
  nameEn: string;
  nameBn: string;
  category: MarketCategory;
  quantity: number;
  unit: MarketUnit;
  unitPrice: number;
  /** Always quantity * unitPrice. Recomputed on the server in Phase 2. */
  totalPrice: number;
  date: string;
  description: string;
  receiptImage: string | null;
}

export type NotificationType = "ANNOUNCEMENT" | "MENU" | "MEAL_STATUS" | "PAYMENT" | "ADMIN";

export interface AppNotification {
  id: string;
  type: NotificationType;
  titleEn: string;
  titleBn: string;
  createdAt: string;
  read: boolean;
}

/** Translation key under `activity.actions` – the log stores codes, never display text. */
export type ActivityActionKey =
  | "bedMeal" | "bulkMeal" | "residentAdded" | "residentUpdated" | "residentRemoved" | "residentAssigned"
  | "bedAssignment" | "accountStatus" | "menuSaved" | "menuDeleted" | "menuPublish"
  | "announcementSaved" | "announcementDeleted" | "purchaseSaved" | "purchaseEdited" | "purchaseDeleted"
  | "defaultItemSaved" | "defaultItemDeleted" | "settingsUpdated" | "mealRateUpdated";

export interface ActivityLogEntry {
  id: string;
  action: ActivityActionKey;
  params?: Record<string, string | number>;
  adminName: string;
  createdAt: string;
  previousValue: string;
  newValue: string;
}

export type BillingFormula = "PER_MEAL" | "PER_DAY_MEALS" | "FIXED_PLUS_PER_MEAL";

export interface HostelSettings {
  hostelNameEn: string;
  hostelNameBn: string;
  established: number;
  mealRate: number;
  billingFormula: BillingFormula;
  fixedMonthlyCharge: number;
  /** "HH:mm" — residents may turn meals OFF before this time. */
  cancelDeadline: string;
  /** "HH:mm" — residents may turn meals ON before this time. */
  activateDeadline: string;
  autoResetDaily: boolean;
  defaultMealState: boolean;
  currency: "BDT";
}

export interface MealStatsPoint {
  date: string;
  meals: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
}
