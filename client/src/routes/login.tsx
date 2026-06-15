import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import * as React from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "লগইন — মমতা" }] }),
  component: Login,
});

import { api } from "@/services/api";

function Login() {
  const { setUser } = useAuth();
  const t = useT();
  const nav = useNavigate();
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [step, setStep] = React.useState<"phone" | "otp">("phone");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const sendCode = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await api.requestOTP(phone);
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.error || t("onbVerifyBody")); // Fallback or specific error key if added
    } finally {
      setIsLoading(false);
    }
  };

  const verify = async () => {
    if (otp.length < 4) return;
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await api.verifyOTP(phone, otp);
      setUser({
        phone: user.phone,
        district: user.district,
        upazila: user.upazila,
        language: user.language,
        tier: user.tier,
        verified: user.verified,
        avatar: user.avatar_url,
        mother: { name: user.name },
        child: {},
        medical: {},
      });
      nav({ to: "/feed" });
    } catch (err: any) {
      setError(err.response?.data?.error || t("loginNotFound"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <span className="size-8 rounded-xl bg-primary text-primary-foreground grid place-items-center">
            <ShieldCheck className="size-4" />
          </span>
          <span className="font-display text-lg">মমতা</span>
        </div>

        <div className="card-warm p-6">
          {step === "phone" ? (
            <>
              <h1 className="font-display text-2xl">{t("loginTitle")}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("loginBody")}</p>
              <div className="mt-5 space-y-2">
                <Label htmlFor="loginphone">{t("onbMobile")}</Label>
                <Input
                  id="loginphone"
                  inputMode="tel"
                  placeholder={t("onbPhonePh")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
              <Button
                className="w-full mt-5 rounded-lg h-11"
                disabled={phone.length < 7 || isLoading}
                onClick={sendCode}
              >
                {isLoading ? "..." : t("onbSendCode")} <ArrowRight className="size-4 ml-1" />
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                {t("loginNewHere")}{" "}
                <Link to="/onboarding" className="underline text-foreground">
                  {t("loginCreateAcct")}
                </Link>
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep("phone")}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3"
              >
                <ArrowLeft className="size-3.5" /> {t("onbBack")}
              </button>
              <h1 className="font-display text-2xl">{t("loginCodeTitle")}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t("loginCodeBody").replace("{phone}", phone)}
              </p>
              <div className="mt-5 space-y-2">
                <Label htmlFor="loginotp">{t("onbCode")}</Label>
                <Input
                  id="loginotp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={t("onbOtpPh")}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="tracking-[0.5em] text-center text-lg"
                />
              </div>
              {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
              <Button
                className="w-full mt-5 rounded-lg h-11"
                disabled={otp.length < 4 || isLoading}
                onClick={verify}
              >
                {isLoading ? "..." : t("loginSignIn")} <ArrowRight className="size-4 ml-1" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
