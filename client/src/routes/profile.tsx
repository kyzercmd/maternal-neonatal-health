import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RequireTier } from "@/components/layout/RequireTier";
import { useAuth, type MotherInfo, type ChildInfo, type MedicalInfo } from "@/lib/auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/common/Avatar";
import { Reveal } from "@/components/common/Reveal";
import { Camera, ShieldCheck, Globe, LogOut } from "lucide-react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Momota" }] }),
  component: () => (
    <AppShell>
      <RequireTier level={2}>
        <ProfilePage />
      </RequireTier>
    </AppShell>
  ),
});

function ProfilePage() {
  const { user, update, reset } = useAuth();
  const t = useT();
  const fileRef = React.useRef<HTMLInputElement>(null);

  const onAvatar = (f: File | null) => {
    if (!f) return;
    update("avatar", URL.createObjectURL(f));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Reveal className="card-warm p-5 flex items-center gap-4">
        <div className="relative">
          <Avatar name={user.mother.name || "You"} hue={320} size={72} src={user.avatar} />
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 size-8 rounded-full bg-primary text-primary-foreground grid place-items-center shadow"
          >
            <Camera className="size-4" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => onAvatar(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl truncate">{user.mother.name || t("welcome")}</h1>
          <p className="text-sm text-muted-foreground">
            {user.district || "Bangladesh"} {user.upazila ? `· ${user.upazila}` : ""}
          </p>
          <span
            className={`inline-flex items-center gap-1 mt-2 text-xs ${user.tier >= 2 ? "text-sage" : "text-marigold"}`}
          >
            <ShieldCheck className="size-3.5" />{" "}
            {user.tier >= 2 ? t("statusVerified") : t("statusPending")}
          </span>
        </div>
      </Reveal>

      <Tabs defaultValue="mother">
        <TabsList className="grid grid-cols-4 w-full bg-secondary">
          <TabsTrigger value="mother">{t("tabMother")}</TabsTrigger>
          <TabsTrigger value="baby">{t("tabBaby")}</TabsTrigger>
          <TabsTrigger value="medical">{t("tabMedical")}</TabsTrigger>
          <TabsTrigger value="settings">{t("tabSettings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="mother" className="mt-4">
          <FormCard title={t("aboutYou")}>
            <Field
              label={t("fullName")}
              v={user.mother.name}
              onChange={(v) => update("mother", { ...user.mother, name: v })}
            />
            <Field
              label={t("dob")}
              type="date"
              v={user.mother.dob}
              onChange={(v) => update("mother", { ...user.mother, dob: v })}
            />
            <Field
              label={t("occupation")}
              v={user.mother.occupation}
              onChange={(v) => update("mother", { ...user.mother, occupation: v })}
            />
            <Field
              label={t("education")}
              v={user.mother.education}
              onChange={(v) => update("mother", { ...user.mother, education: v })}
            />
            <Field
              label={t("diet")}
              v={user.mother.diet}
              onChange={(v) => update("mother", { ...user.mother, diet: v })}
            />
            <Field
              label={t("bloodGroup")}
              v={user.mother.bloodGroup}
              onChange={(v) => update("mother", { ...user.mother, bloodGroup: v })}
              placeholder="e.g. O+"
            />
          </FormCard>
        </TabsContent>

        <TabsContent value="baby" className="mt-4">
          <FormCard title={t("aboutBaby")}>
            <Field
              label={t("babyName")}
              v={user.child.name}
              onChange={(v) => update("child", { ...user.child, name: v })}
            />
            <Field
              label={t("dob")}
              type="date"
              v={user.child.dob}
              onChange={(v) => update("child", { ...user.child, dob: v })}
            />
            <Field
              label={t("edd")}
              type="date"
              v={user.child.edd}
              onChange={(v) => update("child", { ...user.child, edd: v })}
            />
            <SelectField
              label={t("sex")}
              v={user.child.sex}
              onChange={(v) => update("child", { ...user.child, sex: v as ChildInfo["sex"] })}
              options={[
                { value: "girl", label: t("optGirl") },
                { value: "boy", label: t("optBoy") },
                { value: "other", label: t("optOther") },
              ]}
              placeholderLabel={t("selectPlaceholder")}
            />
            <Field
              label={t("birthWeight")}
              type="number"
              v={user.child.birthWeightKg?.toString()}
              onChange={(v) => update("child", { ...user.child, birthWeightKg: Number(v) })}
            />
            <SelectField
              label={t("feeding")}
              v={user.child.feeding}
              onChange={(v) =>
                update("child", { ...user.child, feeding: v as ChildInfo["feeding"] })
              }
              options={[
                { value: "breast", label: t("optBreast") },
                { value: "formula", label: t("optFormula") },
                { value: "mixed", label: t("optMixed") },
                { value: "solids", label: t("optSolids") },
              ]}
              placeholderLabel={t("selectPlaceholder")}
            />
            <TextField
              label={t("allergies")}
              v={user.child.allergies}
              onChange={(v) => update("child", { ...user.child, allergies: v })}
            />
          </FormCard>
        </TabsContent>

        <TabsContent value="medical" className="mt-4">
          <FormCard title={t("medicalInfo")}>
            <Field
              label={t("motherBlood")}
              v={user.medical.motherBlood}
              onChange={(v) => update("medical", { ...user.medical, motherBlood: v })}
            />
            <Field
              label={t("babyBlood")}
              v={user.medical.babyBlood}
              onChange={(v) => update("medical", { ...user.medical, babyBlood: v })}
            />
            <TextField
              label={t("chronic")}
              v={user.medical.chronic}
              onChange={(v) => update("medical", { ...user.medical, chronic: v })}
            />
            <TextField
              label={t("medications")}
              v={user.medical.medications}
              onChange={(v) => update("medical", { ...user.medical, medications: v })}
            />
            <TextField
              label={t("allergies")}
              v={user.medical.allergies}
              onChange={(v) => update("medical", { ...user.medical, allergies: v })}
            />
            <Field
              label={t("lastCheckup")}
              type="date"
              v={user.medical.lastCheckup}
              onChange={(v) => update("medical", { ...user.medical, lastCheckup: v })}
            />
            <TextField
              label={t("vaccinations")}
              v={user.medical.vaccinations}
              onChange={(v) => update("medical", { ...user.medical, vaccinations: v })}
            />
          </FormCard>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <FormCard title={t("settings")}>
            <Field label={t("phone")} v={user.phone} onChange={(v) => update("phone", v)} />
            <div className="flex items-center justify-between gap-3 py-2 sm:col-span-2">
              <div>
                <p className="text-sm font-medium">{t("language")}</p>
                <p className="text-xs text-muted-foreground">{t("languageHelp")}</p>
              </div>
              <Button
                variant="outline"
                className="rounded-lg"
                onClick={() => update("language", user.language === "en" ? "bn" : "en")}
              >
                <Globe className="size-4 mr-1.5" />{" "}
                {user.language === "en" ? t("english") : t("bangla")}
              </Button>
            </div>
            <div className="pt-2 sm:col-span-2">
              <Button
                variant="outline"
                className="rounded-lg text-destructive border-destructive/30"
                onClick={() => {
                  reset();
                }}
              >
                <LogOut className="size-4 mr-1.5" /> {t("signOutBtn")}
              </Button>
            </div>
          </FormCard>
          <p className="text-[11px] text-muted-foreground mt-3">
            Not signed in?{" "}
            <Link to="/onboarding" className="underline">
              Start onboarding
            </Link>
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-warm p-5 space-y-3">
      <h2 className="font-display text-lg">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}
function Field({
  label,
  v,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  v?: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        value={v ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
function TextField({
  label,
  v,
  onChange,
}: {
  label: string;
  v?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5 sm:col-span-2">
      <Label className="text-xs">{label}</Label>
      <Textarea
        value={v ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="bg-white"
      />
    </div>
  );
}
function SelectField({
  label,
  v,
  onChange,
  options,
  placeholderLabel,
}: {
  label: string;
  v?: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholderLabel?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <select
        value={v ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 rounded-md border border-input bg-white px-3 text-sm"
      >
        <option value="">{placeholderLabel ?? "Select…"}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
