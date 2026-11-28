"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/shared/image-upload";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormField } from "@/components/shared/form-field";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";
import { ROLES } from "@/lib/roles";
import { calculateMealCost, countMeals, daysWithAnyMeal, mealHistoryFor, monthOf } from "@/lib/hostel";
import { todayISO } from "@/mocks/seed-utils";
import type { Resident } from "@/types";

const NO_BED = "__none";

const schema = z.object({
  name: z.string().trim().min(2, "validation.minLength").max(80, "validation.minLength"),
  nameBn: z.string().trim().min(2, "validation.minLength").max(80, "validation.minLength"),
  email: z.string().trim().min(1, "validation.required").email("validation.email"),
  phone: z.string().trim().regex(/^(\+?88)?01[3-9]\d{8}$/, "validation.phone"),
  studentId: z.string().trim().min(3, "validation.minLength").max(20, "validation.minLength"),
  dateOfBirth: z
    .string()
    .min(1, "validation.required")
    .refine((v) => {
      const date = new Date(v);
      return !Number.isNaN(date.getTime()) && date.getTime() <= Date.now();
    }, "validation.dob"),
  photo: z.string().min(1, "validation.photoRequired"),
  department: z.string().trim().min(2, "validation.minLength").max(60, "validation.minLength"),
  role: z.enum(ROLES),
  approvalStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  active: z.boolean(),
  bedId: z.string(),
});
type FormValues = z.infer<typeof schema>;

