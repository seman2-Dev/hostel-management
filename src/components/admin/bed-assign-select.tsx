"use client";

import * as React from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import type { Bed } from "@/types";

const VACANT = "__vacant";

/**
 * Assign or release a resident for one bed.
 * An occupied bed can only be released first, which keeps every bed at one resident at a time.
 */
export function BedAssignSelect({ bed, className }: { bed: Bed; className?: string }) {
  const { residents, getResident, assignResident } = useHostel();
  const { t, pick } = useI18n();
  const occupant = getResident(bed.residentId);
  const options = occupant ? [occupant] : residents.filter((r) => !r.bedId);

  const onChange = (value: string) => {
    if (value === VACANT) {
      if (occupant) assignResident(occupant.id, null);
    } else {
      const result = assignResident(value, bed.id);
      if (!result.ok) {
        toast.error(t("admin.bedTaken"));
        return;
      }
    }
    toast.success(t("common.success"));
  };

  return (
    <Select value={occupant?.id ?? VACANT} onValueChange={onChange}>
      <SelectTrigger className={className} aria-label={`${t("admin.assignBed")} ${bed.id}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={VACANT}>{occupant ? t("admin.unassign") : t("room.unassigned")}</SelectItem>
        {options.map((r) => (
          <SelectItem key={r.id} value={r.id}>
            {pick(r, "name")} · {r.studentId}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
