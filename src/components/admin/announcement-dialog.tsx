"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/shared/form-field";
import { STYLE_META } from "@/components/announcements/announcement-style";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { fromLocalInput, toLocalInput } from "@/lib/datetime";
import { uid } from "@/lib/utils";
import type { Announcement, AnnouncementStyle } from "@/types";

const STYLES: AnnouncementStyle[] = ["GENERAL", "IMPORTANT", "EMERGENCY", "EVENT"];

const schema = z
  .object({
    titleEn: z.string().trim().min(1, "validation.required").max(200, "validation.minLength"),
    titleBn: z.string().trim().min(1, "validation.required").max(200, "validation.minLength"),
    style: z.enum(["GENERAL", "IMPORTANT", "EMERGENCY", "EVENT"]),
    priority: z.string().regex(/^[1-5]$/, "validation.priority"),
    startsAt: z.string().min(1, "validation.required"),
    expiresAt: z.string(),
    scrolling: z.boolean(),
    active: z.boolean(),
  })
  .refine((v) => !v.expiresAt || !v.startsAt || new Date(v.expiresAt) > new Date(v.startsAt), {
    path: ["expiresAt"],
    message: "validation.dateOrder",
  });
type FormValues = z.infer<typeof schema>;

function AnnouncementForm({ announcement, onDone }: { announcement: Announcement | null; onDone: () => void }) {
  const { saveAnnouncement } = useHostel();
  const { t, fmt } = useI18n();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: announcement
      ? {
          titleEn: announcement.titleEn,
          titleBn: announcement.titleBn,
          style: announcement.style,
          priority: String(announcement.priority),
          startsAt: toLocalInput(announcement.startsAt),
          expiresAt: toLocalInput(announcement.expiresAt),
          scrolling: announcement.scrolling,
          active: announcement.active,
        }
      : { titleEn: "", titleBn: "", style: "GENERAL", priority: "3", startsAt: toLocalInput(new Date().toISOString()), expiresAt: "", scrolling: true, active: true },
  });

  const onSubmit = handleSubmit((v) => {
    saveAnnouncement({
      id: announcement?.id ?? uid("an"),
      titleEn: v.titleEn,
      titleBn: v.titleBn,
      style: v.style,
      priority: Number(v.priority),
      startsAt: fromLocalInput(v.startsAt) ?? new Date().toISOString(),
      expiresAt: fromLocalInput(v.expiresAt),
      scrolling: v.scrolling,
      active: v.active,
    });
    toast.success(t("admin.annSaved"));
    onDone();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <FormField label={t("announcements.titleEn")} htmlFor="an-en" error={errors.titleEn?.message}>
        <Textarea id="an-en" className="min-h-[64px]" aria-invalid={!!errors.titleEn} {...register("titleEn")} />
      </FormField>
      <FormField label={t("announcements.titleBn")} htmlFor="an-bn" error={errors.titleBn?.message}>
        <Textarea id="an-bn" lang="bn" className="min-h-[64px]" aria-invalid={!!errors.titleBn} {...register("titleBn")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="style"
          render={({ field }) => (
            <FormField label={t("announcements.style")} htmlFor="an-style">
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="an-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(STYLE_META[s].labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <FormField label={t("announcements.priority")} htmlFor="an-priority" error={errors.priority?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="an-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      {fmt.number(p)} / {fmt.number(5)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        />
        <FormField label={t("announcements.startsAt")} htmlFor="an-start" error={errors.startsAt?.message}>
          <Input id="an-start" type="datetime-local" aria-invalid={!!errors.startsAt} {...register("startsAt")} />
        </FormField>
        <FormField label={`${t("announcements.expiresAt")} (${t("common.optional")})`} htmlFor="an-exp" error={errors.expiresAt?.message}>
          <Input id="an-exp" type="datetime-local" aria-invalid={!!errors.expiresAt} {...register("expiresAt")} />
        </FormField>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Controller
          control={control}
          name="scrolling"
          render={({ field }) => (
            <label className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium">
              {t("announcements.scrolling")}
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </label>
          )}
        />
        <Controller
          control={control}
          name="active"
          render={({ field }) => (
            <label className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium">
              {t("announcements.enabledLabel")}
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </label>
          )}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">{t("common.save")}</Button>
      </DialogFooter>
    </form>
  );
}

export function AnnouncementDialog({
  open,
  onOpenChange,
  announcement,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
}) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{announcement ? t("admin.editAnnouncement") : t("admin.addAnnouncement")}</DialogTitle>
          <DialogDescription>{t("admin.announcementsDesc")}</DialogDescription>
        </DialogHeader>
        <AnnouncementForm key={announcement?.id ?? "new"} announcement={announcement} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
