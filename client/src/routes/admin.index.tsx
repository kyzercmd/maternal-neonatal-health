import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { getAnalytics } from "@/lib/api/admin";
import type { AnalyticsSnapshot, AnalyticsFilters, Cohort } from "@/lib/api/types";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, AreaChart, Area, CartesianGrid, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { districts as allDistricts } from "@/lib/seed";
import {
  Download, Sparkles, Baby, Heart, Activity, AlertTriangle,
  TrendingUp, Stethoscope, Syringe, Brain, Droplets, ShieldAlert,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AnalyticsPage,
});

const GRAD = ["#e85c8a", "#b46bd8", "#7c8df0", "#4fb8d8", "#6cd3a8", "#e8b14a", "#e88a6b", "#5cc7a9"];
const SEV: Record<"low" | "medium" | "high", { bg: string; fg: string; ring: string; label: string }> = {
  low:    { bg: "bg-sage/10",      fg: "text-sage",      ring: "ring-sage/30",      label: "Low" },
  medium: { bg: "bg-marigold/15",  fg: "text-marigold",  ring: "ring-marigold/30",  label: "Medium" },
  high:   { bg: "bg-destructive/10", fg: "text-destructive", ring: "ring-destructive/30", label: "High" },
};
const COHORTS: { id: Cohort | "all"; label: string }[] = [
  { id: "all", label: "All cohorts" },
  { id: "pregnancy", label: "Pregnant" },
  { id: "0-6m", label: "0–6 months" },
  { id: "6-12m", label: "6–12 months" },
  { id: "1-2y", label: "1–2 years" },
  { id: "2-5y", label: "2–5 years" },
];

