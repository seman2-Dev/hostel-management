import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { BD, BUILD_W, FP, PLINTH, RD, RH, ROOMS_PER_FLOOR, RW, SLAB, floorY, roomCenterX } from "./constants";

export type MaterialKey =
  | "ochre"
  | "cream"
  | "red"
  | "green"
  | "wood"
  | "tile"
  | "gray"
  | "glassFront"
  | "glassBack";

type Bucket = THREE.BufferGeometry[];
type Buckets = Record<MaterialKey, Bucket>;

function emptyBuckets(): Buckets {
  return { ochre: [], cream: [], red: [], green: [], wood: [], tile: [], gray: [], glassFront: [], glassBack: [] };
}

function box(list: Bucket, w: number, h: number, d: number, x: number, y: number, z: number) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  list.push(g);
}

/** Frame made of four thin bars around an opening, centred on (cx, cy) at depth z. */
function frame(list: Bucket, w: number, h: number, t: number, depth: number, cx: number, cy: number, z: number, mullion = false) {
  box(list, t, h, depth, cx - w / 2 + t / 2, cy, z);
  box(list, t, h, depth, cx + w / 2 - t / 2, cy, z);
  box(list, w, t, depth, cx, cy + h / 2 - t / 2, z);
  box(list, w, t, depth, cx, cy - h / 2 + t / 2, z);
  if (mullion) box(list, t * 0.6, h, depth, cx, cy, z);
}

/**
 * Builds the whole hostel shell once and merges it into one geometry per material.
 * Proportions and colours follow the reference photo: ochre walls, red columns and bands,
 * white balcony parapets, green window frames and a grey plinth.
 */
