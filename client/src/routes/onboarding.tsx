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
  head: () => ({ meta: [{ title: "স্বাগতম — মমতা" }] }),
  component: Onboarding,
});

type Step = "phone" | "otp" | "name" | "location" | "child" | "invite" | "cv" | "nid" | "done";

import { api } from "@/services/api";

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
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [cvFile, setCvFile] = React.useState<File | null>(null);
  const [cvPreviewUrl, setCvPreviewUrl] = React.useState<string | null>(null);
  const [cvBusy, setCvBusy] = React.useState(false);
  const [nidFile, setNidFile] = React.useState<File | null>(null);
  const [nidBusy, setNidBusy] = React.useState(false);
  const [nidSubmitted, setNidSubmitted] = React.useState(false);

  const ordered: Step[] = ["phone", "otp", "name", "location", "child", "invite", "cv", "done"];
  const stepIndex = ordered.indexOf(step === "nid" ? "cv" : step);
  const progress = Math.max(0, Math.min(100, ((stepIndex + 1) / ordered.length) * 100));

  const sendOTP = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.requestOTP(phone);
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.error || t("errOtpSend"));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.verifyOTP(phone, otp);
      setStep("name");
    } catch (err: any) {
      setError(err.response?.data?.error || t("errOtpInvalid"));
    } finally {
      setIsLoading(false);
    }
  };

  const finish = async (tier: 1 | 2 | 3 = 3) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.completeProfile({
        name,
        district,
        upazila,
        stage: isPregnant ? "pregnant" : "baby",
        date: isPregnant ? edd : dob,
      });

      setUser({
        phone,
        district,
        upazila,
        tier,
        verified: tier >= 2,
        mother: { ...user.mother, name },
        child: {
          ...user.child,
          dob: isPregnant ? undefined : dob,
          edd: isPregnant ? edd : undefined,
        },
      });

      setStep("done");
    } catch (err: any) {
      setError(err.response?.data?.error || t("errProfileSave"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraCheck = async () => {
    if (!cvFile) return;
    setCvBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("webcam_image", cvFile, "camera.jpg");

      await api.uploadCameraVerification(formData);
      await finish(3);
    } catch (err: any) {
      setError(err.response?.data?.error || t("errCvFailed"));
      setCvBusy(false);
    }
  };

  const submitNid = async () => {
    if (!nidFile) return;
    setNidBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("nid_image", nidFile);

      await api.uploadNID(formData);
      setNidSubmitted(true);
      await finish(1); // Tier 1 until approved
    } catch (err: any) {
      setError(err.response?.data?.error || t("errNidUpload"));
    } finally {
      setNidBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-xl bg-primary text-primary-foreground grid place-items-center">
              <ShieldCheck className="size-4" />
            </span>
            <span className="font-display text-lg">মমতা</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {t("onbStep")} {Math.min(stepIndex + 1, ordered.length)} {t("onbOf")} {ordered.length}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-6">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="card-warm p-6">
          {error && (
            <p className="mb-4 text-xs text-destructive bg-destructive/5 p-2 rounded">{error}</p>
          )}

          {step === "phone" && (
            <>
              <h1 className="font-display text-2xl">{t("onbWelcomeTitle")}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("onbWelcomeBody")}</p>
              <div className="mt-5 space-y-2">
                <Label htmlFor="phone">{t("onbMobile")}</Label>
                <Input
                  id="phone"
                  inputMode="tel"
                  placeholder={t("onbPhonePh")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button
                className="w-full mt-5 rounded-lg h-11"
                disabled={phone.length < 7 || isLoading}
                onClick={sendOTP}
              >
                {isLoading ? "..." : t("onbSendCode")} <ArrowRight className="size-4 ml-1" />
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                {t("onbAlreadyRegistered")}{" "}
                <a href="/login" className="underline text-foreground">
                  {t("onbSignInOtp")}
                </a>
              </p>
            </>
          )}

          {step === "otp" && (
            <>
              <Back onClick={() => setStep("phone")} label={t("onbBack")} />
              <h1 className="font-display text-2xl">{t("onbVerifyTitle")}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t("onbVerifyBody").replace("{phone}", phone)}
              </p>
              <div className="mt-5 space-y-2">
                <Label htmlFor="otp">{t("onbCode")}</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={t("onbOtpPh")}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="tracking-[0.5em] text-center text-lg"
                />
              </div>
              <Button
                className="w-full mt-5 rounded-lg h-11"
                disabled={otp.length < 4 || isLoading}
                onClick={verifyOTP}
              >
                {isLoading ? "..." : t("onbContinue")} <ArrowRight className="size-4 ml-1" />
              </Button>
            </>
          )}

          {step === "name" && (
            <>
              <Back onClick={() => setStep("otp")} label={t("onbBack")} />
              <h1 className="font-display text-2xl">{t("onbNameTitle")}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("onbNameBody")}</p>
              <div className="mt-5 space-y-2">
                <Label htmlFor="name">
                  {t("fullName")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  required
                  placeholder={t("onbNamePh")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <Button
                className="w-full mt-5 rounded-lg h-11"
                disabled={name.trim().length < 2}
                onClick={() => setStep("location")}
              >
                {t("onbContinue")} <ArrowRight className="size-4 ml-1" />
              </Button>
            </>
          )}

          {step === "location" && (
            <>
              <Back onClick={() => setStep("name")} label={t("onbBack")} />
              <h1 className="font-display text-2xl">{t("onbLocTitle")}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("onbLocBody")}</p>
              <div className="mt-5 space-y-3">
                <div className="space-y-2">
                  <Label>{t("onbDistrict")}</Label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full h-11 rounded-lg border border-input bg-white px-3 text-sm"
                  >
                    <option value="">{t("onbSelectDistrict")}</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upz">{t("onbUpazila")}</Label>
                  <Input
                    id="upz"
                    placeholder={t("onbUpzPh")}
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                  />
                </div>
              </div>
              <Button
                className="w-full mt-5 rounded-lg h-11"
                disabled={!district || !upazila}
                onClick={() => setStep("child")}
              >
                {t("onbContinue")} <ArrowRight className="size-4 ml-1" />
              </Button>
            </>
          )}

          {step === "child" && (
            <>
              <Back onClick={() => setStep("location")} label={t("onbBack")} />
              <h1 className="font-display text-2xl">{t("onbChildTitle")}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("onbChildBody")}</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsPregnant(true)}
                  className={`p-3 rounded-xl border text-sm text-left ${isPregnant ? "border-primary bg-primary/5" : "border-border bg-white"}`}
                >
                  <p className="font-medium">{t("onbPregnant")}</p>
                  <p className="text-xs text-muted-foreground">{t("onbExpecting")}</p>
                </button>
                <button
                  onClick={() => setIsPregnant(false)}
                  className={`p-3 rounded-xl border text-sm text-left ${!isPregnant ? "border-primary bg-primary/5" : "border-border bg-white"}`}
                >
                  <p className="font-medium">{t("onbBabyHere")}</p>
                  <p className="text-xs text-muted-foreground">{t("onbBabyAge")}</p>
                </button>
              </div>
              <div className="mt-4 space-y-2">
                <Label>{isPregnant ? t("onbEdd") : t("onbBabyDob")}</Label>
                <Input
                  type="date"
                  value={isPregnant ? edd : dob}
                  onChange={(e) => (isPregnant ? setEdd(e.target.value) : setDob(e.target.value))}
                />
              </div>
              <Button
                className="w-full mt-5 rounded-lg h-11"
                disabled={isPregnant ? !edd : !dob}
                onClick={() => setStep("invite")}
              >
                {t("onbContinue")} <ArrowRight className="size-4 ml-1" />
              </Button>
            </>
          )}

          {step === "invite" && (
            <>
              <Back onClick={() => setStep("child")} label={t("onbBack")} />
              <h1 className="font-display text-2xl">{t("onbInviteTitle")}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("onbInviteBody")}</p>
              <div className="mt-5 space-y-2">
                <Label htmlFor="inv">{t("onbInviteLabel")}</Label>
                <Input
                  id="inv"
                  placeholder={t("onbInvitePh")}
                  value={invite}
                  onChange={(e) => setInvite(e.target.value)}
                />
              </div>
              <div className="mt-5 flex flex-col gap-2">
                <Button
                  className="rounded-lg h-11"
                  disabled={!invite || isLoading}
                  onClick={() => finish(3)}
                >
                  {isLoading ? "..." : t("onbUseInvite")} <Check className="size-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-lg h-11 bg-white"
                  onClick={() => setStep("cv")}
                >
                  {t("onbNoInvite")}
                </Button>
              </div>
            </>
          )}

          {step === "cv" && (
            <>
              <Back onClick={() => setStep("invite")} label={t("onbBack")} />
              <h1 className="font-display text-2xl">{t("onbCvTitle")}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("onbCvBody")}</p>
              <div className="mt-5 rounded-2xl border border-border bg-secondary/40 aspect-video grid place-items-center overflow-hidden relative">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCvFile(file);
                      setCvPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />
                {cvPreviewUrl ? (
                  <img src={cvPreviewUrl} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="text-center">
                    <Camera className="size-10 mx-auto text-primary/70" />
                    <p className="text-xs text-muted-foreground mt-2">{t("onbNidPick")}</p>
                  </div>
                )}
                {cvBusy && (
                  <div className="absolute inset-0 bg-black/40 grid place-items-center z-20">
                    <p className="text-white text-sm font-medium animate-pulse">
                      {t("onbCvVerifying")}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-5 flex flex-col gap-2">
                <Button
                  className="rounded-lg h-11"
                  disabled={cvBusy || !cvFile}
                  onClick={handleCameraCheck}
                >
                  {cvBusy ? "..." : t("onbCvSubmit")}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-lg h-11 bg-white"
                  onClick={() => setStep("nid")}
                >
                  <IdCard className="size-4 mr-1.5" /> {t("onbCvUploadNid")}
                </Button>
              </div>
            </>
          )}

          {step === "nid" && (
            <>
              <Back onClick={() => setStep("cv")} label={t("onbBack")} />
              <h1 className="font-display text-2xl">{t("onbNidTitle")}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("onbNidBody")}</p>
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
                    <span className="inline-flex items-center gap-1.5 text-sage">
                      <Check className="size-4" /> {nidFile.name}
                    </span>
                  ) : (
                    <>{t("onbNidPick")}</>
                  )}
                </label>
              </div>
              <Button
                className="w-full mt-5 rounded-lg h-11"
                disabled={!nidFile || nidBusy}
                onClick={submitNid}
              >
                {nidBusy ? t("onbNidSubmitting") : t("onbNidSubmit")}
              </Button>
            </>
          )}

          {step === "done" && (
            <div className="text-center py-4">
              <div
                className={`size-14 rounded-2xl grid place-items-center mx-auto mb-3 ${nidSubmitted ? "bg-marigold/15 text-marigold" : "bg-sage/15 text-sage"}`}
              >
                {nidSubmitted ? <IdCard className="size-6" /> : <Sparkles className="size-6" />}
              </div>
              <h1 className="font-display text-2xl">
                {nidSubmitted ? t("nidPendingTitle") : t("onbDoneTitle")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {nidSubmitted ? t("nidPendingBody") : t("onbDoneBody")}
              </p>
              <div className="mt-5 rounded-xl bg-accent/40 border border-accent p-4 text-left">
                <p className="text-sm font-semibold">{t("completeProfileTitle")}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("completeProfileBody")}</p>
                <Button
                  className="w-full mt-3 rounded-lg h-10"
                  onClick={() => nav({ to: "/profile" })}
                >
                  {t("completeProfileCta")} <ArrowRight className="size-4 ml-1" />
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full mt-3 rounded-lg h-11 bg-white"
                onClick={() => nav({ to: nidSubmitted ? "/medical" : "/feed" })}
              >
                {nidSubmitted ? t("gateBrowse") : t("enterCommunity")}{" "}
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-4">{t("onbAgree")}</p>
      </div>
    </div>
  );
}

function Back({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3"
    >
      <ArrowLeft className="size-3.5" /> {label}
    </button>
  );
}
