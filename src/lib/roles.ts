import type { Role } from "@/types";

/** Mirrors server/src/config/constants.ts — single source of truth for role codes. */
export const ROLES = ["OWNER", "ADMIN", "MANAGER", "ACCOUNTANT", "STAFF", "COOK", "RESIDENT", "GUARDIAN"] as const;

/** Roles with full administrative access (mirrors server/src/config/constants.ts). */
export const ADMIN_ROLES: readonly Role[] = ["OWNER", "ADMIN"];

export function isAdminRole(role?: Role | null): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}

/** Roles allowed to record daily bazar purchases. */
export function canManageMarket(role?: Role | null): boolean {
  return isAdminRole(role) || role === "MANAGER";
}
