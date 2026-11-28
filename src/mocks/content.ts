import type {
  ActivityLogEntry,
  Announcement,
  AppNotification,
  DailyMenu,
  FoodRating,
  HostelSettings,
  MarketItem,
  MarketPurchase,
  MealType,
} from "@/types";
import { daysAgoISO, daysAheadISO, mulberry32, todayISO } from "./seed-utils";

export const DEFAULT_SETTINGS: HostelSettings = {
  hostelNameEn: "Shahid Monayem Chhatrabas",
  hostelNameBn: "শহীদ মোনায়েম ছাত্রাবাস",
  established: 1963,
  mealRate: 55,
  billingFormula: "PER_MEAL",
  fixedMonthlyCharge: 300,
  cancelDeadline: "23:00",
  activateDeadline: "23:00",
  mealTimes: { BREAKFAST: "07:30", LUNCH: "13:00", DINNER: "20:00" },
  autoResetDaily: true,
  defaultMealState: true,
  currency: "BDT",
};

/* ----------------------------- Menus ----------------------------- */

function dish(
  id: string,
  mealType: MealType,
  nameEn: string,
  nameBn: string,
  descriptionEn: string,
  descriptionBn: string,
  special = false,
) {
  return { id, mealType, nameEn, nameBn, descriptionEn, descriptionBn, image: "", special };
}

export function seedMenus(): DailyMenu[] {
  const today = todayISO();
  return [
    {
      id: "menu-today",
      date: today,
      published: true,
      items: [
        dish("mi-1", "BREAKFAST", "Paratha & Vegetable Curry", "পরোটা ও সবজি ভাজি", "Two hot parathas with mixed vegetable curry and a boiled egg.", "দুইটি গরম পরোটা, মিশ্র সবজি ভাজি ও একটি সিদ্ধ ডিম।"),
        dish("mi-2", "LUNCH", "Rice, Rui Fish & Dal", "ভাত, রুই মাছ ও ডাল", "Steamed rice with rui fish curry, masoor dal and seasonal bhaji.", "ভাতের সাথে রুই মাছের ঝোল, মসুর ডাল ও মৌসুমি ভাজি।"),
        dish("mi-3", "DINNER", "Rice & Chicken Curry", "ভাত ও মুরগির ঝোল", "Rice with home-style chicken curry, potato mash and salad.", "ভাতের সাথে ঘরোয়া মুরগির ঝোল, আলু ভর্তা ও সালাদ।"),
        dish("mi-4", "DINNER", "Firni (Special)", "ফিরনি (বিশেষ)", "Creamy rice pudding served after dinner.", "রাতের খাবারের পর পরিবেশিত ক্রিমি ফিরনি।", true),
      ],
    },
    {
      id: "menu-tomorrow",
      date: daysAheadISO(1),
      published: false,
      items: [
        dish("mi-5", "BREAKFAST", "Khichuri", "খিচুড়ি", "Light moong dal khichuri with fried egg.", "হালকা মুগ ডালের খিচুড়ি ও ডিম ভাজি।"),
        dish("mi-6", "LUNCH", "Rice, Beef & Dal", "ভাত, গরুর মাংস ও ডাল", "Rice with beef bhuna and dal.", "ভাতের সাথে গরুর মাংসের ভুনা ও ডাল।"),
        dish("mi-7", "DINNER", "Rice, Egg Curry & Vegetables", "ভাত, ডিমের ঝোল ও সবজি", "Rice with egg curry and mixed vegetables.", "ভাতের সাথে ডিমের ঝোল ও মিশ্র সবজি।"),
      ],
    },
    {
      id: "menu-yesterday",
      date: daysAgoISO(1),
      published: true,
      items: [
        dish("mi-8", "BREAKFAST", "Ruti & Dal", "রুটি ও ডাল", "Three rotis with thick dal.", "তিনটি রুটি ও ঘন ডাল।"),
        dish("mi-9", "LUNCH", "Rice, Hilsa & Dal", "ভাত, ইলিশ ও ডাল", "Rice with hilsa curry and dal.", "ভাতের সাথে ইলিশের ঝোল ও ডাল।"),
        dish("mi-10", "DINNER", "Rice & Beef Curry", "ভাত ও গরুর মাংস", "Rice with beef curry and salad.", "ভাতের সাথে গরুর মাংসের তরকারি ও সালাদ।"),
      ],
    },
  ];
}

/* ----------------------------- Ratings ----------------------------- */

