import type { BedStatus } from "@/types";

/** World dimensions (arbitrary units). X axis: WEST = negative, EAST = positive. */
export const RW = 2.2; // room width
export const RH = 1.7; // clear room height
export const SLAB = 0.2; // floor slab thickness
export const FP = RH + SLAB; // floor-to-floor pitch
export const RD = 3.0; // room depth
export const BD = 0.9; // balcony depth (in front of the room, +z = south / front)
export const PLINTH = 0.45;
export const ROOMS_PER_FLOOR = 10;
export const BUILD_W = RW * ROOMS_PER_FLOOR;

/** Y of the finished floor surface for floors 1..3. */
export const floorY = (floor: number) => PLINTH + (floor - 1) * FP;
/** X of the room centre; position 0 = westernmost, 9 = easternmost. */
export const roomCenterX = (position: number) => (position - (ROOMS_PER_FLOOR - 1) / 2) * RW;

export const PALETTE = {
  ochre: "#e3ad4d",
  cream: "#f1efe8",
  red: "#b53a37",
  green: "#2d8a68",
  wood: "#6a4325",
  tile: "#efe3c6",
  gray: "#9aa3a8",
  dark: "#1f2933",
  glassFront: "#bfe6f4",
  glassBack: "#9fd3e8",
} as const;

export const STATUS_COLORS: Record<BedStatus, string> = {
  ON: "#22c55e",
  OFF: "#ef4444",
  UNASSIGNED: "#94a3b8",
};

/** Bed corner layout inside a room: A back-left, B back-right, C front-left, D front-right. */
export const BED_SLOTS: Record<"A" | "B" | "C" | "D", { x: number; z: number; headDir: 1 | -1 }> = {
  A: { x: -0.62, z: -0.82, headDir: -1 },
  B: { x: 0.62, z: -0.82, headDir: -1 },
  C: { x: -0.62, z: 0.82, headDir: 1 },
  D: { x: 0.62, z: 0.82, headDir: 1 },
};

export const BED_SIZE = { w: 0.74, l: 1.25 };
