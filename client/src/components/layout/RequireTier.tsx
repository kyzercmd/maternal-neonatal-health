import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

/**
 * RequireTier — soft gate. Shows a warm "complete verification" card
 * instead of hard redirecting, preserving the empathetic tone.
 */
export function RequireTier({ level = 3, children }: { level?: 2 | 3; children: React.ReactNode }) {
  const { user } = useAuth();
  const t = useT();
  if (user.tier >= level) return <>{children}</>;

  return (
    <div className="max-w-md mx-auto mt-6 card-warm p-8 text-center">
      <div className="mx-auto size-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-4">
        <Lock className="size-6" />
      </div>
      <h2 className="font-display text-2xl">{t("gateTitle")}</h2>
      <p className="mt-2 text-muted-foreground text-sm">{t("gateBody")}</p>
      <div className="mt-5 flex flex-col gap-2">
        <Button asChild className="rounded-lg">
          <Link to="/onboarding">
            <ShieldCheck className="size-4 mr-1.5" /> {t("gateCta")}
          </Link>
        </Button>
        <Link to="/medical" className="text-sm text-muted-foreground hover:text-foreground">
          {t("gateBrowse")}
        </Link>
      </div>
    </div>
  );
}