function AnalyticsPage() {
  const [filters, setFilters] = React.useState<AnalyticsFilters>({ cohort: "all", district: "all" });
  const [data, setData] = React.useState<AnalyticsSnapshot | null>(null);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => { getAnalytics(filters).then(setData); }, [filters]);

  if (!data) return <p className="text-sm text-muted-foreground">Loading analytics…</p>;

  const maternalBars = [
    { name: "Anemia risk", value: data.maternal.anemia_risk_pct, fill: GRAD[0] },
    { name: "Hypertension", value: data.maternal.hypertension_risk_pct, fill: GRAD[6] },
    { name: "Gest. diabetes", value: data.maternal.gestational_diabetes_risk_pct, fill: GRAD[5] },
    { name: "PPD signals", value: data.maternal.postpartum_depression_pct, fill: GRAD[1] },
    { name: "IFA uptake", value: data.maternal.iron_folic_uptake_pct, fill: GRAD[4] },
    { name: "TT coverage", value: data.maternal.tt_coverage_pct, fill: GRAD[2] },
    { name: "Skilled birth", value: data.maternal.skilled_birth_attendance_pct, fill: GRAD[3] },
  ];

  const childRadial = [
    { name: "Breastfeeding", value: data.child.exclusive_breastfeeding_pct, fill: GRAD[0] },
    { name: "Immunization", value: data.child.immunization_coverage_pct, fill: GRAD[2] },
    { name: "Skin-to-skin",  value: data.child.newborn_skin_to_skin_pct,  fill: GRAD[1] },
    { name: "Healthy weight", value: 100 - data.child.underweight_pct,    fill: GRAD[4] },
  ];

  const trendData = data.weekly_anc_visits.map((v, i) => ({
    w: `W${i + 1}`, anc: v, vac: data.weekly_vaccinations[i] ?? 0,
  }));

  const filteredDistricts = data.district_risk.filter((r) =>
    !search.trim() || r.district.toLowerCase().includes(search.trim().toLowerCase())
  );

  const exportCsv = () => {
    const rows = [
      ["section", "metric", "value"],
      ...Object.entries(data.maternal).map(([k, v]) => ["maternal", k, String(v)]),
      ...Object.entries(data.child).map(([k, v]) => ["child", k, String(v)]),
      ...data.district_risk.map((d) => ["district", d.district, `${d.risk_index} (${d.top_issue})`]),
      ...data.ai_insights.map((i) => ["ai_insight", `${i.severity}:${i.title}`, i.recommendation]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `momota-mch-analytics-${filters.cohort}-${filters.district}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-lavender/10 to-sky/10 p-5 sm:p-6">
        <div className="absolute inset-0 bg-gradient-mesh opacity-60 pointer-events-none" />
        <div className="relative flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-primary font-semibold mb-1.5">
              <Sparkles className="size-3" /> AI-derived MCH signals
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-gradient-primary">Maternal & child health intelligence</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Anonymised, aggregated health insights derived from the Momota network — built for government, NGOs and partners to decide where to act next.
            </p>
          </div>
          <Button onClick={exportCsv} variant="outline" className="rounded-lg bg-white/80 backdrop-blur shrink-0">
            <Download className="size-4 mr-1.5" /> Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="relative mt-5 flex flex-wrap gap-2 items-center">
          <div className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-white/70 border border-border">
            {COHORTS.map((c) => {
              const active = filters.cohort === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setFilters((f) => ({ ...f, cohort: c.id }))}
                  className={`text-xs px-3 py-1.5 rounded-lg transition ${active ? "pill-active" : "text-foreground/70 hover:bg-secondary"}`}
                >{c.label}</button>
              );
            })}
          </div>
          <select
            value={filters.district}
            onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))}
            className="text-xs h-9 rounded-lg border border-border bg-white px-3"
          >
            <option value="all">All districts</option>
            {allDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard icon={Heart} accent={GRAD[0]} label="Mothers in slice" value={data.total_mothers.toLocaleString()} sub="anonymised cohort" />
        <MetricCard icon={Baby} accent={GRAD[1]} label="Babies tracked" value={data.total_babies.toLocaleString()} sub="0–5 years" />
        <MetricCard icon={Brain} accent={GRAD[2]} label="PPD signal" value={`${data.maternal.postpartum_depression_pct}%`} sub="mood / sleep / isolation" />
        <MetricCard icon={Syringe} accent={GRAD[4]} label="EPI coverage" value={`${data.child.immunization_coverage_pct}%`} sub="routine schedule" />
      </div>

      {/* AI Insights */}
      <Panel title="AI-derived insights" subtitle="Generated by the Momota health model — ranked by population impact">
        <div className="grid md:grid-cols-2 gap-3">
          {data.ai_insights.map((ins) => {
            const sev = SEV[ins.severity];
            return (
              <article key={ins.id} className={`rounded-xl border border-border bg-white/80 p-4 ring-1 ${sev.ring}`}>
                <div className="flex items-start gap-3">
                  <span className={`size-9 rounded-lg grid place-items-center shrink-0 ${sev.bg} ${sev.fg}`}>
                    <ShieldAlert className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-sm leading-snug">{ins.title}</h3>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${sev.bg} ${sev.fg} font-semibold`}>{sev.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{ins.body}</p>
                    <div className="mt-2 rounded-md bg-gradient-soft border border-border p-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-0.5">Recommendation</p>
                      <p className="text-xs leading-relaxed">{ins.recommendation}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Panel>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Maternal health signals" subtitle="Risk %, uptake %, coverage % across selected slice">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={maternalBars} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="rgba(0,0,0,0.4)" fontSize={11} />
              <YAxis type="category" dataKey="name" width={110} stroke="rgba(0,0,0,0.6)" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)" }} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {maternalBars.map((b, i) => <rect key={i} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Child wellbeing dial" subtitle="Higher is healthier across this slice">
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart innerRadius="20%" outerRadius="100%" data={childRadial} startAngle={90} endAngle={-270}>
              <RadialBar background dataKey="value" cornerRadius={10} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)" }} formatter={(v: number) => `${v}%`} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="ANC visits & vaccinations — last 12 weeks" subtitle="Combined activity across the selected slice">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trendData} margin={{ left: -10, right: 5, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="gAnc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GRAD[0]} stopOpacity={0.55} />
                <stop offset="100%" stopColor={GRAD[0]} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gVac" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GRAD[2]} stopOpacity={0.5} />
                <stop offset="100%" stopColor={GRAD[2]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis dataKey="w" stroke="rgba(0,0,0,0.4)" fontSize={11} />
            <YAxis stroke="rgba(0,0,0,0.4)" fontSize={11} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)" }} />
            <Area type="monotone" dataKey="anc" name="ANC visits" stroke={GRAD[0]} strokeWidth={2} fill="url(#gAnc)" />
            <Area type="monotone" dataKey="vac" name="Vaccinations" stroke={GRAD[2]} strokeWidth={2} fill="url(#gVac)" />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="District risk index" subtitle="Higher = needs more support. Filter by name.">
        <div className="mb-3 max-w-xs">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search district…" className="h-9" />
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {filteredDistricts.map((d) => {
            const tone = d.risk_index >= 70 ? SEV.high : d.risk_index >= 45 ? SEV.medium : SEV.low;
            return (
              <div key={d.district} className={`rounded-lg border border-border bg-white/80 p-3 ring-1 ${tone.ring}`}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-sm">{d.district}</p>
                    <p className="text-[11px] text-muted-foreground">{d.mothers} mothers · top issue: {d.top_issue}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md font-semibold tabular-nums ${tone.bg} ${tone.fg}`}>{d.risk_index}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${d.risk_index}%`, background: `linear-gradient(90deg, ${GRAD[0]}, ${GRAD[3]})` }} />
                </div>
              </div>
            );
          })}
          {filteredDistricts.length === 0 && <p className="text-sm text-muted-foreground sm:col-span-2 text-center py-4">No districts match "{search}".</p>}
        </div>
      </Panel>

      <div className="grid md:grid-cols-2 gap-4">
        <MiniStat icon={Stethoscope} label="Avg ANC visits / mother" value={data.maternal.antenatal_visits_avg.toFixed(1)} accent={GRAD[2]} />
        <MiniStat icon={Droplets} label="Diarrhoea / 1000 children" value={String(data.child.diarrhoea_incidence_per_1000)} accent={GRAD[3]} />
        <MiniStat icon={Activity} label="Pneumonia / 1000 children" value={String(data.child.pneumonia_incidence_per_1000)} accent={GRAD[6]} />
        <MiniStat icon={AlertTriangle} label="Low birth weight" value={`${data.child.low_birth_weight_pct}%`} accent={GRAD[0]} />
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        All metrics are anonymised and aggregated. Personal identifiers are stripped before the AI generates these signals.
      </p>
    </div>
  );
}

function MetricCard({ icon: Icon, accent, label, value, sub }: {
  icon: React.ComponentType<{ className?: string }>; accent: string; label: string; value: string; sub: string;
}) {
  return (
    <div className="metric-card group">
      <div className="relative flex items-start gap-3">
        <span className="size-10 rounded-lg grid place-items-center text-white shadow-md shrink-0" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-xl font-display font-semibold mt-0.5 tabular-nums">{value}</p>
          <p className="text-[11px] mt-0.5 text-muted-foreground">{sub}</p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent: string }) {
  return (
    <div className="card-warm p-4 flex items-center gap-3">
      <span className="size-10 rounded-lg grid place-items-center text-white" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-lg font-display font-semibold tabular-nums">{value}</p>
      </div>
      <TrendingUp className="size-3.5 text-sage" />
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card-warm p-4 sm:p-5">
      <header className="mb-3">
        <h2 className="font-display text-base leading-none">{title}</h2>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-1">{subtitle}</p>}
      </header>
      {children}
    </div>
  );
}