const SAMPLE_FEEDBACK: Array<[string, string]> = [
  ["Tasty and hot, thank you.", ""],
  ["Fish was a little small this time.", ""],
  ["Please add more vegetables.", ""],
  ["Excellent today!", ""],
  ["Rice was slightly undercooked.", ""],
  ["", ""],
  ["Portion size was perfect.", ""],
];

export function seedRatings(residentNames: Array<{ id: string; name: string }>): FoodRating[] {
  const rand = mulberry32(77);
  const types: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];
  const out: FoodRating[] = [];
  const dates = [todayISO(), daysAgoISO(1)];
  let n = 0;
  for (const date of dates) {
    for (const mealType of types) {
      const count = 14 + Math.floor(rand() * 8);
      for (let i = 0; i < count; i++) {
        const r = residentNames[(i * 5 + n) % residentNames.length];
        const stars = (Math.min(5, Math.max(1, Math.round(3 + rand() * 2.2 - rand() * 1.2))) as 1 | 2 | 3 | 4 | 5);
        out.push({
          id: `rt-${++n}`,
          residentId: r.id,
          residentName: r.name,
          date,
          mealType,
          stars,
          feedback: SAMPLE_FEEDBACK[Math.floor(rand() * SAMPLE_FEEDBACK.length)][0],
          createdAt: `${date}T${String(8 + Math.floor(rand() * 12)).padStart(2, "0")}:15:00`,
        });
      }
    }
  }
  // The demo resident (res-001) has not rated today's dinner so the rating form is demonstrable.
  return out.filter((r) => !(r.residentId === "res-001" && r.date === todayISO() && r.mealType === "DINNER"));
}

/* ----------------------------- Announcements ----------------------------- */

export function seedAnnouncements(): Announcement[] {
  const start = `${daysAgoISO(1)}T08:00:00`;
  return [
    { id: "an-1", titleEn: "Today's market collection starts at 5 PM.", titleBn: "আজকের বাজারের টাকা সংগ্রহ বিকেল ৫টা থেকে শুরু।", style: "IMPORTANT", priority: 4, startsAt: start, expiresAt: `${daysAheadISO(1)}T23:59:00`, scrolling: true, active: true },
    { id: "an-2", titleEn: "Monthly meal payments are due tomorrow.", titleBn: "মাসিক মিলের টাকা আগামীকালের মধ্যে পরিশোধ করতে হবে।", style: "IMPORTANT", priority: 5, startsAt: start, expiresAt: `${daysAheadISO(1)}T23:59:00`, scrolling: true, active: true },
    { id: "an-3", titleEn: "Water supply will be unavailable from 2 PM to 4 PM.", titleBn: "দুপুর ২টা থেকে ৪টা পর্যন্ত পানি সরবরাহ বন্ধ থাকবে।", style: "EMERGENCY", priority: 5, startsAt: start, expiresAt: `${daysAheadISO(1)}T18:00:00`, scrolling: true, active: true },
    { id: "an-4", titleEn: "Special dinner tonight — firni after the meal.", titleBn: "আজ রাতে বিশেষ নৈশভোজ — খাবারের পর ফিরনি।", style: "EVENT", priority: 3, startsAt: start, expiresAt: `${todayISO()}T23:59:00`, scrolling: true, active: true },
    { id: "an-5", titleEn: "Please switch off lights and fans when leaving your room.", titleBn: "রুম থেকে বের হওয়ার সময় লাইট ও ফ্যান বন্ধ করুন।", style: "GENERAL", priority: 2, startsAt: start, expiresAt: null, scrolling: true, active: true },
    { id: "an-6", titleEn: "Annual hostel cultural night — registration opens next week.", titleBn: "বার্ষিক সাংস্কৃতিক সন্ধ্যা — আগামী সপ্তাহে নিবন্ধন শুরু।", style: "EVENT", priority: 2, startsAt: `${daysAheadISO(3)}T08:00:00`, expiresAt: `${daysAheadISO(20)}T23:59:00`, scrolling: true, active: true },
  ];
}

/* ----------------------------- Market ----------------------------- */

const mk = (
  id: string,
  nameEn: string,
  nameBn: string,
  category: MarketItem["category"],
  defaultUnit: MarketItem["defaultUnit"],
  defaultUnitPrice: number,
): MarketItem => ({ id, nameEn, nameBn, category, defaultUnit, defaultUnitPrice, isDefault: true });

