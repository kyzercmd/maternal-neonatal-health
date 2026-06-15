import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ShoppingBag, Sparkles, Stethoscope, User, Heart, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useT, useLangAttribute } from "@/lib/i18n";

export function TopBar() {
  const { user, update } = useAuth();
  const { location } = useRouterState();
  const t = useT();
  useLangAttribute();

  const navItems = [
    { to: "/feed", label: t("navCommunity"), Icon: Home },
    { to: "/medical", label: t("navMedical"), Icon: Stethoscope },
    { to: "/midwife", label: t("navMidwife"), Icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border">
      <div className="relative mx-auto max-w-6xl px-3 sm:px-5 h-14 sm:h-16 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="size-8 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-sm">
            <Heart className="size-4 fill-current" />
          </span>
          <span className="font-brand text-lg sm:text-xl tracking-tight">Momota</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 md:absolute md:left-1/2 md:-translate-x-1/2">
          {navItems.map(({ to, label, Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition",
                  active ? "bg-gradient-primary text-primary-foreground shadow-sm" : "text-foreground/80 hover:bg-secondary"
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => update("language", user.language === "en" ? "bn" : "en")}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-secondary hover:bg-accent text-sm transition"
            aria-label="Toggle language"
            title="Toggle language"
          >
            <Globe className="size-4" /> {user.language === "en" ? "EN" : "বাং"}
          </button>
          <Link
            to="/marketplace"
            className="relative size-9 rounded-lg bg-secondary hover:bg-accent grid place-items-center text-foreground/80 transition"
            aria-label={t("navMarketplace")}
            title={`${t("navMarketplace")} — ${t("marketSoonTitle")}`}
          >
            <ShoppingBag className="size-4" />
            <span className="absolute -top-1 -right-1 size-2 rounded-full bg-marigold ring-2 ring-background" aria-hidden />
          </Link>
          <Link
            to="/profile"
            className="size-9 rounded-lg bg-primary/10 grid place-items-center text-primary border border-primary/20"
            aria-label="Profile"
          >
            <User className="size-4" />
          </Link>
        </div>

      </div>
    </header>
  );
}
