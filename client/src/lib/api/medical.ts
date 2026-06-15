// Medical-page data access. API-call-ready: when VITE_API_BASE_URL is set,
// every helper hits the real backend. Until then we return localized seed
// data so the UI renders identically without a server.

import { apiFetch, API_ENABLED } from "./client";
import { endpoints } from "./endpoints";

// ─── Quizzes ───────────────────────────────────────────────────────────
export type QuizAnswer = "yes" | "no" | "idk";
export type QuizQuestion = {
  id: string;
  topic: string;
  q: { en: string; bn: string };
};
export type QuizSet = {
  id: "mom" | "baby";
  title: { en: string; bn: string };
  questions: QuizQuestion[];
};

const SEED_QUIZZES: Record<"mom" | "baby", QuizSet> = {
  mom: {
    id: "mom",
    title: { en: "About you", bn: "আপনার সম্পর্কে" },
    questions: [
      { id: "m_tt", topic: "TT vaccine", q: { en: "Have you taken your TT (tetanus) booster in the last 5 years?", bn: "গত ৫ বছরে কি TT (টিটেনাস) বুস্টার নিয়েছেন?" } },
      { id: "m_iron", topic: "Iron & folic acid", q: { en: "Are you taking iron + folic acid daily?", bn: "আপনি কি প্রতিদিন আয়রন + ফলিক অ্যাসিড নিচ্ছেন?" } },
      { id: "m_bp", topic: "Blood pressure", q: { en: "Have you checked your blood pressure this month?", bn: "এই মাসে কি আপনার রক্তচাপ মেপেছেন?" } },
      { id: "m_anc", topic: "Antenatal visit", q: { en: "Have you had an antenatal/postnatal visit recently?", bn: "সম্প্রতি কি কোনো প্রসবপূর্ব/পরবর্তী চেকআপ করেছেন?" } },
      { id: "m_mood", topic: "Mental health", q: { en: "Do you feel calm and supported most days?", bn: "বেশিরভাগ দিন কি শান্ত ও সহায়তা পান বলে মনে হয়?" } },
      { id: "m_sleep", topic: "Sleep", q: { en: "Are you getting at least 6 hours of sleep?", bn: "আপনি কি অন্তত ৬ ঘন্টা ঘুমান?" } },
    ],
  },
  baby: {
    id: "baby",
    title: { en: "About your baby", bn: "আপনার শিশু সম্পর্কে" },
    questions: [
      { id: "b_bcg", topic: "BCG vaccine", q: { en: "Has your baby received the BCG vaccine?", bn: "আপনার শিশু কি BCG টিকা পেয়েছে?" } },
      { id: "b_penta", topic: "Pentavalent", q: { en: "Is your baby up-to-date on pentavalent (6, 10, 14 weeks)?", bn: "পেন্টাভ্যালেন্ট (৬, ১০, ১৪ সপ্তাহ) টিকা কি হালনাগাদ?" } },
      { id: "b_measles", topic: "Measles", q: { en: "Has your baby received the 9-month measles vaccine?", bn: "৯ মাসের হাম টিকা কি দেওয়া হয়েছে?" } },
      { id: "b_vitA", topic: "Vitamin A", q: { en: "Has your baby had a vitamin A capsule in the last 6 months?", bn: "গত ৬ মাসে কি ভিটামিন A ক্যাপসুল দেওয়া হয়েছে?" } },
      { id: "b_growth", topic: "Growth tracking", q: { en: "Have you weighed your baby in the last month?", bn: "গত মাসে কি শিশুর ওজন মেপেছেন?" } },
      { id: "b_feeding", topic: "Feeding", q: { en: "Is your baby feeding well for their age?", bn: "শিশুর বয়স অনুযায়ী কি ঠিকমতো খাওয়াচ্ছে?" } },
    ],
  },
};

export async function fetchQuizzes(): Promise<Record<"mom" | "baby", QuizSet>> {
  if (API_ENABLED) {
    const data = await apiFetch<QuizSet[]>(endpoints.quizzes);
    const out: Record<string, QuizSet> = {};
    for (const s of data) out[s.id] = s;
    return out as Record<"mom" | "baby", QuizSet>;
  }
  return SEED_QUIZZES;
}

export async function submitQuizAnswer(payload: {
  set_id: "mom" | "baby";
  question_id: string;
  answer: QuizAnswer;
}): Promise<void> {
  if (API_ENABLED) {
    await apiFetch(endpoints.quizAnswer, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  // no-op in seed mode — answers persist client-side in localStorage
}

// ─── Analytics ─────────────────────────────────────────────────────────
export type MedicalAnalytics = {
  cohort_coverage_pct: number;       // share of mothers in your cohort up-to-date
  nearby_alerts: number;             // health alerts in your district this week
  weekly_checkins: number[];         // last 8 weeks of check-in counts
  vaccine_uptake_pct: number;        // EPI uptake in your upazila
  community_questions: number;       // questions asked by your cohort this week
};

const SEED_ANALYTICS: MedicalAnalytics = {
  cohort_coverage_pct: 72,
  nearby_alerts: 3,
  weekly_checkins: [4, 6, 5, 7, 8, 6, 9, 11],
  vaccine_uptake_pct: 86,
  community_questions: 142,
};

export async function fetchMedicalAnalytics(): Promise<MedicalAnalytics> {
  if (API_ENABLED) return apiFetch<MedicalAnalytics>(endpoints.medicalAnalytics);
  return SEED_ANALYTICS;
}
