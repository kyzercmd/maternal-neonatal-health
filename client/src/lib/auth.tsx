// Lightweight client-side mock auth/verification context.
// Replace the `services/auth.ts` functions with real API calls later.
import * as React from "react";

export type Tier = 1 | 2 | 3;

export type ChildInfo = {
  name?: string;
  dob?: string; // ISO date
  edd?: string; // expected delivery
  sex?: "girl" | "boy" | "other";
  birthWeightKg?: number;
  feeding?: "breast" | "formula" | "mixed" | "solids";
  allergies?: string;
};

export type MotherInfo = {
  name?: string;
  phone?: string;
  dob?: string;
  occupation?: string;
  education?: string;
  diet?: string;
  bloodGroup?: string;
};

export type MedicalInfo = {
  motherBlood?: string;
  babyBlood?: string;
  chronic?: string;
  medications?: string;
  allergies?: string;
  lastCheckup?: string;
  vaccinations?: string;
};

export type UserState = {
  tier: Tier;
  verified: boolean;
  phone?: string;
  district?: string;
  upazila?: string;
  language: "en" | "bn";
  avatar?: string;
  mother: MotherInfo;
  child: ChildInfo;
  medical: MedicalInfo;
};

const STORAGE_KEY = "momota.user.v1";

const defaultUser: UserState = {
  tier: 1,
  verified: false,
  language: "en",
  mother: {},
  child: {},
  medical: {},
};

function load(): UserState {
  if (typeof window === "undefined") return defaultUser;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultUser;
    return { ...defaultUser, ...JSON.parse(raw) };
  } catch {
    return defaultUser;
  }
}

type Ctx = {
  user: UserState;
  setUser: (u: Partial<UserState>) => void;
  update: <K extends keyof UserState>(key: K, value: UserState[K]) => void;
  reset: () => void;
};

const AuthContext = React.createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setState] = React.useState<UserState>(defaultUser);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {}
  }, [user, hydrated]);

  const setUser = React.useCallback(
    (u: Partial<UserState>) => setState((prev) => ({ ...prev, ...u })),
    []
  );
  const update = React.useCallback(
    <K extends keyof UserState>(key: K, value: UserState[K]) =>
      setState((prev) => ({ ...prev, [key]: value })),
    []
  );
  const reset = React.useCallback(() => setState(defaultUser), []);

  const value = React.useMemo(() => ({ user, setUser, update, reset }), [user, setUser, update, reset]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

// Convenience: derive child age cohort
export function getCohort(child: ChildInfo): "pregnancy" | "0-6m" | "6-12m" | "1-2y" | "2-5y" | "unknown" {
  if (child.edd && !child.dob) return "pregnancy";
  if (!child.dob) return "unknown";
  const dob = new Date(child.dob);
  const months = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  if (months < 6) return "0-6m";
  if (months < 12) return "6-12m";
  if (months < 24) return "1-2y";
  if (months < 60) return "2-5y";
  return "unknown";
}
