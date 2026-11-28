"use client";

import * as React from "react";
import type { Role, User } from "@/types";
import { uid } from "@/lib/utils";
import { DEMO_ADMIN_EMAIL, DEMO_PASSWORD, DEMO_RESIDENT_EMAIL } from "@/mocks/residents";
import { useHostel } from "./hostel-store";

const SESSION_KEY = "hostel.session";

interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  studentId: string;
  dateOfBirth: string;
  photo: string;
  department: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => { ok: boolean; role?: Role; error?: "pendingApproval" };
  register: (input: RegisterInput) => { ok: boolean; error?: "emailTaken"; pending?: boolean };
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

const DEMO_ADMIN: User = {
  id: "user-admin",
  name: "Hostel Admin",
  email: DEMO_ADMIN_EMAIL,
  role: "ADMIN",
  active: true,
};

const DEMO_RESIDENT: User = {
  id: "user-res-001",
  name: "Resident",
  email: DEMO_RESIDENT_EMAIL,
  role: "RESIDENT",
  active: true,
  residentId: "res-001",
};

/**
 * Phase 1 mock authentication.
 * NOTE: role information here is for UI routing only. In Phase 2 the server decides roles
 * from a signed session and never trusts anything stored on the client.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { residents, saveResident } = useHostel();
  const [user, setUser] = React.useState<User | null>(null);
  const [ready, setReady] = React.useState(false);
  /** Passwords of accounts registered during this browser session (never persisted). */
  const credentials = React.useRef(new Map<string, string>());

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      /* ignore corrupt session */
    }
    setReady(true);
  }, []);

  const persist = React.useCallback((next: User | null) => {
    setUser(next);
    try {
      if (next) window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      else window.localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login: (email, password) => {
        const e = email.trim().toLowerCase();
        if (e === DEMO_ADMIN_EMAIL && password === DEMO_PASSWORD) {
          persist(DEMO_ADMIN);
          return { ok: true, role: "ADMIN" };
        }
        if (e === DEMO_RESIDENT_EMAIL && password === DEMO_PASSWORD) {
          const res = residents.find((r) => r.id === "res-001");
          const role = res?.role ?? "RESIDENT";
          persist({ ...DEMO_RESIDENT, name: res?.name ?? DEMO_RESIDENT.name, role });
          return { ok: true, role };
        }
        const match = residents.find((r) => r.email.toLowerCase() === e);
        const registeredPassword = credentials.current.get(e);
        const passwordOk = password === DEMO_PASSWORD || (registeredPassword !== undefined && password === registeredPassword);
        if (match && passwordOk && match.approvalStatus === "PENDING") return { ok: false, error: "pendingApproval" };
        if (match && passwordOk && match.approvalStatus === "REJECTED") return { ok: false };
        if (match && match.active && passwordOk) {
          const role = match.role;
          persist({ id: `user-${match.id}`, name: match.name, email: match.email, role, active: true, residentId: match.id });
          return { ok: true, role };
        }
        return { ok: false };
      },
      register: (input) => {
        const email = input.email.trim().toLowerCase();
        if (residents.some((r) => r.email.toLowerCase() === email) || email === DEMO_ADMIN_EMAIL) {
          return { ok: false, error: "emailTaken" };
        }
        const id = uid("res");
        const result = saveResident({
          id,
          name: input.name,
          nameBn: input.name,
          email,
          phone: input.phone,
          studentId: input.studentId,
          dateOfBirth: input.dateOfBirth,
          photo: input.photo,
          department: input.department,
          role: "RESIDENT",
          approvalStatus: "PENDING",
          active: false,
          bedId: null,
        });
        if (!result.ok) return { ok: false };
        credentials.current.set(email, input.password);
        // No session yet — an admin must approve the registration first.
        return { ok: true, pending: true };
      },
      logout: () => persist(null),
    }),
    [user, ready, residents, saveResident, persist],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