function ResidentForm({ resident, onDone }: { resident: Resident | null; onDone: () => void }) {
  const { allBeds, residents, saveResident } = useHostel();
  const { t, fmt } = useI18n();
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: resident
      ? { name: resident.name, nameBn: resident.nameBn, email: resident.email, phone: resident.phone, studentId: resident.studentId, dateOfBirth: resident.dateOfBirth, photo: resident.photo, department: resident.department, role: resident.role, approvalStatus: resident.approvalStatus, active: resident.active, bedId: resident.bedId ?? NO_BED }
      : { name: "", nameBn: "", email: "", phone: "", studentId: "", dateOfBirth: "", photo: "", department: "", role: "RESIDENT", approvalStatus: "APPROVED", active: true, bedId: NO_BED },
  });

  const bedOptions = allBeds.filter((b) => !b.residentId || b.id === resident?.bedId);

  const onSubmit = handleSubmit((v) => {
    if (residents.some((r) => r.id !== resident?.id && r.email.toLowerCase() === v.email.toLowerCase())) {
      setError("email", { message: "auth.emailTaken" });
      return;
    }
    const result = saveResident({
      id: resident?.id,
      name: v.name,
      nameBn: v.nameBn,
      email: v.email,
      phone: v.phone,
      studentId: v.studentId,
      dateOfBirth: v.dateOfBirth,
      photo: v.photo,
      department: v.department,
      role: v.role,
      approvalStatus: v.approvalStatus,
      active: v.active,
      bedId: v.bedId === NO_BED ? null : v.bedId,
    });
    if (!result.ok) {
      toast.error(t("admin.bedTaken"));
      return;
    }
    toast.success(t("common.success"));
    onDone();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <FormField label={`${t("auth.fullName")} (English)`} htmlFor="rs-name" error={errors.name?.message}>
        <Input id="rs-name" aria-invalid={!!errors.name} {...register("name")} />
      </FormField>
      <FormField label={`${t("auth.fullName")} (বাংলা)`} htmlFor="rs-name-bn" error={errors.nameBn?.message}>
        <Input id="rs-name-bn" lang="bn" aria-invalid={!!errors.nameBn} {...register("nameBn")} />
      </FormField>
      <FormField label={t("auth.email")} htmlFor="rs-email" error={errors.email?.message}>
        <Input id="rs-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
      </FormField>
      <FormField label={t("auth.phone")} htmlFor="rs-phone" error={errors.phone?.message}>
        <Input id="rs-phone" type="tel" inputMode="tel" placeholder="01XXXXXXXXX" aria-invalid={!!errors.phone} {...register("phone")} />
      </FormField>
      <FormField label={t("auth.studentId")} htmlFor="rs-sid" error={errors.studentId?.message}>
        <Input id="rs-sid" aria-invalid={!!errors.studentId} {...register("studentId")} />
      </FormField>
      <FormField label={t("auth.dateOfBirth")} htmlFor="rs-dob" error={errors.dateOfBirth?.message}>
        <Input id="rs-dob" type="date" max={todayISO()} aria-invalid={!!errors.dateOfBirth} {...register("dateOfBirth")} />
      </FormField>
      <FormField label={t("auth.department")} htmlFor="rs-dept" error={errors.department?.message}>
        <Input id="rs-dept" aria-invalid={!!errors.department} {...register("department")} />
      </FormField>
      <Controller
        control={control}
        name="photo"
        render={({ field }) => (
          <FormField label={t("auth.photo")} htmlFor="rs-photo" error={errors.photo?.message} className="sm:col-span-2">
            <ImageUpload
              id="rs-photo"
              value={field.value || null}
              onChange={(url) => field.onChange(url ?? "")}
              uploadLabel={t("auth.uploadPhoto")}
              removeLabel={t("auth.removePhoto")}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <FormField label={t("admin.role")} htmlFor="rs-role">
            <Select value={field.value} onValueChange={(v) => field.onChange(v as "ADMIN" | "MANAGER" | "RESIDENT")}>
              <SelectTrigger id="rs-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESIDENT">{t("admin.roleResident")}</SelectItem>
                <SelectItem value="MANAGER">{t("admin.roleManager")}</SelectItem>
                <SelectItem value="ADMIN">{t("admin.roleAdmin")}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="bedId"
        render={({ field }) => (
          <FormField label={t("admin.assignBed")} htmlFor="rs-bed">
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="rs-bed">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_BED}>{t("admin.noBed")}</SelectItem>
                {bedOptions.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {fmt.digits(b.id)} · {t(`overview.floorsLabel.${b.floor}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="active"
        render={({ field }) => (
          <label className="flex items-center justify-between gap-3 self-end rounded-lg border px-3 py-2.5 text-sm font-medium">
            {field.value ? t("common.active") : t("common.inactive")}
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </label>
        )}
      />
      <DialogFooter className="sm:col-span-2">
        <Button type="button" variant="outline" onClick={onDone}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">{t("common.save")}</Button>
      </DialogFooter>
    </form>
  );
}

export function ResidentFormDialog({ open, onOpenChange, resident }: { open: boolean; onOpenChange: (o: boolean) => void; resident: Resident | null }) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{resident ? t("admin.editResident") : t("admin.addResident")}</DialogTitle>
          <DialogDescription>{t("admin.residentsDesc")}</DialogDescription>
        </DialogHeader>
        <ResidentForm key={resident?.id ?? "new"} resident={resident} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function ResidentHistoryDialog({ resident, onClose }: { resident: Resident | null; onClose: () => void }) {
  const { t, pick, fmt } = useI18n();
  const { settings } = useHostel();
  const entries = React.useMemo(() => (resident ? mealHistoryFor(resident, 62) : []), [resident]);
  const month = entries.filter((e) => monthOf(e.date) === todayISO().slice(0, 7));
  const meals = countMeals(month);
  const cost = calculateMealCost(meals, daysWithAnyMeal(month), settings);

  return (
    <Dialog open={!!resident} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        {resident && (
          <>
            <DialogHeader>
              <DialogTitle>
                {t("admin.mealHistory")} · {pick(resident, "name")}
              </DialogTitle>
              <DialogDescription>
                {t("meal.monthlyCount")}: {fmt.number(meals)} · {t("meal.cost")}: {fmt.currency(cost)}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[50vh] overflow-auto rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.date")}</TableHead>
                    <TableHead className="text-center">{t("meal.breakfast")}</TableHead>
                    <TableHead className="text-center">{t("meal.lunch")}</TableHead>
                    <TableHead className="text-center">{t("meal.dinner")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.slice(0, 30).map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="whitespace-nowrap">{fmt.date(e.date, { weekday: "short", day: "numeric", month: "short" })}</TableCell>
                      {([e.breakfast, e.lunch, e.dinner] as const).map((on, i) => (
                        <TableCell key={i} className="text-center">
                          {on ? <Check className="mx-auto size-4 text-success" aria-label="✓" /> : <X className="mx-auto size-4 text-muted-foreground/60" aria-label="–" />}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
