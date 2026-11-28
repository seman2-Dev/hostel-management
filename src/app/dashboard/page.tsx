"use client";

import * as React from "react";
import { RequireRole } from "@/components/shared/require-role";
import { ResidentDashboard } from "@/components/dashboard/resident-dashboard";

export default function DashboardPage() {
  return (
    <RequireRole role="RESIDENT">
      <ResidentDashboard />
    </RequireRole>
  );
}
