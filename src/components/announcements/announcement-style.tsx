import * as React from "react";
import { BellRing, Info, PartyPopper, Siren } from "lucide-react";
import type { AnnouncementStyle } from "@/types";
import type { TranslationKey } from "@/i18n";

export const STYLE_META: Record<
  AnnouncementStyle,
  { icon: React.ReactNode; chip: string; bar: string; labelKey: TranslationKey; badge: "default" | "warning" | "danger" | "success" }
> = {
  GENERAL: {
    icon: <Info className="size-4" />,
    chip: "bg-secondary text-secondary-foreground",
    bar: "border-s-slate-400",
    labelKey: "announcements.general",
    badge: "default",
  },
  IMPORTANT: {
    icon: <BellRing className="size-4" />,
    chip: "bg-warning/20 text-warning",
    bar: "border-s-warning",
    labelKey: "announcements.important",
    badge: "warning",
  },
  EMERGENCY: {
    icon: <Siren className="size-4" />,
    chip: "bg-danger/15 text-danger",
    bar: "border-s-danger",
    labelKey: "announcements.emergency",
    badge: "danger",
  },
  EVENT: {
    icon: <PartyPopper className="size-4" />,
    chip: "bg-success/15 text-success",
    bar: "border-s-success",
    labelKey: "announcements.event",
    badge: "success",
  },
};
