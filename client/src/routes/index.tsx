import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Reveal } from "@/components/common/Reveal";
import { Button } from "@/components/ui/button";
import { Heart, ShieldCheck, Sparkles, Users, ShoppingBag, Stethoscope, ArrowRight, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Momota — A warm community for mothers in Bangladesh" },
      { name: "description", content: "Verified, women-only support: cohort community, AI Digital Midwife, baby marketplace, and trusted medical alerts." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 pb-20 md:pb-0">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 sm:pt-16 pb-12 sm:pb-20 grid md:grid-cols-2 gap-8 items-center">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/15">
                <Heart className="size-3.5 fill-current" /> For mothers, by mothers
              </span>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl mt-4 leading-[1.05] text-balance">
                You're never alone in this journey.
              </h1>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-prose">
                Momota is a safe, women-only space for mothers across Bangladesh — with a trusted community, a gentle AI midwife, and verified medical alerts you can rely on.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full h-12 px-6 text-base shadow-md shadow-primary/20">
                  <Link to="/onboarding">Begin gently <ArrowRight className="size-4 ml-1" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-6 text-base bg-white">
                  <Link to="/medical">See today's alerts</Link>
                </Button>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-sage" /> Verified women only</li>
                <li className="flex items-center gap-1.5"><Sparkles className="size-4 text-marigold" /> Bangla & English</li>
                <li className="flex items-center gap-1.5"><Heart className="size-4 text-primary" /> 100% free for mothers</li>
              </ul>
            </Reveal>

            <Reveal delay={100} className="relative">
              <div className="relative aspect-[4/5] sm:aspect-square w-full max-w-md mx-auto">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/20 via-marigold/20 to-sage/20 blur-2xl" aria-hidden />
                <div className="absolute inset-4 rounded-[2rem] overflow-hidden card-warm">
                  <img
                    src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=900&q=70&auto=format&fit=crop"
                    alt="Mother and baby"
                    loading="eager"
                    decoding="async"
                    className="size-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -left-2 sm:-left-4 card-warm p-3 flex items-center gap-3 max-w-[80%]">
                  <div className="size-9 rounded-full bg-sage/20 text-sage grid place-items-center"><MessageCircle className="size-4" /></div>
                  <div>
                    <p className="text-xs font-medium">Digital Midwife</p>
                    <p className="text-[11px] text-muted-foreground">Answered 2,400+ questions today</p>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 card-warm p-3 hidden sm:flex items-center gap-3">
                  <div className="size-9 rounded-full bg-marigold/20 text-marigold grid place-items-center"><ShieldCheck className="size-4" /></div>
                  <div>
                    <p className="text-xs font-medium">Clinician verified</p>
                    <p className="text-[11px] text-muted-foreground">Alerts you can trust</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* PILLARS */}
        <section className="bg-gradient-to-b from-transparent to-secondary/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
            <Reveal>
              <h2 className="font-display text-3xl sm:text-4xl text-center text-balance max-w-2xl mx-auto">
                Built around what mothers actually need
              </h2>
              <p className="text-center text-muted-foreground mt-3 max-w-xl mx-auto text-sm sm:text-base">
                Three gentle pillars working together to support you from pregnancy through your child's early years.
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              {[
                { Icon: Users, color: "primary", title: "Cohort community", body: "A feed filtered to your stage — no toddler chaos when you're pregnant.", to: "/feed" },
                { Icon: Sparkles, color: "sage", title: "Digital Midwife", body: "AI grounded in trusted clinical guidance. Routes you to care in emergencies.", to: "/midwife" },
                { Icon: ShoppingBag, color: "marigold", title: "Baby marketplace", body: "Buy, sell, donate — sorted by your baby's age cohort.", to: "/marketplace" },
                { Icon: Stethoscope, color: "primary", title: "Verified alerts", body: "Vaccine days, free camps, weather advisories — never general medical noise.", to: "/medical" },
                { Icon: ShieldCheck, color: "sage", title: "Trust verified", body: "Multi-step verification keeps this space women-only and safe.", to: "/onboarding" },
                { Icon: Heart, color: "marigold", title: "Voice-first", body: "Dictate in Bangla or Banglish — no typing barrier.", to: "/feed" },
              ].map(({ Icon, color, title, body, to }, i) => (
                <Reveal key={title} delay={i * 60}>
                  <Link to={to} className="block card-warm p-5 h-full hover:-translate-y-0.5 transition">
                    <div className={`size-10 rounded-xl grid place-items-center bg-${color}/15 text-${color === "primary" ? "primary" : color}`}>
                      <Icon className="size-5" />
                    </div>
                    <h3 className="font-display text-xl mt-3">{title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{body}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
          <Reveal className="card-warm p-6 sm:p-10 text-center">
            <h2 className="font-display text-2xl sm:text-3xl">Privacy is the first promise.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mt-3 text-sm sm:text-base">
              Posts, chats, and uploads are stripped of personal information before they ever touch our analytics. The AI never diagnoses — it informs and routes you to real clinicians.
            </p>
            <div className="mt-5">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/onboarding">Join Momota <ArrowRight className="size-4 ml-1" /></Link>
              </Button>
            </div>
          </Reveal>
        </section>

        <footer className="border-t border-border bg-white/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-muted-foreground">
            <p>© 2026 Momota. Made with care in Bangladesh.</p>
            <p>Emergency helpline: <span className="text-foreground font-medium">16263</span></p>
          </div>
        </footer>
      </main>
      <BottomNav />
    </div>
  );
}
