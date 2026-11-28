"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Text, OrbitControls, useCursor } from "@react-three/drei";
import type { Bed, Room } from "@/types";
import { bedStatus } from "@/lib/hostel";
import { buildBuildingGeometries, BUILDING_TOP, type MaterialKey } from "./building-geometry";
import {
  BD,
  BED_SIZE,
  BED_SLOTS,
  BUILD_W,
  PALETTE,
  PLINTH,
  RD,
  RH,
  ROOMS_PER_FLOOR,
  STATUS_COLORS,
  floorY,
  roomCenterX,
} from "./constants";

export interface SceneSelection {
  roomNumber: number | null;
  bedId: string | null;
}

export interface SceneApi {
  zoom: (factor: number) => void;
  reset: () => void;
}

export interface HostelSceneProps {
  rooms: Room[];
  selection: SceneSelection;
  onSelectRoom: (roomNumber: number) => void;
  onSelectBed: (bedId: string) => void;
  quality: "high" | "low";
  isDark: boolean;
  labels: { west: string; east: string; floors: [string, string, string]; scene: string };
  formatRoom: (roomNumber: number) => string;
  roomTip: (roomNumber: number) => string;
  bedTip: (bedId: string) => string;
  apiRef: React.MutableRefObject<SceneApi | null>;
  onReady: () => void;
  onLowPerformance: () => void;
}

const VFOV = 38;
const TARGET = new THREE.Vector3(0, 3.5, 0.6);
const VIEW_DIR = new THREE.Vector3(0.45, 0.42, 0.9).normalize();

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function roomOrigin(room: Room) {
  return { x: roomCenterX(room.position), y: floorY(room.floor) };
}

function bedLocal(bed: Bed) {
  const slot = BED_SLOTS[bed.label];
  return slot;
}

/* ------------------------------------------------------------------ */
/* Static building                                                      */
/* ------------------------------------------------------------------ */

