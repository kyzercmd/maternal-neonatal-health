import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Sparkles, Stethoscope, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export function BottomNav() {
  const { location } = useRouterState();
  const t = useT();
  const items = [
    { to: "/feed", label: t("navCommunity"), Icon: Home },
    { to: "/medical", label: t("navMedical"), Icon: Stethoscope },
    { to: "/midwife", label: t("navMidwife"), Icon: Sparkles },
    { to: "/profile", label: t("navProfile"), Icon: User },
  ];
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-border safe-pb"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-4">
        {items.map(({ to, label, Icon }) => {
          const active = location.pathname.startsWith(to);
          return (
            <li key={to} className="relative">
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-12 bg-gradient-primary rounded-b-full"
                  aria-hidden
                />
              )}
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "size-9 grid place-items-center rounded-md transition",
                    active ? "bg-gradient-primary text-primary-foreground shadow-md" : "",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className={cn(active && "font-semibold")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
