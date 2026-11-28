"use client";

import * as React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { BedAssignSelect } from "./bed-assign-select";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { bedStatus } from "@/lib/hostel";

const BADGE = { ON: "success", OFF: "danger", UNASSIGNED: "secondary" } as const;

/** Four beds of one room: assign residents and switch meals. The room number itself is never editable. */
export function RoomManageDialog({ roomNumber, onClose }: { roomNumber: number | null; onClose: () => void }) {
  const { getRoom, setBedMeal } = useHostel();
  const { t, fmt } = useI18n();
  const room = roomNumber ? getRoom(roomNumber) : undefined;

  return (
    <Dialog open={!!room} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        {room && (
          <>
            <DialogHeader>
              <DialogTitle>
                {t("common.room")} {fmt.digits(room.number)}
              </DialogTitle>
              <DialogDescription>
                {t(`overview.floorsLabel.${room.floor}`)} · {t("admin.structureLocked")}
              </DialogDescription>
            </DialogHeader>
            <ul className="space-y-3">
              {room.beds.map((b) => {
                const s = bedStatus(b);
                return (
                  <li key={b.id} className="grid items-center gap-2 rounded-lg border p-3 sm:grid-cols-[5rem_1fr_auto_auto]">
                    <span className="font-semibold">{fmt.digits(b.id)}</span>
                    <BedAssignSelect bed={b} className="h-9" />
                    <Badge variant={BADGE[s]} className="justify-self-start">
                      {s === "ON" ? t("room.mealOn") : s === "OFF" ? t("room.mealOff") : t("room.unassigned")}
                    </Badge>
                    <Switch
                      checked={b.mealOn}
                      disabled={!b.residentId}
                      aria-label={`${t("meal.toggle")} ${b.id}`}
                      onCheckedChange={(on) => {
                        setBedMeal(b.id, on);
                        toast.success(on ? t("meal.turnedOn") : t("meal.turnedOff"));
                      }}
                    />
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