function Building({ shadows }: { shadows: boolean }) {
  const geos = React.useMemo(() => buildBuildingGeometries(), []);
  React.useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  const mats: Array<{ key: MaterialKey; color: string; transparent?: boolean; opacity?: number }> = [
    { key: "ochre", color: PALETTE.ochre },
    { key: "cream", color: PALETTE.cream },
    { key: "red", color: PALETTE.red },
    { key: "green", color: PALETTE.green },
    { key: "wood", color: PALETTE.wood },
    { key: "tile", color: PALETTE.tile },
    { key: "gray", color: PALETTE.gray },
    { key: "glassBack", color: PALETTE.glassBack },
    { key: "glassFront", color: PALETTE.glassFront, transparent: true, opacity: 0.16 },
  ];

  return (
    <group>
      {mats.map((m) => (
        <mesh key={m.key} geometry={geos[m.key]} castShadow={shadows && !m.transparent} receiveShadow={shadows} renderOrder={m.transparent ? 2 : 0}>
          <meshLambertMaterial color={m.color} transparent={m.transparent} opacity={m.opacity ?? 1} depthWrite={!m.transparent} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Surroundings (grass, path, gate, boundary wall, trees)               */
/* ------------------------------------------------------------------ */

function Tree({ x, z, s = 1, dark }: { x: number; z: number; s?: number; dark: boolean }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 1.8, 8]} />
        <meshLambertMaterial color="#6b4a2f" />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <icosahedronGeometry args={[1.25, 0]} />
        <meshLambertMaterial color={dark ? "#2f6b3a" : "#3f9a4c"} flatShading />
      </mesh>
      <mesh position={[0.5, 3.3, 0.2]}>
        <icosahedronGeometry args={[0.85, 0]} />
        <meshLambertMaterial color={dark ? "#37793f" : "#4cae58"} flatShading />
      </mesh>
    </group>
  );
}

/** Gate position: west side of the compound, scaled down so it never hides the building. */
const GATE_X = -9.5;
const GATE_SCALE = 0.7;
const GATE_GAP = 2.5 * GATE_SCALE - 0.4 * GATE_SCALE;

function Surroundings({ isDark, shadows }: { isDark: boolean; shadows: boolean }) {
  const gateZ = 11;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 4]} receiveShadow={shadows}>
        <planeGeometry args={[140, 110]} />
        <meshLambertMaterial color={isDark ? "#2d5a3a" : "#74b865"} />
      </mesh>
      {/* concrete path: gate → along the front → entrance steps */}
      {[
        { pos: [0, 0.005, 4.9] as const, size: [2.8, 3.2] as const },
        { pos: [GATE_X / 2, 0.005, 6.4] as const, size: [Math.abs(GATE_X) + 2.8, 2.8] as const },
        { pos: [GATE_X, 0.005, 8.9] as const, size: [2.8, 5.2] as const },
      ].map((seg, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[seg.pos[0], seg.pos[1], seg.pos[2]]} receiveShadow={shadows}>
          <planeGeometry args={[seg.size[0], seg.size[1]]} />
          <meshLambertMaterial color={isDark ? "#8b9296" : "#cfd3d4"} />
        </mesh>
      ))}

      {/* boundary wall with red cap, split by the gate */}
      {[
        { cx: (-24 + (GATE_X - GATE_GAP)) / 2, len: GATE_X - GATE_GAP + 24 },
        { cx: (GATE_X + GATE_GAP + 24) / 2, len: 24 - (GATE_X + GATE_GAP) },
      ].map((w, i) => (
        <group key={i}>
          <mesh position={[w.cx, 0.55, gateZ]}>
            <boxGeometry args={[w.len, 1.1, 0.3]} />
            <meshLambertMaterial color="#aab2b7" />
          </mesh>
          <mesh position={[w.cx, 1.14, gateZ]}>
            <boxGeometry args={[w.len + 0.1, 0.12, 0.38]} />
            <meshLambertMaterial color={PALETTE.red} />
          </mesh>
        </group>
      ))}

      {/* gate (after the reference photo): stepped grey pillars, green posts, dark arch with red discs */}
      <group position={[GATE_X, 0, gateZ]} scale={GATE_SCALE}>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 2.5, 0, 0]}>
            <mesh position={[0, 0.7, 0]}>
              <boxGeometry args={[0.8, 1.4, 0.8]} />
              <meshLambertMaterial color="#aab2b7" />
            </mesh>
            <mesh position={[0, 1.45, 0]}>
              <boxGeometry args={[0.95, 0.12, 0.95]} />
              <meshLambertMaterial color={PALETTE.red} />
            </mesh>
            <mesh position={[0, 1.62, 0]}>
              <boxGeometry args={[0.7, 0.12, 0.7]} />
              <meshLambertMaterial color={PALETTE.red} />
            </mesh>
            <mesh position={[side * -0.05, 2.7, 0]}>
              <boxGeometry args={[0.12, 2.1, 0.12]} />
              <meshLambertMaterial color="#1f7a4b" />
            </mesh>
          </group>
        ))}
        <group position={[0, 3.6, 0]}>
          <mesh>
            <torusGeometry args={[2.5, 0.28, 8, 32, Math.PI]} />
            <meshLambertMaterial color={PALETTE.dark} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 1.7, 1.85, 0.3]}>
              <circleGeometry args={[0.3, 20]} />
              <meshBasicMaterial color="#dc2626" />
            </mesh>
          ))}
          <mesh position={[0, 2.85, 0]}>
            <coneGeometry args={[0.18, 0.5, 6]} />
            <meshLambertMaterial color="#16a34a" />
          </mesh>
        </group>
      </group>

      <Tree x={-15} z={5} s={1.2} dark={isDark} />
      <Tree x={-12} z={9} s={0.9} dark={isDark} />
      <Tree x={15} z={4} s={1.3} dark={isDark} />
      <Tree x={13} z={8.5} s={0.95} dark={isDark} />
      <Tree x={-8} z={-6} s={1.2} dark={isDark} />
      <Tree x={9} z={-7} s={1.1} dark={isDark} />
      <Tree x={-17} z={-2} s={1} dark={isDark} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Beds (instanced) + room hit boxes                                    */
/* ------------------------------------------------------------------ */

interface BedsLayerProps {
  beds: Bed[];
  rooms: Room[];
  hoveredBed: string | null;
  selectedBed: string | null;
  bedMeshRef: React.MutableRefObject<THREE.InstancedMesh | null>;
  onHover: (bedId: string | null) => void;
  onSelect: (bedId: string) => void;
}