export function buildBuildingGeometries(): Record<MaterialKey, THREE.BufferGeometry> {
  const b = emptyBuckets();
  const backEdgeZ = -RD / 2 - 0.15; // just behind the back wall
  const slabDepth = RD / 2 + BD - backEdgeZ;
  const slabCenterZ = (RD / 2 + BD + backEdgeZ) / 2;
  const frontZ = RD / 2;
  const edgeZ = RD / 2 + BD;

  // Plinth and entrance steps (grey, like the stepped base in the photo)
  box(b.gray, BUILD_W + 0.8, PLINTH, RD + BD + 1.0, 0, PLINTH / 2, 0.6);
  for (let s = 0; s < 3; s++) {
    box(b.gray, 3.2 - s * 0.2, 0.15, 0.4, 0, 0.075 + s * 0.15, edgeZ + 0.6 + (2 - s) * 0.4);
  }

  for (const floor of [1, 2, 3]) {
    const y0 = floorY(floor);

    // slab with balcony
    box(b.cream, BUILD_W + 0.5, SLAB, slabDepth, 0, y0 - SLAB / 2, slabCenterZ);
    // red band on the slab edge
    box(b.red, BUILD_W + 0.52, 0.11, 0.05, 0, y0 - 0.1, edgeZ + 0.03);

    // back wall and lintel / sill along the room fronts
    box(b.ochre, BUILD_W, RH, 0.14, 0, y0 + RH / 2, -RD / 2 - 0.07);
    box(b.ochre, BUILD_W, 0.15, 0.12, 0, y0 + RH - 0.075, frontZ);
    box(b.ochre, BUILD_W, 0.12, 0.1, 0, y0 + 0.06, frontZ);

    // balcony railing (kick plate + top rail + balusters)
    box(b.cream, BUILD_W, 0.26, 0.06, 0, y0 + 0.13, edgeZ - 0.03);
    box(b.cream, BUILD_W, 0.05, 0.08, 0, y0 + 0.62, edgeZ - 0.04);

    for (let i = 0; i <= ROOMS_PER_FLOOR; i++) {
      const x = (i - ROOMS_PER_FLOOR / 2) * RW;
      // partition walls / outer walls
      box(b.ochre, 0.12, RH, RD, x, y0 + RH / 2, 0);
      // low balcony dividers
      box(b.cream, 0.08, 0.7, BD, x, y0 + 0.35, frontZ + BD / 2);
      // red columns at the balcony edge
      box(b.red, 0.2, RH, 0.2, x, y0 + RH / 2, edgeZ - 0.1);
    }

    for (let pos = 0; pos < ROOMS_PER_FLOOR; pos++) {
      const cx = roomCenterX(pos);

      // interior tile
      box(b.tile, RW - 0.14, 0.02, RD - 0.1, cx, y0 + 0.01, 0);

      // balusters
      for (let k = 0; k < 8; k++) {
        const bx = cx - RW / 2 + 0.2 + k * ((RW - 0.4) / 7);
        box(b.cream, 0.025, 0.34, 0.025, bx, y0 + 0.43, edgeZ - 0.04);
      }

      // door (centre) with frame and an open leaf swung into the room
      box(b.green, 0.04, 1.45, 0.07, cx - 0.28, y0 + 0.725, frontZ);
      box(b.green, 0.04, 1.45, 0.07, cx + 0.28, y0 + 0.725, frontZ);
      box(b.green, 0.6, 0.05, 0.07, cx, y0 + 1.45, frontZ);
      const leaf = new THREE.BoxGeometry(0.52, 1.4, 0.04);
      leaf.translate(0.26, 0.7, 0);
      leaf.rotateY(1.2);
      leaf.translate(cx - 0.28, y0, frontZ - 0.02);
      b.wood.push(leaf);

      // front windows (green frames with light glass) on both sides of the door
      for (const side of [-1, 1]) {
        const wx = cx + side * 0.72;
        frame(b.green, 0.52, 1.05, 0.04, 0.06, wx, y0 + 0.88, frontZ, true);
        box(b.glassFront, 0.46, 0.96, 0.01, wx, y0 + 0.88, frontZ);
      }

      // back windows, visible from the front through the open room
      for (const side of [-1, 1]) {
        const wx = cx + side * 0.55;
        frame(b.green, 0.55, 0.7, 0.04, 0.05, wx, y0 + 1.0, -RD / 2 + 0.03);
        box(b.glassBack, 0.5, 0.62, 0.01, wx, y0 + 1.0, -RD / 2 + 0.02);
      }
    }
  }

  // roof slab with parapet and red cap
  const roofY = floorY(3) + RH;
  box(b.cream, BUILD_W + 0.5, SLAB, slabDepth, 0, roofY + SLAB / 2, slabCenterZ);
  box(b.red, BUILD_W + 0.52, 0.11, 0.05, 0, roofY + 0.1, edgeZ + 0.03);
  box(b.cream, BUILD_W + 0.5, 0.45, 0.1, 0, roofY + SLAB + 0.225, edgeZ);
  box(b.cream, BUILD_W + 0.5, 0.45, 0.1, 0, roofY + SLAB + 0.225, -RD / 2 - 0.15);
  box(b.cream, 0.1, 0.45, slabDepth, -BUILD_W / 2 - 0.2, roofY + SLAB + 0.225, slabCenterZ);
  box(b.cream, 0.1, 0.45, slabDepth, BUILD_W / 2 + 0.2, roofY + SLAB + 0.225, slabCenterZ);
  box(b.red, BUILD_W + 0.6, 0.06, 0.16, 0, roofY + SLAB + 0.48, edgeZ);

  const out = {} as Record<MaterialKey, THREE.BufferGeometry>;
  (Object.keys(b) as MaterialKey[]).forEach((key) => {
    const merged = mergeGeometries(b[key], false);
    out[key] = merged ?? new THREE.BufferGeometry();
    b[key].forEach((g) => g.dispose());
  });
  return out;
}

export const BUILDING_TOP = floorY(3) + RH + SLAB + 0.5;
export { FP };
