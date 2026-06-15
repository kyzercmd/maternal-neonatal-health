import { apiFetch, API_ENABLED, setAuthToken } from "./client";
import { endpoints } from "./endpoints";
import { nidQueueStore, getRegistered, setRegisteredField, type PendingNid } from "@/lib/store";
import type { AnalyticsSnapshot, NidSubmission, AnalyticsFilters, Cohort } from "./types";

// Mock credentials for demo. Replace with real /admin/login server call.
const MOCK_ADMIN = { email: "admin@momota.app", password: "momota123" };
const ADMIN_FLAG = "momota.admin.v1";

export async function adminLogin(email: string, password: string): Promise<boolean> {
  if (API_ENABLED) {
    try {
      const { token } = await apiFetch<{ token: string }>(endpoints.adminLogin, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(token);
      localStorage.setItem(ADMIN_FLAG, "1");
      return true;
    } catch {
      return false;
    }
  }
  if (email.trim().toLowerCase() === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
    localStorage.setItem(ADMIN_FLAG, "1");
    return true;
  }
  return false;
}

export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_FLAG) === "1";
}

export function adminLogout() {
  localStorage.removeItem(ADMIN_FLAG);
  setAuthToken(null);
}

export async function listNidQueue(): Promise<PendingNid[]> {
  if (API_ENABLED) {
    const data = await apiFetch<NidSubmission[]>(endpoints.adminNidQueue);
    return data as unknown as PendingNid[];
  }
  return nidQueueStore.get();
}

export async function reviewNid(id: string, decision: "approved" | "rejected"): Promise<void> {
  if (API_ENABLED) {
    await apiFetch(endpoints.adminNidReview(id), {
      method: "POST",
      body: JSON.stringify({ decision }),
    });
    return;
  }
  const item = nidQueueStore.get().find((n) => n.id === id);
  if (!item) return;
  nidQueueStore.set((q) => q.map((n) => (n.id === id ? { ...n, status: decision } : n)));
  if (decision === "approved") {
    setRegisteredField(item.phone, { tier: 2 });
  }
}

// AI-derived health analytics (mock). When wired to backend, pass filters as query params.
export async function getAnalytics(
  filters: AnalyticsFilters = { cohort: "all", district: "all" },
): Promise<AnalyticsSnapshot> {
  if (API_ENABLED) {
    const qs = new URLSearchParams({ cohort: filters.cohort, district: filters.district });
    return apiFetch<AnalyticsSnapshot>(`${endpoints.adminAnalytics}?${qs}`);
  }
  return mockAnalytics(filters);
}

