// Wire-format types shared between the React frontend and the (future) Go backend.
// These mirror the database schema 1:1. When the Go server is ready, you can paste
// these structs directly into Go and they'll map cleanly to JSON.

export type UUID = string;
export type ISODate = string; // YYYY-MM-DD or full RFC3339

export type Tier = 1 | 2 | 3; // internal-only verification gate
export type Language = "en" | "bn";
export type Cohort = "pregnancy" | "0-6m" | "6-12m" | "1-2y" | "2-5y" | "unknown";
export type Feeding = "breast" | "formula" | "mixed" | "solids";
export type Sex = "girl" | "boy" | "other";
export type Condition = "new" | "like-new" | "good" | "used";
export type ListingStatus = "active" | "sold" | "removed";
export type NidStatus = "pending" | "approved" | "rejected";
export type AlertLevel = "info" | "warning" | "success";

// ─── core ──────────────────────────────────────────────────────────────
export interface User {
  id: UUID;
  phone: string;
  name: string;
  avatar_url?: string;
  district?: string;
  upazila?: string;
  language: Language;
  tier: Tier;
  verified: boolean;
  banned?: boolean;
  created_at: ISODate;
}

export interface MotherProfile {
  user_id: UUID;
  dob?: ISODate;
  occupation?: string;
  education?: string;
  diet?: string;
  blood_group?: string;
}

export interface Child {
  id: UUID;
  user_id: UUID;
  name?: string;
  dob?: ISODate;
  edd?: ISODate;
  sex?: Sex;
  birth_weight_kg?: number;
  feeding?: Feeding;
  allergies?: string;
}

export interface MedicalRecord {
  user_id: UUID;
  mother_blood?: string;
  baby_blood?: string;
  chronic?: string;
  medications?: string;
  allergies?: string;
  last_checkup?: ISODate;
  vaccinations?: string;
}

// ─── community ─────────────────────────────────────────────────────────
export interface Post {
  id: UUID;
  author_id: UUID;
  cohort: Cohort;
  body: string;
  media: string[];
  likes: number;
  comments_count: number;
  reports: number;
  hidden: boolean;
  created_at: ISODate;
}

export interface Comment {
  id: UUID;
  post_id: UUID;
  author_id: UUID;
  body: string;
  likes: number;
  created_at: ISODate;
}

export interface Report {
  id: UUID;
  post_id: UUID;
  reporter_id: UUID;
  reason: string;
  created_at: ISODate;
}

// ─── marketplace ───────────────────────────────────────────────────────
export interface Listing {
  id: UUID;
  seller_id: UUID;
  title: string;
  description: string;
  price_bdt: number;
  condition: Condition;
  category: string;
  district: string;
  upazila: string;
  images: string[];
  status: ListingStatus;
  featured: boolean;
  created_at: ISODate;
}

// ─── midwife ───────────────────────────────────────────────────────────
export interface MidwifeMessage {
  id: UUID;
  user_id: UUID;
  role: "user" | "assistant";
  content: string;
  topic_tags: string[];
  created_at: ISODate;
}

// ─── verification ──────────────────────────────────────────────────────
export interface NidSubmission {
  id: UUID;
  user_id: UUID;
  phone: string;
  name: string;
  district?: string;
  upazila?: string;
  image_url: string;
  status: NidStatus;
  reviewed_by?: UUID;
  reviewed_at?: ISODate;
  submitted_at: ISODate;
}

// ─── medical content ───────────────────────────────────────────────────
export interface Alert {
  id: UUID;
  title: string;
  body: string;
  level: AlertLevel;
  source: string;
  published_at: ISODate;
}

// ─── maternal & child health analytics (AI-derived, aggregated) ──────
// Server returns these so government, NGOs and partners can plan
// interventions. Always anonymised. The /admin/analytics endpoint
// accepts ?cohort=&district= query params (or pass "all").
export interface AnalyticsFilters {
  cohort: Cohort | "all";
  district: string | "all";
}

export interface MaternalHealthMetrics {
  anemia_risk_pct: number;
  hypertension_risk_pct: number;
  gestational_diabetes_risk_pct: number;
  postpartum_depression_pct: number;
  iron_folic_uptake_pct: number;
  tt_coverage_pct: number;
  antenatal_visits_avg: number;
  skilled_birth_attendance_pct: number;
}

export interface ChildHealthMetrics {
  exclusive_breastfeeding_pct: number;
  immunization_coverage_pct: number;
  underweight_pct: number;
  stunting_pct: number;
  diarrhoea_incidence_per_1000: number;
  pneumonia_incidence_per_1000: number;
  low_birth_weight_pct: number;
  newborn_skin_to_skin_pct: number;
}

export interface AIInsight {
  id: string;
  severity: "low" | "medium" | "high";
  title: string;
  body: string;
  recommendation: string;
  cohort?: Cohort | "all";
  district?: string | "all";
}

export interface DistrictRisk {
  district: string;
  mothers: number;
  risk_index: number; // 0–100, higher = more attention needed
  top_issue: string;
}

export interface AnalyticsSnapshot {
  generated_at: ISODate;
  filters: AnalyticsFilters;
  total_mothers: number;
  total_babies: number;
  maternal: MaternalHealthMetrics;
  child: ChildHealthMetrics;
  ai_insights: AIInsight[];
  district_risk: DistrictRisk[];
  cohort_breakdown: Record<Cohort, number>;
  weekly_anc_visits: number[]; // 12 weeks
  weekly_vaccinations: number[]; // 12 weeks
}
