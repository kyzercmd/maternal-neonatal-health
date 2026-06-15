import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useAuth } from "@/lib/auth";
import { districts } from "@/lib/seed";
import { saveRegistered, nidQueueStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight, ArrowLeft, Camera, IdCard, Sparkles, Check } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — Momota" }] }),
  component: Onboarding,
});

type Step = "phone" | "otp" | "name" | "location" | "child" | "invite" | "cv" | "nid" | "done";

function Onboarding() {
  const { user, setUser } = useAuth();
  const t = useT();
  const nav = useNavigate();
  const [step, setStep] = React.useState<Step>("phone");
  const [phone, setPhone] = React.useState(user.phone ?? "");
  const [otp, setOtp] = React.useState("");
  const [name, setName] = React.useState(user.mother.name ?? "");
  const [district, setDistrict] = React.useState(user.district ?? "");
  const [upazila, setUpazila] = React.useState(user.upazila ?? "");
  const [isPregnant, setIsPregnant] = React.useState(!user.child?.dob);
  const [dob, setDob] = React.useState(user.child?.dob ?? "");
  const [edd, setEdd] = React.useState(user.child?.edd ?? "");
  const [invite, setInvite] = React.useState("");
  const [cvBusy, setCvBusy] = React.useState(false);
  const [nidFile, setNidFile] = React.useState<File | null>(null);
  const [nidBusy, setNidBusy] = React.useState(false);
  const [nidSubmitted, setNidSubmitted] = React.useState(false);

  const ordered: Step[] = ["phone","otp","name","location","child","invite","cv","done"];
  const stepIndex = ordered.indexOf(step === "nid" ? "cv" : step);
  const progress = Math.max(0, Math.min(100, ((stepIndex + 1) / ordered.length) * 100));

  const finish = (tier: 1 | 2 | 3 = 3) => {
    setUser({
      phone,
      district,
      upazila,
      tier,
      verified: tier >= 2,
      mother: { ...user.mother, name },
      child: { ...user.child, dob: isPregnant ? undefined : dob, edd: isPregnant ? edd : undefined },
    });
    saveRegistered({
      phone, name, district, upazila,
      language: user.language, tier,
      avatar: user.avatar,
      motherDob: user.mother.dob,
      childDob: isPregnant ? undefined : dob,
      childEdd: isPregnant ? edd : undefined,
    });
    setStep("done");
  };

  const submitNid = (fileName: string) => {
    // Push into moderation queue — user stays at tier 1 until an admin approves.
    nidQueueStore.set((q) => [
      {
        id: crypto.randomUUID(),
        phone, name, district, upazila,
        fileName,
        submittedAt: Date.now(),
        status: "pending",
      },
      ...q,
    ]);
    setNidSubmitted(true);
    finish(1);
  };


  return (
    <div className="min-h-screen grid place-items-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-xl bg-primary text-primary-foreground grid place-items-center"><ShieldCheck className="size-4" /></span>
            <span className="font-display text-lg">Momota</span>
          </div>
          <span className="text-xs text-muted-foreground">Step {Math.min(stepIndex + 1, ordered.length)} of {ordered.length}</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-6">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="card-warm p-6">
          {step === "phone" && (
            <>
              <h1 className="font-display text-2xl">Welcome 🤍</h1>
              <p className="text-sm text-muted-foreground mt-1">Enter your mobile number to begin. We'll send a one-time code.</p>
              <div className="mt-5 space-y-2">
                <Label htmlFor="phone">Mobile number</Label>
                <Input id="phone" inputMode="tel" placeholder="+8801XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <Button className="w-full mt-5 rounded-lg h-11" disabled={phone.length < 7} onClick={() => setStep("otp")}>
                Send code <ArrowRight className="size-4 ml-1" />
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Already registered on another device? <a href="/login" className="underline text-foreground">Sign in with OTP</a>
              </p>
            </>
          )}

          {step === "otp" && (
            <>
              <Back onClick={() => setStep("phone")} />
              <h1 className="font-display text-2xl">Verify your number</h1>
              <p className="text-sm text-muted-foreground mt-1">We sent a 6-digit code to {phone}. (Demo: any 6 digits work.)</p>
              <div className="mt-5 space-y-2">
                <Label htmlFor="otp">Code</Label>
                <Input id="otp" inputMode="numeric" maxLength={6} placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value)} className="tracking-[0.5em] text-center text-lg" />
              </div>
              <Button className="w-full mt-5 rounded-lg h-11" disabled={otp.length < 4} onClick={() => setStep("name")}>
                Continue <ArrowRight className="size-4 ml-1" />
              </Button>
            </>
          )}

          {step === "name" && (
            <>
              <Back onClick={() => setStep("otp")} />
              <h1 className="font-display text-2xl">What should we call you?</h1>
              <p className="text-sm text-muted-foreground mt-1">Your full name keeps your account personal and recognizable to others in the community.</p>
              <div className="mt-5 space-y-2">
                <Label htmlFor="name">Full name <span className="text-destructive">*</span></Label>
                <Input id="name" required placeholder="e.g. Nusrat Akter" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <Button className="w-full mt-5 rounded-lg h-11" disabled={name.trim().length < 2} onClick={() => setStep("location")}>
                Continue <ArrowRight className="size-4 ml-1" />
              </Button>
            </>
          )}

          {step === "location" && (
            <>
              <Back onClick={() => setStep("name")} />
              <h1 className="font-display text-2xl">Where are you?</h1>
              <p className="text-sm text-muted-foreground mt-1">This helps us route you to the closest clinic during emergencies.</p>
              <div className="mt-5 space-y-3">
                <div className="space-y-2">
                  <Label>District</Label>
                  <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full h-11 rounded-lg border border-input bg-white px-3 text-sm">
                    <option value="">Select your district</option>
                    {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upz">Upazila / Thana</Label>
                  <Input id="upz" placeholder="e.g. Dhanmondi" value={upazila} onChange={(e) => setUpazila(e.target.value)} />
                </div>
              </div>
              <Button className="w-full mt-5 rounded-lg h-11" disabled={!district || !upazila} onClick={() => setStep("child")}>
                Continue <ArrowRight className="size-4 ml-1" />
              </Button>
            </>
          )}

          {step === "child" && (
            <>
              <Back onClick={() => setStep("location")} />
              <h1 className="font-display text-2xl">Tell us about your baby</h1>
              <p className="text-sm text-muted-foreground mt-1">We'll show content for your stage only.</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button onClick={() => setIsPregnant(true)} className={`p-3 rounded-xl border text-sm text-left ${isPregnant ? "border-primary bg-primary/5" : "border-border bg-white"}`}>
                  <p className="font-medium">I'm pregnant</p>
                  <p className="text-xs text-muted-foreground">Expecting baby</p>
                </button>
                <button onClick={() => setIsPregnant(false)} className={`p-3 rounded-xl border text-sm text-left ${!isPregnant ? "border-primary bg-primary/5" : "border-border bg-white"}`}>
                  <p className="font-medium">Baby is here</p>
                  <p className="text-xs text-muted-foreground">0–5 years</p>
                </button>
              </div>
              <div className="mt-4 space-y-2">
                <Label>{isPregnant ? "Expected delivery date" : "Baby's date of birth"}</Label>
                <Input type="date" value={isPregnant ? edd : dob} onChange={(e) => (isPregnant ? setEdd(e.target.value) : setDob(e.target.value))} />
              </div>
              <Button className="w-full mt-5 rounded-lg h-11" disabled={isPregnant ? !edd : !dob} onClick={() => setStep("invite")}>
                Continue <ArrowRight className="size-4 ml-1" />
              </Button>
            </>
          )}

          {step === "invite" && (
            <>
              <Back onClick={() => setStep("child")} />
              <h1 className="font-display text-2xl">Were you invited?</h1>
              <p className="text-sm text-muted-foreground mt-1">An invite from a verified mother lets you skip the gender check.</p>
              <div className="mt-5 space-y-2">
                <Label htmlFor="inv">Invite code (optional)</Label>
                <Input id="inv" placeholder="e.g. NUSRAT-7421" value={invite} onChange={(e) => setInvite(e.target.value)} />
              </div>
              <div className="mt-5 flex flex-col gap-2">
                <Button className="rounded-lg h-11" disabled={!invite} onClick={() => finish(3)}>
                  Use invite — finish <Check className="size-4 ml-1" />
                </Button>
                <Button variant="outline" className="rounded-lg h-11 bg-white" onClick={() => setStep("cv")}>
                  I don't have one — continue
                </Button>
              </div>
            </>
          )}

          {step === "cv" && (
            <>
              <Back onClick={() => setStep("invite")} />
              <h1 className="font-display text-2xl">Quick verification</h1>
              <p className="text-sm text-muted-foreground mt-1">A 3-second camera check keeps this space women-only. Nothing is stored.</p>
              <div className="mt-5 rounded-2xl border border-border bg-secondary/40 aspect-video grid place-items-center">
                <div className="text-center">
                  <Camera className="size-10 mx-auto text-primary/70" />
                  <p className="text-xs text-muted-foreground mt-2">{cvBusy ? "Verifying…" : "Camera preview"}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-2">
                <Button
                  className="rounded-lg h-11"
                  disabled={cvBusy}
                  onClick={() => {
                    setCvBusy(true);
                    setTimeout(() => { setCvBusy(false); finish(3); }, 1800);
                  }}
                >
                  {cvBusy ? "Verifying…" : "Start camera check"}
                </Button>
                <Button variant="outline" className="rounded-lg h-11 bg-white" onClick={() => setStep("nid")}>
                  <IdCard className="size-4 mr-1.5" /> Upload NID instead
                </Button>
              </div>
            </>
          )}

          {step === "nid" && (
            <>
              <Back onClick={() => setStep("cv")} />
              <h1 className="font-display text-2xl">Upload your NID</h1>
              <p className="text-sm text-muted-foreground mt-1">Our team will review within 24 hours. You'll get community access once approved.</p>
              <div className="mt-5 rounded-2xl border border-dashed border-border bg-white p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="nidf"
                  onChange={(e) => setNidFile(e.target.files?.[0] ?? null)}
                />
                <label htmlFor="nidf" className="cursor-pointer text-sm block">
                  <IdCard className="size-8 mx-auto text-primary/70 mb-2" />
                  {nidFile ? (
                    <span className="inline-flex items-center gap-1.5 text-sage"><Check className="size-4" /> {nidFile.name}</span>
                  ) : (
                    <>Tap to upload NID photo</>
                  )}
                </label>
              </div>
              <Button
                className="w-full mt-5 rounded-lg h-11"
                disabled={!nidFile || nidBusy}
                onClick={() => {
                  setNidBusy(true);
                  setTimeout(() => { setNidBusy(false); submitNid(nidFile!.name); }, 900);
                }}
              >
                {nidBusy ? "Submitting…" : "Submit for review"}
              </Button>
            </>
          )}

          {step === "done" && (
            <div className="text-center py-4">
              <div className={`size-14 rounded-2xl grid place-items-center mx-auto mb-3 ${nidSubmitted ? "bg-marigold/15 text-marigold" : "bg-sage/15 text-sage"}`}>
                {nidSubmitted ? <IdCard className="size-6" /> : <Sparkles className="size-6" />}
              </div>
              <h1 className="font-display text-2xl">
                {nidSubmitted ? t("nidPendingTitle") : "You're in 🌸"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {nidSubmitted ? t("nidPendingBody") : "Welcome to the Momota family. Take a deep breath — we've got you."}
              </p>
              <div className="mt-5 rounded-xl bg-accent/40 border border-accent p-4 text-left">
                <p className="text-sm font-semibold">{t("completeProfileTitle")}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("completeProfileBody")}</p>
                <Button className="w-full mt-3 rounded-lg h-10" onClick={() => nav({ to: "/profile" })}>
                  {t("completeProfileCta")} <ArrowRight className="size-4 ml-1" />
                </Button>
              </div>
              <Button variant="outline" className="w-full mt-3 rounded-lg h-11 bg-white" onClick={() => nav({ to: nidSubmitted ? "/medical" : "/feed" })}>
                {nidSubmitted ? "Browse medical info" : t("enterCommunity")} <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>
          )}

        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-4">
          By continuing you agree to keep this space safe and respectful.
        </p>
      </div>
    </div>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3">
      <ArrowLeft className="size-3.5" /> Back
    </button>
  );
}
