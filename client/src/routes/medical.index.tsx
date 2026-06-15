import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { Reveal } from "@/components/common/Reveal";
import {
  Bell,
  AlertTriangle,
  Baby,
  Heart,
  Sparkles,
  Activity,
  ShieldCheck,
  MessageCircleHeart,
  HandHeart,
  ChevronRight,
  Cpu,
  Lock,
  TrendingUp,
  Users,
  MapPin,
} from "lucide-react";
import { useT } from "@/lib/i18n";
import { useAuth, getCohort, type UserState } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  fetchQuizzes,
  submitQuizAnswer,
  fetchMedicalAnalytics,
  type QuizSet,
  type QuizAnswer,
  type MedicalAnalytics,
} from "@/lib/api/medical";
import { IllustrationDoctor } from "@/components/common/Illustrations";

export const Route = createFileRoute("/medical/")({
  component: Medical,
});

// ─── Local storage for quiz answers (kept; backend mirror is best-effort) ──
const QUIZ_STORE_KEY = "momota.medical.quiz.v1";
type QuizStore = Record<string, QuizAnswer>;
function loadQuiz(): QuizStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(QUIZ_STORE_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveQuiz(s: QuizStore) {
  try {
    localStorage.setItem(QUIZ_STORE_KEY, JSON.stringify(s));
  } catch {}
}

// ─── News content (official + NGO, combined) ───────────────────────────
type NewsItem = {
  id: string;
  tag: string;
  kind: "official" | "ngo";
  title: string;
  body: string;
  source: string;
  date: string;
};
const combinedNews: NewsItem[] = [
  {
    id: "o1",
    kind: "official",
    tag: "DGHS",
    title: "বিনামূল্যে হাম-রুবেলা টিকাদান ক্যাম্পেইন বর্ধিত করা হয়েছে",
    body: "DGHS দেশব্যাপী এমআর ক্যাম্পেইন আরও ২ সপ্তাহ বাড়িয়েছে। আপনার টিকাদান কার্ডসহ যেকোনো ইপিআই কেন্দ্রে যোগাযোগ করুন।",
    source: "Directorate General of Health Services",
    date: "আজ",
  },
  {
    id: "n1",
    kind: "ngo",
    tag: "BRAC",
    title: "১৪টি জেলায় বিনামূল্যে প্রসব পরবর্তী হোম ভিজিট",
    body: "ব্র্যাকের মানসী প্রোগ্রাম প্রসবের ৪৮ ঘণ্টার মধ্যে বিনামূল্যে প্রসব পরবর্তী ভিজিট প্রদান করছে।",
    source: "BRAC Health",
    date: "গতকাল",
  },
  {
    id: "o2",
    kind: "official",
    tag: "MoHFW",
    title: "আয়রন-ফলিক অ্যাসিড বিতরণ সম্প্রসারিত",
    body: "সব উপজেলা স্বাস্থ্য কমপ্লেক্স এখন গর্ভবতী মহিলাদের বিনামূল্যে আইএফএ ট্যাবলেট প্রদান করে। আপনার এএনসি কার্ডটি সাথে আনুন।",
    source: "Ministry of Health & Family Welfare",
    date: "২ দিন আগে",
  },
  {
    id: "n2",
    kind: "ngo",
    tag: "icddr,b",
    title: "ডায়রিয়া রিহাইড্রেশন কর্নার পুনরায় চালু হয়েছে",
    body: "সব আইসিডিডিআর,বি পার্টনার ইউনিয়নে কমিউনিটি ওআরএস কর্নার চালু আছে — ৩০ মিনিটের মধ্যে জীবন রক্ষাকারী সেবা।",
    source: "icddr,b",
    date: "৩ দিন আগে",
  },
  {
    id: "o3",
    kind: "official",
    tag: "WHO BD",
    title: "শিশুর খাদ্যাভ্যাসের নতুন নির্দেশিকা",
    body: "প্রথম ৬ মাস শুধুমাত্র বুকের দুধ খাওয়ানো এবং ২ বছর পর্যন্ত পরিপূরক খাবার দেওয়ার সুপারিশ করা হয়েছে।",
    source: "WHO Bangladesh",
    date: "এই সপ্তাহ",
  },
  {
    id: "n3",
    kind: "ngo",
    tag: "UNICEF",
    title: "মাতৃ মানসিক স্বাস্থ্য হটলাইন চালু",
    body: "প্রশিক্ষিত কাউন্সিলর দ্বারা পরিচালিত গোপনীয় হেল্পলাইন, সকাল ৯টা থেকে রাত ৯টা পর্যন্ত বাংলা ও ইংরেজিতে।",
    source: "UNICEF Bangladesh",
    date: "গত সপ্তাহ",
  },
];

// ─── Personalized tips builders (direct, second-person) ────────────────
type Tip = { id: string; tag: string; title: string; body: string; urgent?: boolean };

function buildMotherTips(u: UserState, quiz: QuizStore): Tip[] {
  const tips: Tip[] = [];
  const m = u.mother,
    med = u.medical,
    c = u.child;
  const cohort = getCohort(c);
  const first = m.name?.split(" ")[0];

  if (quiz.m_tt === "no")
    tips.push({
      id: "q_tt",
      tag: "পদক্ষেপ",
      title: "এই সপ্তাহে আপনার টিটি বুস্টার নিশ্চিত করুন",
      body: "কার্ডসহ যেকোনো ইপিআই কেন্দ্রে যান — বুস্টারটি বিনামূল্যে দেওয়া হয় এবং মাত্র ৫ মিনিট সময় লাগে।",
      urgent: true,
    });
  if (quiz.m_iron === "no")
    tips.push({
      id: "q_iron",
      tag: "পদক্ষেপ",
      title: "আজই আয়রন + ফলিক অ্যাসিড শুরু করুন",
      body: "প্রতিটি উপজেলা স্বাস্থ্য কমপ্লেক্সে বিনামূল্যে পাওয়া যায়। ভালো শোষণের জন্য লেবু বা পেয়ারার মতো ভিটামিন-সি যুক্ত খাবারের সাথে এটি সেবন করুন।",
    });
  if (quiz.m_bp === "no")
    tips.push({
      id: "q_bp",
      tag: "পদক্ষেপ",
      title: "এই সপ্তাহে আপনার রক্তচাপ পরীক্ষা করুন",
      body: "নিকটস্থ ফার্মেসি বা ক্লিনিকে মাত্র ২ মিনিটে পরীক্ষা করুন। গর্ভাবস্থা এবং প্রসব পরবর্তী সময়ে এটি অত্যন্ত জরুরি।",
    });
  if (quiz.m_mood === "no")
    tips.push({
      id: "q_mood",
      tag: "মানসিক স্বাস্থ্য",
      title: "আজই কারো সাথে কথা বলুন",
      body: "আপনি যা অনুভব করছেন তা সত্যি। ইউনিসেফ মাতৃ হটলাইনে (সকাল ৯টা-রাত ৯টা) কল করুন বা আপনার মিডওয়াইফকে জিজ্ঞেস করুন।",
      urgent: true,
    });
  if (quiz.m_sleep === "no")
    tips.push({
      id: "q_sleep",
      tag: "সুস্থতা",
      title: "ঘুম হলো ওষুধ — বিশ্রাম নিন",
      body: "আজ ২ ঘণ্টার জন্য কাউকে শিশুকে রাখতে বলুন যাতে আপনি নিরবচ্ছিন্ন ঘুমাতে পারেন। আপনার সুস্থতা এর ওপর নির্ভর করে।",
    });

  if (cohort === "pregnancy") {
    tips.push({
      id: "m1",
      tag: "এই সপ্তাহ",
      title: `${first ? first + ", " : ""}প্রতিদিন শিশুর নড়াচড়া খেয়াল করুন`,
      body: "২৮তম সপ্তাহ থেকে ২ ঘণ্টায় ১০টি নড়াচড়া গণনা করুন। ১০টির কম হলে ওই দিনই ক্লিনিকে যান।",
    });
    tips.push({
      id: "m2",
      tag: "পুষ্টি",
      title: "খাবারের নিয়ম: অর্ধেক সবজি, এক চতুর্থাংশ প্রোটিন, এক চতুর্থাংশ ভাত",
      body: "প্রতিবেলার খাবারে ডিম বা ডাল যোগ করুন। খাবারের সাথে লেবুর শরবত আয়রন শোষণ দ্বিগুণ করে।",
    });
  } else if (cohort === "0-6m") {
    tips.push({
      id: "m3",
      tag: "প্রসব পরবর্তী",
      title: "প্রসব পরবর্তী বিপদের লক্ষণগুলো খেয়াল করুন",
      body: "অতিরিক্ত রক্তপাত, জ্বর, তীব্র মাথাব্যথা, চোখের ঝাপসা দেখা — দেরি না করে দ্রুত ক্লিনিকে যান।",
    });
  }

  if (m.bloodGroup?.includes("-"))
    tips.push({
      id: "m_rh",
      tag: "Rh-negative",
      title: "আপনার অ্যান্টি-ডি ইনজেকশন নিশ্চিত করুন",
      body: `আপনার রক্তের গ্রুপ ${m.bloodGroup}। ২৮তম সপ্তাহে এবং প্রসবের পর অ্যান্টি-ডি প্রয়োজন — আপনার পরবর্তী ভিজিটে জিজ্ঞেস করুন।`,
    });
  if (med.chronic?.trim())
    tips.push({
      id: "m_chr",
      tag: "দীর্ঘমেয়াদী যত্ন",
      title: `প্রতিবার পরিদর্শনের সময় ওষুধের তালিকা সাথে আনুন`,
      body: `নথিভুক্ত: "${med.chronic}"। পুরো তালিকা সাথে রাখুন, ডাক্তারের পরামর্শ ছাড়া ওষুধ বন্ধ করবেন না।`,
    });
  if (med.allergies?.trim())
    tips.push({
      id: "m_al",
      tag: "অ্যালার্জি",
      title: "আপনার কার্ডে অ্যালার্জি সতর্কতা দিন",
      body: `নোট: ${med.allergies}। এটি আপনার এএনসি কার্ডে লিখুন এবং স্বাস্থ্যকর্মীকে জানান।`,
    });
  if (!med.lastCheckup)
    tips.push({
      id: "m_chk",
      tag: "স্মারক",
      title: "আপনার শেষ চেকআপের তারিখ যোগ করুন",
      body: "প্রোফাইল → মেডিকেল-এ গিয়ে তারিখটি যোগ করুন। পরবর্তী চেকআপের সময় আমরা আপনাকে মনে করিয়ে দেব।",
    });

  return tips;
}

function buildBabyTips(u: UserState, quiz: QuizStore): Tip[] {
  const tips: Tip[] = [];
  const c = u.child;
  const cohort = getCohort(c);
  const bname = c.name?.split(" ")[0] || "আপনার শিশু";

  if (quiz.b_bcg === "no")
    tips.push({
      id: "qb_bcg",
      tag: "টিকা",
      title: `এই সপ্তাহে ${bname}কে বিসিজি টিকা দিন`,
      body: "বিসিজি হলো প্রথম টিকা — প্রতিটি ইপিআই কেন্দ্রে বিনামূল্যে পাওয়া যায়। শিশুর কার্ড সাথে আনুন।",
      urgent: true,
    });
  if (quiz.b_penta === "no")
    tips.push({
      id: "qb_penta",
      tag: "টিকা",
      title: "পেন্টাভ্যালেন্ট ডোজগুলো সময়মতো দিন",
      body: "পেন্টাভ্যালেন্ট টিকা ৬, ১০ এবং ১৪ সপ্তাহে দিতে হয়। কোনোটি বাদ পড়লে ইপিআই কেন্দ্র থেকে পুনরায় শুরু করুন।",
    });
  if (quiz.b_measles === "no" && cohort !== "pregnancy" && cohort !== "0-6m")
    tips.push({
      id: "qb_meas",
      tag: "টিকা",
      title: "৯ মাসের হামের টিকা দেওয়ার সময় হয়েছে",
      body: "নিকটস্থ ইপিআই কেন্দ্রে যোগাযোগ করুন — বিনামূল্যে, আগে থেকে অ্যাপয়েন্টমেন্টের প্রয়োজন নেই।",
    });
  if (quiz.b_vitA === "no")
    tips.push({
      id: "qb_vita",
      tag: "পুষ্টি",
      title: "ভিটামিন এ ক্যাপসুল রাউন্ড",
      body: "৬ মাস থেকে ৫ বছর বয়স পর্যন্ত প্রতি ৬ মাসে একটি ক্যাপসুল। পরবর্তী তারিখের জন্য স্বাস্থ্যকর্মীকে জিজ্ঞেস করুন।",
    });
  if (quiz.b_growth === "no")
    tips.push({
      id: "qb_g",
      tag: "ট্র্যাকিং",
      title: `এই সপ্তাহে ${bname}র ওজন মাপুন`,
      body: "যেকোনো ফার্মেসি বা ক্লিনিকে বিনামূল্যে এটি করা যায়। গ্রোথ কার্ডে এটি নথিভুক্ত করুন।",
    });

  if (cohort === "0-6m") {
    tips.push({
      id: "b1",
      tag: "খাওয়ানো",
      title: `${bname}: শুধুমাত্র বুকের দুধ, পানি নয়`,
      body: "৬ মাস পর্যন্ত: পানি, মধু বা ফর্মুলা দেবেন না যদি না ডাক্তার বিশেষ পরামর্শ দেন।",
    });
    tips.push({
      id: "b2",
      tag: "ঘুম",
      title: "প্রতিবার শিশুকে পিঠের ওপর ভর দিয়ে ঘুমাতে দিন",
      body: "সমতল জায়গায় শোয়ান। শিশুর মুখের কাছে বালিশ, খেলনা বা কম্বল রাখবেন না।",
    });
  } else if (cohort === "6-12m") {
    tips.push({
      id: "b3",
      tag: "শক্ত খাবার",
      title: "আয়রন সমৃদ্ধ শক্ত খাবার শুরু করুন",
      body: "ডাল দিয়ে চটকানো খিচুড়ি, ডিমের কুসুম, নরম ফল দিন। পাশাপাশি বুকের দুধ খাওয়ানো চালিয়ে যান।",
    });
  }

  if (c.birthWeightKg && c.birthWeightKg < 2.5)
    tips.push({
      id: "b_lbw",
      tag: "জন্মের সময় কম ওজন",
      title: "প্রতি ২ ঘণ্টা পরপর ক্যাঙ্গারু মাদার কেয়ার দিন",
      body: `জন্মের ওজন ${c.birthWeightKg} কেজি — ক্যাঙ্গারু মাদার কেয়ার শিশুকে উষ্ণ এবং সুস্থ রাখতে সাহায্য করে।`,
    });
  if (c.feeding === "formula" || c.feeding === "mixed")
    tips.push({
      id: "b_form",
      tag: "বোতলের নিরাপত্তা",
      title: "প্রতিবার খাওয়ানোর আগে বোতল ৫ মিনিট সেদ্ধ করুন",
      body: "ফুটিয়ে ঠান্ডা করা পানি ব্যবহার করুন। ১ ঘণ্টার বেশি বাইরে রাখা তৈরি ফর্মুলা শিশুকে দেবেন না।",
    });

  return tips;
}

// ─── Quiz dialog ───────────────────────────────────────────────────────
function QuizDialog({
  open,
  onOpenChange,
  set,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  set: QuizSet | null;
  onSaved: () => void;
}) {
  const t = useT();
  const { user } = useAuth();
  const lang = user.language;
  const [answers, setAnswers] = React.useState<QuizStore>(() => loadQuiz());
  const [idx, setIdx] = React.useState(0);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setAnswers(loadQuiz());
      setIdx(0);
      setDone(false);
    }
  }, [open, set?.id]);

  if (!set) return null;
  const q = set.questions[idx];
  const total = set.questions.length;

  const answer = (a: QuizAnswer) => {
    const next = { ...answers, [q.id]: a };
    setAnswers(next);
    saveQuiz(next);
    // Fire-and-forget API submit; localStorage is the source of truth in seed mode.
    submitQuizAnswer({ set_id: set.id, question_id: q.id, answer: a }).catch(() => {});
    if (idx + 1 < total) setIdx(idx + 1);
    else {
      setDone(true);
      onSaved();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{set.title[lang]}</DialogTitle>
          <DialogDescription>{t("medQuizSubtitle")}</DialogDescription>
        </DialogHeader>
        {!done ? (
          <div className="space-y-5 py-2">
            <div className="flex items-center gap-2">
              {set.questions.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition ${i <= idx ? "bg-gradient-primary" : "bg-secondary"}`}
                />
              ))}
            </div>
            <div className="rounded-xl border border-border bg-gradient-soft p-5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {q.topic}
              </p>
              <p className="text-lg font-medium mt-2 leading-snug">{q.q[lang]}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => answer("yes")}
                className="bg-gradient-primary text-primary-foreground"
              >
                {t("medQuizYes")}
              </Button>
              <Button onClick={() => answer("no")} variant="outline">
                {t("medQuizNo")}
              </Button>
              <Button onClick={() => answer("idk")} variant="ghost">
                {t("medQuizIdk")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              ধাপ {idx + 1} / {total}
            </p>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <div className="size-14 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center mx-auto">
              <Sparkles className="size-7" />
            </div>
            <p className="text-base font-medium">{t("medQuizDone")}</p>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gradient-primary text-primary-foreground"
            >
              ঠিক আছে
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Score card ────────────────────────────────────────────────────────
function ScoreCard({
  kind,
  label,
  set,
  answers,
  onOpen,
}: {
  kind: "mom" | "baby";
  label: string;
  set: QuizSet | null;
  answers: QuizStore;
  onOpen: () => void;
}) {
  const total = set?.questions.length ?? 0;
  const answered = set ? set.questions.filter((q) => answers[q.id]).length : 0;
  const yes = set ? set.questions.filter((q) => answers[q.id] === "yes").length : 0;
  const coverage = total ? Math.round((answered / total) * 100) : 0;
  const health = answered ? Math.round((yes / answered) * 100) : 0;
  const Icon = kind === "mom" ? Heart : Baby;
  const ring =
    kind === "mom"
      ? "bg-gradient-to-br from-primary/25 to-lavender/20"
      : "bg-gradient-to-br from-teal/30 to-sky/20";

  return (
    <button
      onClick={onOpen}
      className="glass-card p-4 text-left w-full hover:glow-ring transition group"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`size-9 rounded-lg ${ring} text-primary grid place-items-center`}>
          <Icon className="size-4" />
        </span>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold">
            {answered ? `${health}% সঠিক পথে আছেন` : "আমাদের আরও জানতে সাহায্য করুন"}
          </p>
        </div>
        <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition" />
      </div>
      <div className="space-y-2">
        <Bar
          label="সুস্থতা"
          value={health}
          tone={health >= 70 ? "good" : health >= 40 ? "warn" : "bad"}
        />
        <Bar label="কভারেজ" value={coverage} tone="info" />
      </div>
      <p className="text-[11px] text-muted-foreground mt-3 inline-flex items-center gap-1">
        <Sparkles className="size-3 text-primary" /> {answered}/{total} তথ্য শেয়ার করেছেন
      </p>
    </button>
  );
}

function Bar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "good" | "warn" | "bad" | "info";
}) {
  const cls =
    tone === "good"
      ? "bg-sage"
      : tone === "warn"
        ? "bg-marigold"
        : tone === "bad"
          ? "bg-destructive"
          : "bg-gradient-primary";
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
        <span>{label}</span>
        <span className="tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full ${cls} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// ─── Sparkline (no chart lib) ──────────────────────────────────────────
function Sparkline({ values }: { values: number[] }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const w = 100,
    h = 30;
  const step = w / Math.max(values.length - 1, 1);
  const points = values
    .map((v, i) => `${i * step},${h - ((v - min) / (max - min || 1)) * h}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.66 0.18 12)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.72 0.12 290)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke="oklch(0.66 0.18 12)" strokeWidth="1.5" points={points} />
      <polyline fill="url(#spark)" stroke="none" points={`0,${h} ${points} ${w},${h}`} />
    </svg>
  );
}

// ─── News list (combined) ──────────────────────────────────────────────
function NewsList({ items }: { items: NewsItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((n) => {
        const tone = n.kind === "official" ? "bg-primary/10 text-primary" : "bg-teal/15 text-teal";
        return (
          <article
            key={n.id}
            className="rounded-lg border border-border bg-white/60 p-3 hover:border-primary/40 transition"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium ${tone}`}
              >
                {n.tag}
              </span>
              <span className="text-[10px] text-muted-foreground">{n.date}</span>
            </div>
            <h3 className="text-sm font-semibold mt-2 leading-snug">{n.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.body}</p>
            <p className="text-[10px] text-muted-foreground/80 mt-2 italic">— {n.source}</p>
          </article>
        );
      })}
    </div>
  );
}

// ─── Locked card (unverified users) ────────────────────────────────────
function LockedPersonalized() {
  const t = useT();
  return (
    <div className="glass-card relative overflow-hidden p-6 sm:p-8 text-center">
      <div className="absolute inset-0 bg-gradient-mesh opacity-70 pointer-events-none" />
      <div className="relative">
        <div className="mx-auto size-14 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center mb-3 shadow-md">
          <Lock className="size-6" />
        </div>
        <h2 className="font-display text-2xl text-gradient-primary">{t("medLockedTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          {t("medLockedBody")}
        </p>
        <div className="mt-5 max-w-xs mx-auto">
          <IllustrationDoctor className="w-full h-auto rounded-xl" />
        </div>
        <Button asChild className="mt-5 rounded-lg bg-gradient-primary text-primary-foreground">
          <Link to="/onboarding">
            <ShieldCheck className="size-4 mr-1.5" /> {t("medLockedCta")}
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────
function Medical() {
  const t = useT();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = React.useState<QuizStore>(() => loadQuiz());
  const [openSet, setOpenSet] = React.useState<"mom" | "baby" | null>(null);
  const [quizzes, setQuizzes] = React.useState<Record<"mom" | "baby", QuizSet> | null>(null);
  const [analytics, setAnalytics] = React.useState<MedicalAnalytics | null>(null);

  const isVerified = user.tier >= 2;

  React.useEffect(() => {
    fetchQuizzes()
      .then(setQuizzes)
      .catch(() => {});
    if (isVerified)
      fetchMedicalAnalytics()
        .then(setAnalytics)
        .catch(() => {});
  }, [isVerified]);

  const refreshQuiz = () => setQuiz(loadQuiz());

  const motherTips = React.useMemo(() => buildMotherTips(user, quiz), [user, quiz]);
  const babyTips = React.useMemo(() => buildBabyTips(user, quiz), [user, quiz]);

  const askMidwife = (q: string) => {
    navigate({ to: "/midwife", search: { q, send: 1 } });
  };

  // Dismissable floating prompts (bottom-right)
  const [dismissed, setDismissed] = React.useState<Record<string, boolean>>({});
  const dismiss = (id: string) => setDismissed((d) => ({ ...d, [id]: true }));
  const prompts = [
    { id: "p_help", text: t("quickNeedHelp") },
    { id: "p_unwell", text: t("quickFeelUnwell") },
    { id: "p_doc", text: t("quickTalkDoctor") },
  ].filter((p) => !dismissed[p.id]);

  return (
    <div className="space-y-6 relative">
      <Reveal>
        <header className="relative overflow-hidden rounded-2xl glass-card p-5 sm:p-7 tech-grid">
          <div className="absolute inset-0 bg-gradient-mesh opacity-60 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-aurora opacity-15 pointer-events-none" />
          <div className="flex items-start justify-between gap-3 relative">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-primary font-semibold mb-2">
                <Cpu className="size-3" /> এআই-চালিত মেডিকেল হাব
              </div>
              <h1 className="font-display text-3xl sm:text-4xl text-gradient-primary leading-tight">
                {t("medicalTitle")}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-xl">
                {t("medicalSubtitle")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {isVerified && (
                <Link
                  to="/profile"
                  className="hidden sm:inline-flex text-xs underline text-muted-foreground hover:text-foreground items-center gap-1"
                >
                  <ShieldCheck className="size-3.5" /> প্রোফাইল আপডেট করুন
                </Link>
              )}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="bg-white/50 backdrop-blur rounded-lg border-primary/20 hover:border-primary/40 text-primary"
              >
                <Link to="/medical/clinics">
                  <MapPin className="size-3.5 mr-1.5" /> ক্লিনিক খুঁজুন
                </Link>
              </Button>
            </div>
          </div>
        </header>
      </Reveal>

      {!isVerified ? (
        // ─── Unverified: combined news + complete-registration card ───
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <section className="lg:col-span-7 order-2 lg:order-1">
            <Reveal>
              <div className="glass-card p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="size-8 rounded-lg bg-gradient-primary text-primary-foreground grid place-items-center">
                    <Bell className="size-4" />
                  </span>
                  <h2 className="font-display text-base">{t("medNewsCombined")}</h2>
                </div>
                <NewsList items={combinedNews} />
              </div>
            </Reveal>
          </section>
          <aside className="lg:col-span-5 order-1 lg:order-2">
            <Reveal>
              <LockedPersonalized />
            </Reveal>
          </aside>
        </div>
      ) : (
        // ─── Verified: full three-column hub ──────────────────────────
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT — combined news */}
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <Reveal>
              <section className="glass-card p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="size-8 rounded-lg bg-gradient-primary text-primary-foreground grid place-items-center">
                    <HandHeart className="size-4" />
                  </span>
                  <h2 className="font-display text-sm uppercase tracking-wider">
                    {t("medNewsCombined")}
                  </h2>
                </div>
                <NewsList items={combinedNews} />
              </section>
            </Reveal>
          </aside>

          {/* MIDDLE — personalized tabs */}
          <section className="lg:col-span-6 order-1 lg:order-2 space-y-4">
            <Reveal>
              <div className="glass-card p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="size-8 rounded-lg bg-gradient-primary text-primary-foreground grid place-items-center">
                    <Sparkles className="size-4" />
                  </span>
                  <div>
                    <h2 className="font-display text-base">{t("medForYou")}</h2>
                    <p className="text-[11px] text-muted-foreground">
                      সরাসরি এবং ব্যক্তিগতকৃত — আপনার প্রোফাইল এবং কুইজের ওপর ভিত্তি করে।
                    </p>
                  </div>
                </div>
                <Tabs defaultValue="mother" className="w-full">
                  <TabsList className="grid grid-cols-2 w-full bg-secondary/60">
                    <TabsTrigger value="mother">
                      <Heart className="size-4 mr-1.5" /> {t("forMother")}
                    </TabsTrigger>
                    <TabsTrigger value="baby">
                      <Baby className="size-4 mr-1.5" /> {t("forBaby")}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="mother" className="mt-4 space-y-3">
                    <TipList tips={motherTips} />
                  </TabsContent>
                  <TabsContent value="baby" className="mt-4 space-y-3">
                    <TipList tips={babyTips} />
                  </TabsContent>
                </Tabs>
              </div>
            </Reveal>
          </section>

          {/* RIGHT — analytics + quick midwife shortcuts */}
          <aside className="lg:col-span-3 order-3 space-y-4">
            <Reveal>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="size-7 rounded-lg bg-gradient-primary text-primary-foreground grid place-items-center">
                    <Activity className="size-3.5" />
                  </span>
                  <h2 className="font-display text-sm uppercase tracking-wider">
                    {t("medHealthAnalytics")}
                  </h2>
                </div>
                <ScoreCard
                  kind="mom"
                  label={t("medMom")}
                  set={quizzes?.mom ?? null}
                  answers={quiz}
                  onOpen={() => setOpenSet("mom")}
                />
                <ScoreCard
                  kind="baby"
                  label={t("medBaby")}
                  set={quizzes?.baby ?? null}
                  answers={quiz}
                  onOpen={() => setOpenSet("baby")}
                />

                {analytics && (
                  <div className="glass-card p-4 space-y-3">
                    <Stat
                      icon={Users}
                      tone="lavender"
                      label={t("medAnalyticsCohort")}
                      value={`${analytics.cohort_coverage_pct}%`}
                    />
                    <Stat
                      icon={MapPin}
                      tone="marigold"
                      label={t("medAnalyticsNearby")}
                      value={String(analytics.nearby_alerts)}
                    />
                    <Stat
                      icon={ShieldCheck}
                      tone="teal"
                      label="টিকা গ্রহণের হার"
                      value={`${analytics.vaccine_uptake_pct}%`}
                    />
                    <Stat
                      icon={MessageCircleHeart}
                      tone="sage"
                      label="সাপ্তাহিক প্রশ্ন সংখ্যা"
                      value={String(analytics.community_questions)}
                    />
                    <div className="pt-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking wider text-muted-foreground mb-1">
                        <TrendingUp className="size-3" /> {t("medAnalyticsTrends")}
                      </div>
                      <Sparkline values={analytics.weekly_checkins} />
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground text-center">
                  {t("medHelpUsKnow")} — {t("medTakeQuiz")}
                </p>
              </div>
            </Reveal>
          </aside>
        </div>
      )}

      <QuizDialog
        open={openSet !== null}
        onOpenChange={(v) => {
          if (!v) setOpenSet(null);
          refreshQuiz();
        }}
        set={openSet && quizzes ? quizzes[openSet] : null}
        onSaved={refreshQuiz}
      />

      {/* Floating dismissable quick-ask popups */}
      {isVerified && prompts.length > 0 && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col gap-2 max-w-[16rem]">
          {prompts.map((p, i) => (
            <div
              key={p.id}
              className="glass-card p-3 pr-2 flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-right-4"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <button
                onClick={() => askMidwife(p.text)}
                className="flex items-center gap-2 flex-1 text-left group"
              >
                <span className="size-8 rounded-lg bg-gradient-primary text-primary-foreground grid place-items-center shrink-0">
                  <MessageCircleHeart className="size-4" />
                </span>
                <span className="text-xs font-medium leading-snug group-hover:text-primary transition">
                  {p.text}
                </span>
              </button>
              <button
                onClick={() => dismiss(p.id)}
                aria-label={t("quickDismiss")}
                className="size-7 rounded-md grid place-items-center text-muted-foreground hover:bg-secondary hover:text-foreground transition shrink-0"
              >
                <Lock className="size-3.5 hidden" />
                <span className="text-base leading-none">×</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "lavender" | "teal" | "marigold" | "sage";
  label: string;
  value: string;
}) {
  const toneCls =
    tone === "lavender"
      ? "bg-lavender/15 text-lavender"
      : tone === "teal"
        ? "bg-teal/15 text-teal"
        : tone === "marigold"
          ? "bg-marigold/15 text-marigold"
          : "bg-sage/15 text-sage";
  return (
    <div className="flex items-center gap-3">
      <span className={`size-8 rounded-lg grid place-items-center ${toneCls}`}>
        <Icon className="size-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">
          {label}
        </p>
        <p className="text-sm font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function TipList({ tips }: { tips: Tip[] }) {
  if (!tips.length) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          ডানপাশে একটি কুইক চেক-ইন করুন এবং আপনার প্রোফাইলটি সম্পূর্ণ করুন — সাথে সাথেই আপনার জন্য
          ব্যক্তিগতকৃত পরামর্শ এখানে দেখতে পাবেন।
        </p>
      </div>
    );
  }

  return (
    <>
      {tips.map((tip, i) => (
        <Reveal key={tip.id} delay={i * 30}>
          <article
            className={`rounded-lg p-4 flex gap-3 items-start border transition ${tip.urgent ? "border-destructive/40 bg-destructive/5" : "border-border bg-white/70 hover:border-primary/30"}`}
          >
            <div
              className={`size-10 rounded-lg grid place-items-center shrink-0 ${tip.urgent ? "bg-destructive/15 text-destructive" : "bg-gradient-soft text-primary"}`}
            >
              {tip.urgent ? <AlertTriangle className="size-4" /> : <Sparkles className="size-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                <span
                  className={`px-2 py-0.5 rounded ${tip.urgent ? "bg-destructive/15 text-destructive" : "bg-secondary"}`}
                >
                  {tip.tag}
                </span>
              </div>
              <h3 className="text-base font-semibold mt-1 leading-snug">{tip.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{tip.body}</p>
            </div>
          </article>
        </Reveal>
      ))}
    </>
  );
}
