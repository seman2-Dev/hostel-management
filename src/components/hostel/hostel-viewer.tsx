"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Box, LayoutGrid, Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { bedStatus, roomMealsOn, roomOccupied } from "@/lib/hostel";
import { FloorPlan2D } from "./floor-plan-2d";
import { RoomPanel } from "./room-panel";
import type { SceneApi, SceneSelection } from "./hostel-scene";

const HostelScene = dynamic(() => import("./hostel-scene"), { ssr: false });

type Mode = "3d" | "2d";
const MODE_KEY = "hostel.viewMode";

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function isLowEndDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const reduce = window.matchMedia("(prefers-reduced-data: reduce)").matches;
  return reduce || (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) || (navigator.hardwareConcurrency ?? 8) <= 2;
}

function Legend() {
  const { t } = useI18n();
  const items = [
    { color: "bg-green-500", label: t("hero.legendOn") },
    { color: "bg-red-500", label: t("hero.legendOff") },
    { color: "bg-slate-400", label: t("hero.legendUnassigned") },
  ];
  return (
    <ul aria-label={t("hero.legend")} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-full border bg-card/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className={cn("size-3 rounded-sm", i.color)} aria-hidden="true" />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

export function HostelViewer({ className, tall = false }: { className?: string; tall?: boolean }) {
  const { rooms } = useHostel();
  const { t, fmt } = useI18n();
  const { resolvedTheme } = useTheme();

  const [mode, setMode] = React.useState<Mode>("3d");
  const [quality, setQuality] = React.useState<"high" | "low">("high");
  const [ready, setReady] = React.useState(false);
  const [webglFailed, setWebglFailed] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [selection, setSelection] = React.useState<SceneSelection>({ roomNumber: null, bedId: null });
  const apiRef = React.useRef<SceneApi | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    let stored: Mode | null = null;
    try {
      const v = window.localStorage.getItem(MODE_KEY);
      stored = v === "2d" || v === "3d" ? v : null;
    } catch {
      /* ignore */
    }
    if (!detectWebGL()) {
      setWebglFailed(true);
      setMode("2d");
      return;
    }
    if (stored) setMode(stored);
    else if (isLowEndDevice()) setMode("2d");
    if (isLowEndDevice()) setQuality("low");
  }, []);

  const changeMode = (next: Mode) => {
    setMode(next);
    setNotice(null);
    try {
      window.localStorage.setItem(MODE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const onReady = React.useCallback(() => setReady(true), []);
  const onLowPerformance = React.useCallback(() => {
    setQuality((q) => (q === "high" ? "low" : q));
  }, []);

  const selectRoom = React.useCallback((roomNumber: number) => {
    setSelection((s) => ({ roomNumber, bedId: s.roomNumber === roomNumber ? s.bedId : null }));
  }, []);

  const selectBed = React.useCallback(
    (bedId: string) => {
      const bed = rooms.flatMap((r) => r.beds).find((b) => b.id === bedId);
      if (bed) setSelection({ roomNumber: bed.roomNumber, bedId });
    },
    [rooms],
  );

  const roomByNumber = React.useMemo(() => new Map(rooms.map((r) => [r.number, r])), [rooms]);
  const bedById = React.useMemo(() => new Map(rooms.flatMap((r) => r.beds).map((b) => [b.id, b])), [rooms]);

  const roomTip = React.useCallback(
    (n: number) => {
      const r = roomByNumber.get(n);
      return r ? `${t("common.room")} ${fmt.digits(n)} · ${fmt.digits(roomMealsOn(r))}/${fmt.digits(roomOccupied(r))} ${t("overview.mealsOn")}` : "";
    },
    [roomByNumber, t, fmt],
  );

  const bedTip = React.useCallback(
    (id: string) => {
      const b = bedById.get(id);
      if (!b) return id;
      const s = bedStatus(b);
      const label = s === "ON" ? t("room.mealOn") : s === "OFF" ? t("room.mealOff") : t("room.unassigned");
      return `${fmt.digits(id)} · ${label}`;
    },
    [bedById, t, fmt],
  );

  const is3d = mode === "3d" && !webglFailed;
  const showLoader = is3d && !ready;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Legend />
        <div className="flex items-center gap-1.5">
          {is3d && (
            <>
              <Button variant="outline" size="icon" aria-label={t("hero.zoomIn")} title={t("hero.zoomIn")} onClick={() => apiRef.current?.zoom(0.78)}>
                <Plus />
              </Button>
              <Button variant="outline" size="icon" aria-label={t("hero.zoomOut")} title={t("hero.zoomOut")} onClick={() => apiRef.current?.zoom(1.28)}>
                <Minus />
              </Button>
              <Button variant="outline" size="icon" aria-label={t("hero.resetCamera")} title={t("hero.resetCamera")} onClick={() => apiRef.current?.reset()}>
                <RotateCcw />
              </Button>
            </>
          )}
          {!webglFailed && (
            <Button variant="outline" size="sm" onClick={() => changeMode(is3d ? "2d" : "3d")}>
              {is3d ? <LayoutGrid /> : <Box />}
              {is3d ? t("hero.switchTo2d") : t("hero.switchTo3d")}
            </Button>
          )}
        </div>
      </div>

      {(webglFailed || notice) && (
        <p role="status" className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm">
          {webglFailed ? t("hero.webglError") : notice}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border bg-gradient-to-b from-sky-200 to-sky-50 dark:from-slate-900 dark:to-slate-800",
            is3d ? (tall ? "h-[60vh] min-h-[24rem] sm:h-[68vh]" : "h-[44vh] min-h-[20rem] sm:h-[60vh]") : "bg-card from-transparent to-transparent p-3 dark:from-transparent dark:to-transparent sm:p-4",
          )}
        >
          {is3d ? (
            <>
              {mounted && (
                <HostelScene
                  rooms={rooms}
                  selection={selection}
                  onSelectRoom={selectRoom}
                  onSelectBed={selectBed}
                  quality={quality}
                  isDark={resolvedTheme === "dark"}
                  labels={{
                    west: t("hero.west"),
                    east: t("hero.east"),
                    floors: [t("overview.floorsLabel.1"), t("overview.floorsLabel.2"), t("overview.floorsLabel.3")],
                    scene: t("hero.sceneLabel"),
                  }}
                  formatRoom={(n) => fmt.digits(n)}
                  roomTip={roomTip}
                  bedTip={bedTip}
                  apiRef={apiRef}
                  onReady={onReady}
                  onLowPerformance={onLowPerformance}
                />
              )}
              {showLoader && (
                <div role="status" aria-live="polite" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm">
                  <div className="flex items-end gap-1.5" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-3 animate-pulse rounded-t bg-primary" style={{ height: 16 + i * 12, animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                  <p className="text-sm font-medium">{t("hero.loading3d")}</p>
                </div>
              )}
              <p className="pointer-events-none absolute inset-x-0 bottom-2 hidden px-3 text-center text-xs text-foreground/70 sm:block">{t("hero.dragHint")}</p>
            </>
          ) : (
            <>
              {!webglFailed && <p className="mb-3 text-xs text-muted-foreground">{t("hero.fallbackNote")}</p>}
              <FloorPlan2D rooms={rooms} selectedRoom={selection.roomNumber} selectedBed={selection.bedId} onSelectRoom={selectRoom} onSelectBed={selectBed} />
            </>
          )}
        </div>

        <div className="lg:min-h-[10rem]">
          {selection.roomNumber ? (
            <RoomPanel
              roomNumber={selection.roomNumber}
              bedId={selection.bedId}
              onSelectBed={selectBed}
              onClose={() => setSelection({ roomNumber: null, bedId: null })}
            />
          ) : (
            <div className="flex h-full min-h-[10rem] flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              <Box className="size-6" />
              {t("hero.dragHint")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