export const DEFAULT_MARKET_ITEMS: MarketItem[] = [
  mk("mk-rice", "Rice", "চাল", "GRAIN", "kg", 62),
  mk("mk-lentil", "Lentils", "ডাল", "GRAIN", "kg", 130),
  mk("mk-potato", "Potatoes", "আলু", "VEGETABLE", "kg", 40),
  mk("mk-onion", "Onions", "পেঁয়াজ", "VEGETABLE", "kg", 75),
  mk("mk-veg", "Vegetables", "সবজি", "VEGETABLE", "kg", 55),
  mk("mk-fish", "Fish", "মাছ", "PROTEIN", "kg", 280),
  mk("mk-chicken", "Chicken", "মুরগি", "PROTEIN", "kg", 190),
  mk("mk-beef", "Beef", "গরুর মাংস", "PROTEIN", "kg", 750),
  mk("mk-egg", "Eggs", "ডিম", "DAIRY_EGG", "dozen", 150),
  mk("mk-oil", "Oil", "তেল", "OIL_SPICE", "liter", 185),
  mk("mk-salt", "Salt", "লবণ", "OIL_SPICE", "kg", 45),
  mk("mk-spice", "Spices", "মসলা", "OIL_SPICE", "packet", 60),
  mk("mk-other", "Other essentials", "অন্যান্য প্রয়োজনীয় জিনিস", "OTHER", "piece", 100),
];

export function seedPurchases(): MarketPurchase[] {
  const rand = mulberry32(2024);
  const out: MarketPurchase[] = [];
  let n = 0;
  for (let day = 0; day < 45; day++) {
    const date = daysAgoISO(day);
    const picks = DEFAULT_MARKET_ITEMS.filter(() => rand() > 0.38);
    for (const item of picks) {
      const base = item.defaultUnit === "kg" || item.defaultUnit === "liter" ? 4 + rand() * 26 : 1 + Math.floor(rand() * 6);
      const quantity = Math.round(base * 10) / 10;
      const unitPrice = Math.round(item.defaultUnitPrice * (0.92 + rand() * 0.16));
      out.push({
        id: `pu-${++n}`,
        itemId: item.id,
        nameEn: item.nameEn,
        nameBn: item.nameBn,
        category: item.category,
        quantity,
        unit: item.defaultUnit,
        unitPrice,
        totalPrice: Math.round(quantity * unitPrice * 100) / 100,
        date,
        description: "",
        receiptImage: null,
      });
    }
  }
  return out;
}

/* ----------------------------- Notifications & logs ----------------------------- */

export function seedNotifications(): AppNotification[] {
  const now = new Date();
  const iso = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString();
  return [
    { id: "nt-1", type: "ANNOUNCEMENT", titleEn: "New announcement: water supply interruption 2–4 PM", titleBn: "নতুন ঘোষণা: দুপুর ২–৪টা পানি সরবরাহ বন্ধ", createdAt: iso(25), read: false },
    { id: "nt-2", type: "MENU", titleEn: "Today's menu has been published", titleBn: "আজকের মেনু প্রকাশ করা হয়েছে", createdAt: iso(140), read: false },
    { id: "nt-3", type: "PAYMENT", titleEn: "Monthly meal payment is due tomorrow", titleBn: "মাসিক মিলের টাকা আগামীকাল পরিশোধ্য", createdAt: iso(300), read: false },
    { id: "nt-4", type: "MEAL_STATUS", titleEn: "Your meal was switched ON for today", titleBn: "আজকের জন্য আপনার মিল চালু করা হয়েছে", createdAt: iso(900), read: true },
    { id: "nt-5", type: "ADMIN", titleEn: "Room inspection on Friday morning", titleBn: "শুক্রবার সকালে রুম পরিদর্শন", createdAt: iso(2000), read: true },
  ];
}

export function seedActivityLog(): ActivityLogEntry[] {
  const now = new Date();
  const iso = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString();
  return [
    { id: "al-1", action: "bedMeal", params: { bed: "104-B" }, adminName: "Admin", createdAt: iso(35), previousValue: "ON", newValue: "OFF" },
    { id: "al-2", action: "announcementSaved", adminName: "Admin", createdAt: iso(120), previousValue: "—", newValue: "Water supply interruption" },
    { id: "al-3", action: "residentAssigned", params: { bed: "207-C" }, adminName: "Admin", createdAt: iso(600), previousValue: "Vacant", newValue: "Assigned" },
    { id: "al-4", action: "purchaseEdited", params: { name: "Fish" }, adminName: "Admin", createdAt: iso(1500), previousValue: "৳2,800", newValue: "৳3,080" },
    { id: "al-5", action: "mealRateUpdated", adminName: "Admin", createdAt: iso(4000), previousValue: "৳50", newValue: "৳55" },
  ];
}