function mockAnalytics(filters: AnalyticsFilters): AnalyticsSnapshot {
  const users = Object.values(getRegistered());
  const baseMothers = Math.max(users.length, 1240);
  // Cohort-aware sample sizing.
  const cohortShare: Record<Cohort, number> = {
    pregnancy: 0.25,
    "0-6m": 0.3,
    "6-12m": 0.18,
    "1-2y": 0.15,
    "2-5y": 0.1,
    unknown: 0.02,
  };
  const cohortFactor = filters.cohort === "all" ? 1 : cohortShare[filters.cohort];
  const districtFactor = filters.district === "all" ? 1 : 0.18;
  const totalMothers = Math.round(baseMothers * cohortFactor * districtFactor);
  const totalBabies = Math.round(totalMothers * 0.82);

  // Shift risk profile slightly per cohort & district to feel data-driven.
  const isPreg = filters.cohort === "pregnancy";
  const isPost = filters.cohort === "0-6m";
  const ruralBoost =
    filters.district !== "all" && !["Dhaka", "Chattogram"].includes(filters.district);

  const maternal = {
    anemia_risk_pct: clamp(38 + (ruralBoost ? 8 : 0) + (isPreg ? 6 : 0)),
    hypertension_risk_pct: clamp(14 + (isPost ? 3 : 0)),
    gestational_diabetes_risk_pct: clamp(9 + (isPreg ? 4 : 0)),
    postpartum_depression_pct: clamp(19 + (isPost ? 9 : 0)),
    iron_folic_uptake_pct: clamp(72 - (ruralBoost ? 12 : 0)),
    tt_coverage_pct: clamp(88 - (ruralBoost ? 9 : 0)),
    antenatal_visits_avg: round1(3.4 - (ruralBoost ? 0.6 : 0) + (isPreg ? 0.3 : 0)),
    skilled_birth_attendance_pct: clamp(67 - (ruralBoost ? 14 : 0)),
  };

  const child = {
    exclusive_breastfeeding_pct: clamp(64 + (isPost ? 4 : 0)),
    immunization_coverage_pct: clamp(85 - (ruralBoost ? 10 : 0)),
    underweight_pct: clamp(22 + (ruralBoost ? 6 : 0)),
    stunting_pct: clamp(28 + (ruralBoost ? 5 : 0)),
    diarrhoea_incidence_per_1000: Math.round(120 + (ruralBoost ? 40 : 0)),
    pneumonia_incidence_per_1000: Math.round(48 + (ruralBoost ? 18 : 0)),
    low_birth_weight_pct: clamp(17 + (ruralBoost ? 3 : 0)),
    newborn_skin_to_skin_pct: clamp(54 - (ruralBoost ? 9 : 0)),
  };

  const ai_insights = [
    {
      id: "ai1",
      severity: maternal.anemia_risk_pct > 40 ? ("high" as const) : ("medium" as const),
      title: "Anemia risk rising in 3rd-trimester cohort",
      body: `~${maternal.anemia_risk_pct}% of pregnant mothers in this slice show two or more anemia signals (fatigue self-reports, low IFA adherence, diet gaps).`,
      recommendation:
        "Boost IFA distribution through upazila health complexes; co-deliver with iron-rich food guidance via SMS in Bangla.",
    },
    {
      id: "ai2",
      severity: maternal.postpartum_depression_pct > 22 ? ("high" as const) : ("medium" as const),
      title: "Postpartum mood signals concentrated in 0–6m cohort",
      body: `${maternal.postpartum_depression_pct}% of new mothers describe persistent low mood, sleeplessness or isolation in midwife conversations.`,
      recommendation:
        "Scale UNICEF maternal mental-health hotline coverage and train upazila family-welfare visitors on screening.",
    },
    {
      id: "ai3",
      severity: child.immunization_coverage_pct < 80 ? ("high" as const) : ("low" as const),
      title: "EPI coverage gap detected",
      body: `Routine EPI uptake at ${child.immunization_coverage_pct}% in this slice. Drop-off concentrated between pentavalent-2 and measles-1.`,
      recommendation:
        "Trigger an SMS reminder wave 2 weeks before each due date; partner with local imam/teacher leaders in low-coverage unions.",
    },
    {
      id: "ai4",
      severity: child.diarrhoea_incidence_per_1000 > 140 ? ("high" as const) : ("medium" as const),
      title: "Diarrhoea season uptick",
      body: `${child.diarrhoea_incidence_per_1000}/1000 children showing diarrhoea symptoms — concentrated in flood-affected unions.`,
      recommendation:
        "Pre-position ORS at community clinics; activate icddr,b rehydration corners and broadcast hygiene tips.",
    },
  ];

  const district_risk = [
    "Dhaka",
    "Chattogram",
    "Sylhet",
    "Rajshahi",
    "Khulna",
    "Barishal",
    "Rangpur",
    "Mymensingh",
  ]
    .map((d, i) => ({
      district: d,
      mothers: Math.round(
        (300 - i * 26) * (filters.cohort === "all" ? 1 : cohortShare[filters.cohort]),
      ),
      risk_index: 30 + ((i * 9) % 55) + (["Sylhet", "Rangpur", "Barishal"].includes(d) ? 10 : 0),
      top_issue: [
        "Anemia",
        "EPI drop-off",
        "PPD",
        "Stunting",
        "Diarrhoea",
        "Anemia",
        "Low birth weight",
        "Skilled birth gap",
      ][i],
    }))
    .sort((a, b) => b.risk_index - a.risk_index);

  return {
    generated_at: new Date().toISOString(),
    filters,
    total_mothers: totalMothers,
    total_babies: totalBabies,
    maternal,
    child,
    ai_insights,
    district_risk,
    cohort_breakdown: {
      pregnancy: Math.round(baseMothers * 0.25),
      "0-6m": Math.round(baseMothers * 0.3),
      "6-12m": Math.round(baseMothers * 0.18),
      "1-2y": Math.round(baseMothers * 0.15),
      "2-5y": Math.round(baseMothers * 0.1),
      unknown: Math.round(baseMothers * 0.02),
    },
    weekly_anc_visits: gen(12, 120, 30),
    weekly_vaccinations: gen(12, 240, 60),
  };
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}
function round1(n: number) {
  return Math.round(n * 10) / 10;
}
function gen(n: number, base: number, jitter: number) {
  return Array.from({ length: n }, (_, i) =>
    Math.round(base + Math.sin(i / 2) * jitter + (i * jitter) / n),
  );
}
