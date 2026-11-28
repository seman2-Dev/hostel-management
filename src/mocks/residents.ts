import type { Bed, Resident, Room } from "@/types";
import { ALL_ROOM_NUMBERS, BED_LABELS, buildRooms } from "./structure";
import { daysAgoISO, mulberry32 } from "./seed-utils";

const FIRST_NAMES: Array<[string, string]> = [
  ["Rahim", "রহিম"], ["Karim", "করিম"], ["Hasan", "হাসান"], ["Sajjad", "সাজ্জাদ"], ["Tanvir", "তানভীর"],
  ["Imran", "ইমরান"], ["Rakib", "রাকিব"], ["Sabbir", "সাব্বির"], ["Arif", "আরিফ"], ["Nayeem", "নাঈম"],
  ["Shakil", "শাকিল"], ["Mahfuz", "মাহফুজ"], ["Rubel", "রুবেল"], ["Fahim", "ফাহিম"], ["Jubayer", "জুবায়ের"],
  ["Mizanur", "মিজানুর"], ["Asif", "আসিফ"], ["Tamim", "তামিম"], ["Siam", "সিয়াম"], ["Mehedi", "মেহেদী"],
  ["Rafi", "রাফি"], ["Zahid", "জাহিদ"], ["Kamrul", "কামরুল"], ["Nahid", "নাহিদ"], ["Sohel", "সোহেল"],
];

const LAST_NAMES: Array<[string, string]> = [
  ["Hossain", "হোসেন"], ["Ahmed", "আহমেদ"], ["Islam", "ইসলাম"], ["Khan", "খান"], ["Uddin", "উদ্দিন"],
  ["Rahman", "রহমান"], ["Chowdhury", "চৌধুরী"], ["Mia", "মিয়া"], ["Sarkar", "সরকার"], ["Talukder", "তালুকদার"],
];

const DEPARTMENTS = ["CSE", "EEE", "English", "Bangla", "Economics", "Physics", "Chemistry", "Accounting", "Law", "Sociology"];

export const TOTAL_BEDS = ALL_ROOM_NUMBERS.length * BED_LABELS.length; // 120

/** Number of occupied beds in the demo dataset (remaining beds are vacant). */
const OCCUPIED_TARGET = 104;

export interface SeededHostel {
  rooms: Room[];
  residents: Resident[];
}

export function seedHostel(): SeededHostel {
  const rooms = buildRooms();
  const rand = mulberry32(1963);
  const residents: Resident[] = [];

  const allBeds: Bed[] = rooms.flatMap((r) => r.beds);
  // Choose which beds stay vacant — deterministic, spread across the building.
  const vacant = new Set<string>();
  while (vacant.size < TOTAL_BEDS - OCCUPIED_TARGET) {
    vacant.add(allBeds[Math.floor(rand() * allBeds.length)].id);
  }

  let counter = 0;
  for (const bed of allBeds) {
    if (vacant.has(bed.id)) continue;
    const first = FIRST_NAMES[counter % FIRST_NAMES.length];
    const last = LAST_NAMES[(counter * 7 + Math.floor(counter / FIRST_NAMES.length)) % LAST_NAMES.length];
    const id = `res-${String(counter + 1).padStart(3, "0")}`;
    const resident: Resident = {
      id,
      name: `${first[0]} ${last[0]}`,
      nameBn: `${first[1]} ${last[1]}`,
      email: `${first[0].toLowerCase()}.${last[0].toLowerCase()}${counter + 1}@student.example.edu`,
      phone: `01${["7", "8", "9", "5", "6"][counter % 5]}${String(10000000 + Math.floor(rand() * 89999999))}`,
      studentId: `${22}${String(1000 + counter * 3)}`,
      department: DEPARTMENTS[counter % DEPARTMENTS.length],
      active: rand() > 0.04,
      bedId: bed.id,
      joinedAt: daysAgoISO(30 + Math.floor(rand() * 600)),
    };
    bed.residentId = id;
    bed.mealOn = resident.active && rand() > 0.22;
    residents.push(resident);
    counter += 1;
  }

  // The demo "resident" account always maps to the first resident, active with meals ON.
  const demo = residents[0];
  demo.email = DEMO_RESIDENT_EMAIL;
  demo.active = true;
  const demoBed = allBeds.find((b) => b.id === demo.bedId);
  if (demoBed) demoBed.mealOn = true;

  return { rooms, residents };
}

/** Fixed demo residents so the demo "resident" login always lands on a real bed. */
export const DEMO_RESIDENT_EMAIL = "resident@demo.hostel";
export const DEMO_ADMIN_EMAIL = "admin@demo.hostel";
export const DEMO_PASSWORD = "Demo@12345";
