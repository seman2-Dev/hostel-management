"use client";

import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { useHostel } from "@/store/hostel-store";
import { useI18n } from "@/i18n";

/** Pending resident submissions, approved into the shared list by the manager. */
export function PurchaseRequestsPanel() {
  const { t, fmt } = useI18n();
  const { purchaseRequests, approvePurchaseRequest, rejectPurchaseRequest } = useHostel();
  const pending = purchaseRequests.filter((r) => r.status === "PENDING");

  if (pending.length === 0) return <EmptyState title={t("market.noRequests")} />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("market.requestItem")}</TableHead>
          <TableHead>{t("market.requestFrom")}</TableHead>
          <TableHead className="text-end">{t("common.quantity")}</TableHead>
          <TableHead className="text-end">{t("market.totalPrice")}</TableHead>
          <TableHead className="text-end">{t("common.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pending.map((r) => (
          <TableRow key={r.id}>
            <TableCell>
              <p className="font-medium">{r.itemName}</p>
              {r.note && <p className="text-xs text-muted-foreground">{r.note}</p>}
              <p className="text-xs text-muted-foreground">{fmt.date(r.date)}</p>
            </TableCell>
            <TableCell className="text-muted-foreground">{r.residentName}</TableCell>
            <TableCell className="text-end whitespace-nowrap">
              {fmt.number(r.quantity)} {t(`market.units.${r.unit}`)}
            </TableCell>
            <TableCell className="text-end font-semibold">{fmt.currency(r.quantity * r.unitPrice)}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button
                  size="sm"
                  onClick={() => {
                    approvePurchaseRequest(r.id);
                    toast.success(t("market.approved"));
                  }}
                >
                  <Check />
                  {t("market.approve")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    rejectPurchaseRequest(r.id);
                    toast.success(t("market.rejected"));
                  }}
                >
                  <X />
                  {t("market.reject")}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
