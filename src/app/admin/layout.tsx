"use client";

import * as React from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { RequireRole } from "@/components/shared/require-role";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="ADMIN">
      <AdminShell>{children}</AdminShell>
    </RequireRole>
  );
}