function BedsLayer({ beds, rooms, hoveredBed, selectedBed, bedMeshRef, onHover, onSelect }: BedsLayerProps) {
  const invalidate = useThree((s) => s.invalidate);
  const frameRef = React.useRef<THREE.InstancedMesh>(null);
  const pillowRef = React.useRef<THREE.InstancedMesh>(null);
  const roomByNumber = React.useMemo(() => new Map(rooms.map((r) => [r.number, r])), [rooms]);

  // Static layout — computed once per structure
  const layout = React.useMemo(
    () =>
      beds.map((bed) => {
        const room = roomByNumber.get(bed.roomNumber)!;
        const o = roomOrigin(room);
        const slot = bedLocal(bed);
        return { x: o.x + slot.x, y: o.y, z: slot.z, head: slot.headDir };
      }),
    [beds, roomByNumber],
  );

  React.useLayoutEffect(() => {
    const mattress = bedMeshRef.current;
    const frame = frameRef.current;
    const pillow = pillowRef.current;
    if (!mattress || !frame || !pillow) return;
    const m = new THREE.Matrix4();
    layout.forEach((p, i) => {
      m.makeTranslation(p.x, p.y + 0.09, p.z);
      frame.setMatrixAt(i, m);
      m.makeTranslation(p.x, p.y + 0.26, p.z);
      mattress.setMatrixAt(i, m);
      m.makeTranslation(p.x, p.y + 0.37, p.z + p.head * (BED_SIZE.l / 2 - 0.17));
      pillow.setMatrixAt(i, m);
    });
    [mattress, frame, pillow].forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
    invalidate();
  }, [layout, bedMeshRef, invalidate]);

  // Colours follow the live meal status, so admin changes show up immediately
  const statusKey = beds.map((b) => bedStatus(b)[0]).join("");
  React.useLayoutEffect(() => {
    const mattress = bedMeshRef.current;
    if (!mattress) return;
    const c = new THREE.Color();
    beds.forEach((bed, i) => {
      c.set(STATUS_COLORS[bedStatus(bed)]);
      if (bed.id === hoveredBed || bed.id === selectedBed) c.offsetHSL(0, 0.05, 0.1);
      mattress.setColorAt(i, c);
    });
    if (mattress.instanceColor) mattress.instanceColor.needsUpdate = true;
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusKey, hoveredBed, selectedBed, beds.length]);

  useCursor(hoveredBed !== null);

  const idFromEvent = (e: ThreeEvent<PointerEvent | MouseEvent>) => (e.instanceId !== undefined ? beds[e.instanceId]?.id ?? null : null);
  const count = beds.length;

  return (
    <group>
      <instancedMesh ref={frameRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[BED_SIZE.w + 0.06, 0.18, BED_SIZE.l + 0.06]} />
        <meshLambertMaterial color="#5b4636" />
      </instancedMesh>
      <instancedMesh
        ref={bedMeshRef}
        args={[undefined, undefined, count]}
        frustumCulled={false}
        onPointerMove={(e) => {
          e.stopPropagation();
          onHover(idFromEvent(e));
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          const id = idFromEvent(e);
          if (id) onSelect(id);
        }}
      >
        <boxGeometry args={[BED_SIZE.w, 0.16, BED_SIZE.l]} />
        <meshLambertMaterial color="#ffffff" />
      </instancedMesh>
      <instancedMesh ref={pillowRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[BED_SIZE.w - 0.2, 0.07, 0.24]} />
        <meshLambertMaterial color="#f8fafc" />
      </instancedMesh>
    </group>
  );
}

interface RoomLayerProps {
  rooms: Room[];
  hoveredRoom: number | null;
  selectedRoom: number | null;
  bedMeshRef: React.MutableRefObject<THREE.InstancedMesh | null>;
  onHover: (roomNumber: number | null) => void;
  onSelect: (roomNumber: number) => void;
}

