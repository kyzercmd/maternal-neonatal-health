import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import * as React from "react";
import { useAuth } from "@/lib/auth";
import { lookupRegistered } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Momota" }] }),
  component: Login,
});

function Login() {
  const { setUser } = useAuth();
  const nav = useNavigate();
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [step, setStep] = React.useState<"phone" | "otp">("phone");
  const [error, setError] = React.useState<string | null>(null);

  const sendCode = () => {
    setError(null);
    if (!lookupRegistered(phone)) {
      setError("We couldn't find an account with that number. Please sign up first.");
      return;
    }
    setStep("otp");
  };

  const verify = () => {
    if (otp.length < 4) return;
    const reg = lookupRegistered(phone);
    if (!reg) { setError("Account not found."); return; }
    setUser({
      phone: reg.phone,
      district: reg.district,
      upazila: reg.upazila,
      language: reg.language,
      tier: reg.tier,
      verified: true,
      avatar: reg.avatar,
      mother: { name: reg.name, dob: reg.motherDob },
      child: { dob: reg.childDob, edd: reg.childEdd },
      medical: {},
    });
    nav({ to: "/feed" });
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <span className="size-8 rounded-xl bg-primary text-primary-foreground grid place-items-center"><ShieldCheck className="size-4" /></span>
          <span className="font-display text-lg">Momota</span>
        </div>

        <div className="card-warm p-6">
          {step === "phone" ? (
            <>
              <h1 className="font-display text-2xl">Welcome back 🤍</h1>
              <p className="text-sm text-muted-foreground mt-1">Sign in with your registered mobile number — we'll send a one-time code.</p>
              <div className="mt-5 space-y-2">
                <Label htmlFor="loginphone">Mobile number</Label>
                <Input id="loginphone" inputMode="tel" placeholder="+8801XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
              <Button className="w-full mt-5 rounded-lg h-11" disabled={phone.length < 7} onClick={sendCode}>
                Send code <ArrowRight className="size-4 ml-1" />
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                New here? <Link to="/onboarding" className="underline text-foreground">Create an account</Link>
              </p>
            </>
          ) : (
            <>
              <button onClick={() => setStep("phone")} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3">
                <ArrowLeft className="size-3.5" /> Back
              </button>
              <h1 className="font-display text-2xl">Enter your code</h1>
              <p className="text-sm text-muted-foreground mt-1">We sent a 6-digit code to {phone}. (Demo: any 6 digits work.)</p>
              <div className="mt-5 space-y-2">
                <Label htmlFor="loginotp">Code</Label>
                <Input id="loginotp" inputMode="numeric" maxLength={6} placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value)} className="tracking-[0.5em] text-center text-lg" />
              </div>
              <Button className="w-full mt-5 rounded-lg h-11" disabled={otp.length < 4} onClick={verify}>
                Sign in <ArrowRight className="size-4 ml-1" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