function RoomLayer({ rooms, hoveredRoom, selectedRoom, bedMeshRef, onHover, onSelect }: RoomLayerProps) {
  const volume = React.useMemo(() => new THREE.BoxGeometry(2.1, RH, RD + BD), []);
  const edges = React.useMemo(() => new THREE.EdgesGeometry(volume), [volume]);
  React.useEffect(
    () => () => {
      volume.dispose();
      edges.dispose();
    },
    [volume, edges],
  );

  useCursor(hoveredRoom !== null);

  const blockedByBed = (e: ThreeEvent<PointerEvent | MouseEvent>) =>
    e.intersections.some((i) => i.object === bedMeshRef.current);

  return (
    <group>
      {rooms.map((room) => {
        const o = roomOrigin(room);
        const isSel = selectedRoom === room.number;
        const isHover = hoveredRoom === room.number;
        const pos: [number, number, number] = [o.x, o.y + RH / 2, BD / 2];
        return (
          <group key={room.number} position={pos}>
            <mesh
              geometry={volume}
              onPointerMove={(e) => {
                if (blockedByBed(e)) return;
                e.stopPropagation();
                onHover(room.number);
              }}
              onPointerOut={() => onHover(null)}
              onClick={(e) => {
                if (blockedByBed(e)) return;
                e.stopPropagation();
                onSelect(room.number);
              }}
            >
              <meshBasicMaterial transparent opacity={isSel ? 0.1 : isHover ? 0.06 : 0} color="#14b8a6" depthWrite={false} />
            </mesh>
            {(isSel || isHover) && (
              <lineSegments geometry={edges}>
                <lineBasicMaterial color={isSel ? "#0d9488" : "#ffffff"} />
              </lineSegments>
            )}
          </group>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Selected-bed outline                                                 */
/* ------------------------------------------------------------------ */

function BedOutline({ bed, room }: { bed: Bed | undefined; room: Room | undefined }) {
  const geo = React.useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(BED_SIZE.w + 0.16, 0.5, BED_SIZE.l + 0.16)), []);
  React.useEffect(() => () => geo.dispose(), [geo]);
  if (!bed || !room) return null;
  const o = roomOrigin(room);
  const slot = bedLocal(bed);
  return (
    <lineSegments geometry={geo} position={[o.x + slot.x, o.y + 0.25, slot.z]}>
      <lineBasicMaterial color="#facc15" />
    </lineSegments>
  );
}

/* ------------------------------------------------------------------ */
/* DOM overlays inside the scene                                        */
/* ------------------------------------------------------------------ */

function RoomLabels({ rooms, formatRoom, selectedRoom }: { rooms: Room[]; formatRoom: (n: number) => string; selectedRoom: number | null }) {
  return (
    <group>
      {rooms.map((room) => {
        const o = roomOrigin(room);
        return (
          <Text
            key={room.number}
            position={[o.x, o.y + RH - 0.02, RD / 2 + BD + 0.05]}
            fontSize={0.42}
            anchorX="center"
            anchorY="middle"
            color={selectedRoom === room.number ? "#0f172a" : "#ffffff"}
            outlineWidth={0.04}
            outlineColor={selectedRoom === room.number ? "#fde047" : "#0f172a"}
          >
            {formatRoom(room.number)}
          </Text>
        );
      })}
    </group>
  );
}

function SceneLabels({ labels }: { labels: HostelSceneProps["labels"] }) {
  const edgeZ = RD / 2 + BD + 1.2;
  return (
    <group>
      <Text position={[-BUILD_W / 2 - 0.4, 0.3, edgeZ]} fontSize={0.32} anchorX="right" anchorY="middle" color="#22c55e">
        ← {labels.west}
      </Text>
      <Text position={[BUILD_W / 2 + 0.4, 0.3, edgeZ]} fontSize={0.32} anchorX="left" anchorY="middle" color="#22c55e">
        {labels.east} →
      </Text>
      {labels.floors.map((name, i) => (
        <Text key={name} position={[-BUILD_W / 2 - 3.6, floorY(i + 1) + RH / 2, 1]} fontSize={0.34} anchorX="right" anchorY="middle" color="#f8fafc">
          {name}
        </Text>
      ))}
    </group>
  );
}

function Tooltip({ text, position }: { text: string | null; position: [number, number, number] | null }) {
  if (!text || !position) return null;
  return (
    <Text position={[position[0], position[1] + 0.8, position[2]]} fontSize={0.28} anchorX="center" anchorY="middle" color="#f8fafc" outlineWidth={0.025} outlineColor="#0f172a">
      {text}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/* Camera rig                                                           */
/* ------------------------------------------------------------------ */

function CameraRig({
  apiRef,
  selectedRoomPos,
  onLowPerformance,
}: {
  apiRef: React.MutableRefObject<SceneApi | null>;
  selectedRoomPos: THREE.Vector3 | null;
  onLowPerformance: () => void;
}) {
  const controls = React.useRef<React.ElementRef<typeof OrbitControls>>(null);
  const { camera, size, invalidate } = useThree();
  const goal = React.useRef<{ target: THREE.Vector3; dist: number } | null>(null);
  const perf = React.useRef({ frames: 0, time: 0, reported: false });

  const fitDistance = React.useCallback(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(VFOV / 2));
    const byWidth = (BUILD_W / 2 + 2.2) / (tanHalf * aspect);
    const byHeight = (BUILDING_TOP / 2 + 2.2) / tanHalf;
    return Math.max(byWidth, byHeight) * 1.08;
  }, [size.width, size.height]);

  const setGoal = React.useCallback(
    (target: THREE.Vector3, dist: number) => {
      goal.current = { target: target.clone(), dist };
      invalidate();
    },
    [invalidate],
  );

  const resetView = React.useCallback(() => setGoal(TARGET, fitDistance()), [setGoal, fitDistance]);

  // Initial / responsive framing
  React.useLayoutEffect(() => {
    const dist = fitDistance();
    camera.position.copy(TARGET).addScaledVector(VIEW_DIR, dist);
    controls.current?.target.copy(TARGET);
    controls.current?.update();
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.round(size.width / 80), Math.round(size.height / 80)]);

  React.useEffect(() => {
    apiRef.current = {
      zoom: (factor) => {
        const c = controls.current;
        if (!c) return;
        const dist = camera.position.distanceTo(c.target);
        setGoal(c.target, THREE.MathUtils.clamp(dist * factor, 7, 90));
      },
      reset: resetView,
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, camera, resetView, setGoal]);

  // Focus on the selected room
  React.useEffect(() => {
    if (selectedRoomPos) setGoal(selectedRoomPos, Math.min(camera.position.distanceTo(controls.current?.target ?? TARGET), 15));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoomPos]);

  useFrame((_, delta) => {
    const c = controls.current;
    if (!c) return;

    // frame-rate watchdog: only counts frames rendered while moving
    if (delta < 0.5) {
      const p = perf.current;
      p.frames += 1;
      p.time += delta;
      if (p.frames >= 90) {
        const fps = p.frames / p.time;
        if (fps < 18 && !p.reported) {
          p.reported = true;
          onLowPerformance();
        }
        p.frames = 0;
        p.time = 0;
      }
    }

    const g = goal.current;
    if (!g) return;
    const k = 1 - Math.exp(-delta * 6);
    const offset = camera.position.clone().sub(c.target);
    const curDist = offset.length();
    const dir = offset.normalize();
    const nextTarget = c.target.clone().lerp(g.target, k);
    const nextDist = THREE.MathUtils.lerp(curDist, g.dist, k);
    camera.position.copy(nextTarget).addScaledVector(dir, nextDist);
    c.target.copy(nextTarget);
    c.update();
    if (nextTarget.distanceTo(g.target) < 0.01 && Math.abs(nextDist - g.dist) < 0.02) goal.current = null;
    invalidate();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.09}
      minDistance={7}
      maxDistance={90}
      minPolarAngle={0.5}
      maxPolarAngle={1.45}
      minAzimuthAngle={-1.05}
      maxAzimuthAngle={1.05}
      enablePan
      screenSpacePanning
      onChange={() => {
        const c = controls.current;
        if (!c) return;
        c.target.x = THREE.MathUtils.clamp(c.target.x, -14, 14);
        c.target.y = THREE.MathUtils.clamp(c.target.y, 0.5, 8);
        c.target.z = THREE.MathUtils.clamp(c.target.z, -3, 5);
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Scene root                                                           */
/* ------------------------------------------------------------------ */

function SceneContents(props: HostelSceneProps) {
  const { rooms, selection, onSelectRoom, onSelectBed, quality, isDark, labels, formatRoom, roomTip, bedTip, apiRef, onReady, onLowPerformance } = props;
  const shadows = quality === "high";
  const bedMeshRef = React.useRef<THREE.InstancedMesh | null>(null);
  const [hoveredRoom, setHoveredRoom] = React.useState<number | null>(null);
  const [hoveredBed, setHoveredBed] = React.useState<string | null>(null);
  const invalidate = useThree((s) => s.invalidate);

  const beds = React.useMemo(() => rooms.flatMap((r) => r.beds), [rooms]);
  const roomByNumber = React.useMemo(() => new Map(rooms.map((r) => [r.number, r])), [rooms]);

  React.useEffect(() => {
    onReady();
  }, [onReady]);

  React.useEffect(() => {
    invalidate();
  }, [hoveredRoom, hoveredBed, selection, isDark, quality, invalidate]);

  const selectedRoomObj = selection.roomNumber ? roomByNumber.get(selection.roomNumber) : undefined;
  const selectedBedObj = selection.bedId ? beds.find((b) => b.id === selection.bedId) : undefined;
  const selectedRoomPos = React.useMemo(() => {
    if (!selectedRoomObj) return null;
    const o = roomOrigin(selectedRoomObj);
    return new THREE.Vector3(o.x, o.y + RH / 2, 0.8);
  }, [selectedRoomObj]);

  // Tooltip content and anchor
  let tipText: string | null = null;
  let tipPos: [number, number, number] | null = null;
  if (hoveredBed) {
    const bed = beds.find((b) => b.id === hoveredBed);
    const room = bed ? roomByNumber.get(bed.roomNumber) : undefined;
    if (bed && room) {
      const o = roomOrigin(room);
      const slot = bedLocal(bed);
      tipText = bedTip(bed.id);
      tipPos = [o.x + slot.x, o.y + 0.7, slot.z];
    }
  } else if (hoveredRoom) {
    const room = roomByNumber.get(hoveredRoom);
    if (room) {
      const o = roomOrigin(room);
      tipText = roomTip(room.number);
      tipPos = [o.x, o.y + RH, RD / 2 + BD];
    }
  }

  return (
    <>
      <ambientLight intensity={isDark ? 0.55 : 0.75} />
      <hemisphereLight args={[isDark ? "#7fa4c8" : "#cfe8ff", isDark ? "#1b2b1d" : "#8fbf7a", isDark ? 0.5 : 0.7]} />
      <directionalLight
        position={[12, 22, 16]}
        intensity={isDark ? 1.0 : 1.5}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={18}
        shadow-camera-bottom={-10}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-bias={-0.0004}
      />

      <Building shadows={shadows} />
      <Surroundings isDark={isDark} shadows={shadows} />
      <BedsLayer
        beds={beds}
        rooms={rooms}
        hoveredBed={hoveredBed}
        selectedBed={selection.bedId}
        bedMeshRef={bedMeshRef}
        onHover={setHoveredBed}
        onSelect={onSelectBed}
      />
      <RoomLayer
        rooms={rooms}
        hoveredRoom={hoveredRoom}
        selectedRoom={selection.roomNumber}
        bedMeshRef={bedMeshRef}
        onHover={setHoveredRoom}
        onSelect={onSelectRoom}
      />
      <BedOutline bed={selectedBedObj} room={selectedBedObj ? roomByNumber.get(selectedBedObj.roomNumber) : undefined} />
      <RoomLabels rooms={rooms} formatRoom={formatRoom} selectedRoom={selection.roomNumber} />
      <SceneLabels labels={labels} />
      <Tooltip text={tipText} position={tipPos} />
      <CameraRig apiRef={apiRef} selectedRoomPos={selectedRoomPos} onLowPerformance={onLowPerformance} />
    </>
  );
}

export default function HostelScene(props: HostelSceneProps) {
  const shadows = props.quality === "high";
  return (
    <Canvas
      frameloop="demand"
      shadows={shadows}
      dpr={shadows ? [1, 1.75] : 1}
      camera={{ fov: VFOV, near: 0.5, far: 400, position: [12, 14, 26] }}
      gl={{ antialias: shadows, alpha: true, powerPreference: "high-performance" }}
      aria-label={props.labels.scene}
      role="img"
      style={{ touchAction: "pan-y" }}
    >
      <SceneContents {...props} />
    </Canvas>
  );
}

export { ROOMS_PER_FLOOR, PLINTH };
