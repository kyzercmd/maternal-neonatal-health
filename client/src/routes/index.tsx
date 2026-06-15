import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Reveal } from "@/components/common/Reveal";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ShieldCheck,
  Sparkles,
  Users,
  ShoppingBag,
  Stethoscope,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import landingImage from "@/Z.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "মমতা — বাংলাদেশের মায়েদের জন্য একটি উষ্ণ কমিউনিটি" },
      {
        name: "description",
        content:
          "ভেরিফাইড, শুধুমাত্র নারীদের জন্য: বয়সভিত্তিক কমিউনিটি, এআই ডিজিটাল মিডওয়াইফ, বেবি মার্কেটপ্লেস এবং নির্ভরযোগ্য মেডিকেল অ্যালার্ট।",
      },
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
                <Heart className="size-3.5 fill-current" /> মায়েদের জন্য, মায়েদের দ্বারা
              </span>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl mt-4 leading-[1.05] text-balance">
                এই সুন্দর যাত্রায় আপনি কখনো একা নন।
              </h1>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-prose">
                মমতা হলো সারা বাংলাদেশের মায়েদের জন্য নিরাপদ, শুধুমাত্র নারীদের একটি প্ল্যাটফর্ম —
                যেখানে আছে ভরসাপূর্ণ কমিউনিটি, যত্নশীল এআই মিডওয়াইফ এবং নির্ভরযোগ্য মেডিকেল
                অ্যালার্ট।
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full h-12 px-6 text-base shadow-md shadow-primary/20"
                >
                  <Link to="/onboarding">
                    শুরু করুন <ArrowRight className="size-4 ml-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full h-12 px-6 text-base bg-white"
                >
                  <Link to="/medical">আজকের অ্যালার্ট দেখুন</Link>
                </Button>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-sage" /> শুধুমাত্র ভেরিফাইড নারী
                </li>
                <li className="flex items-center gap-1.5">
                  <Sparkles className="size-4 text-marigold" /> বাংলা ও ইংরেজি
                </li>
                <li className="flex items-center gap-1.5">
                  <Heart className="size-4 text-primary" /> মায়েদের জন্য ১০০% ফ্রি
                </li>
              </ul>
            </Reveal>

            <Reveal delay={100} className="relative">
              <div className="relative aspect-[4/5] sm:aspect-square w-full max-w-md mx-auto">
                <div
                  className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/20 via-marigold/20 to-sage/20 blur-2xl"
                  aria-hidden
                />
                <div className="absolute inset-4 rounded-[2rem] overflow-hidden card-warm">
                  <img
                    src={landingImage}
                    alt="মা ও শিশু"
                    loading="eager"
                    decoding="async"
                    className="size-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -left-2 sm:-left-4 card-warm p-3 flex items-center gap-3 max-w-[80%]">
                  <div className="size-9 rounded-full bg-sage/20 text-sage grid place-items-center">
                    <MessageCircle className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">ডিজিটাল মিডওয়াইফ</p>
                    <p className="text-[11px] text-muted-foreground">
                      আজ ২,৪০০+ প্রশ্নের উত্তর দিয়েছেন
                    </p>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 card-warm p-3 hidden sm:flex items-center gap-3">
                  <div className="size-9 rounded-full bg-marigold/20 text-marigold grid place-items-center">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">ডাক্তার দ্বারা পরীক্ষিত</p>
                    <p className="text-[11px] text-muted-foreground">নির্ভরযোগ্য স্বাস্থ্য তথ্য</p>
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
                মায়েদের আসল প্রয়োজনের কথা ভেবেই তৈরি
              </h2>
              <p className="text-center text-muted-foreground mt-3 max-w-xl mx-auto text-sm sm:text-base">
                গর্ভাবস্থা থেকে শুরু করে আপনার সন্তানের বেড়ে ওঠার প্রথম কয়েক বছর আপনাকে সাপোর্ট
                দেওয়ার জন্য তিনটি মূল ভিত্তি।
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              {[
                {
                  Icon: Users,
                  color: "primary",
                  title: "বয়সভিত্তিক কমিউনিটি",
                  body: "শুধুমাত্র আপনার অবস্থার সাথে মেলে এমন ফিড — আপনি গর্ভবতী হলে বড় বাচ্চাদের নিয়ে কোনো পোস্ট আসবে না।",
                  to: "/feed",
                },
                {
                  Icon: Sparkles,
                  color: "sage",
                  title: "ডিজিটাল মিডওয়াইফ",
                  body: "চিকিৎসকদের নির্দেশিকার ওপর ভিত্তি করে তৈরি এআই। জরুরি অবস্থায় আপনাকে সঠিক চিকিৎসকের কাছে পাঠায়।",
                  to: "/midwife",
                },
                {
                  Icon: ShoppingBag,
                  color: "marigold",
                  title: "বেবি মার্কেটপ্লেস",
                  body: "বাচ্চাদের জিনিসপত্র কিনুন, বিক্রি করুন বা দান করুন — শিশুর বয়স অনুযায়ী সাজানো।",
                  to: "/marketplace",
                },
                {
                  Icon: Stethoscope,
                  color: "primary",
                  title: "ভেরিফাইড অ্যালার্ট",
                  body: "টিকার দিন, ফ্রি ক্যাম্প, আবহাওয়া সতর্কতা — সাধারণ স্বাস্থ্য খবরের ভিড় নেই।",
                  to: "/medical",
                },
                {
                  Icon: ShieldCheck,
                  color: "sage",
                  title: "নিরাপত্তা নিশ্চিত",
                  body: "বহু-ধাপের ভেরিফিকেশন প্রক্রিয়া এই প্ল্যাটফর্মটিকে নারী-বান্ধব ও নিরাপদ রাখে।",
                  to: "/onboarding",
                },
                {
                  Icon: Heart,
                  color: "marigold",
                  title: "ভয়েস ফার্স্ট",
                  body: "বাংলা বা বাংলিশে কথা বলে লিখুন — টাইপ করার ঝামেলা নেই।",
                  to: "/feed",
                },
              ].map(({ Icon, color, title, body, to }, i) => (
                <Reveal key={title} delay={i * 60}>
                  <Link
                    to={to}
                    className="block card-warm p-5 h-full hover:-translate-y-0.5 transition"
                  >
                    <div
                      className={`size-10 rounded-xl grid place-items-center bg-${color}/15 text-${color === "primary" ? "primary" : color}`}
                    >
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
            <h2 className="font-display text-2xl sm:text-3xl">গোপনীয়তাই আমাদের প্রথম অঙ্গীকার।</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mt-3 text-sm sm:text-base">
              যেকোনো পোস্ট, মেসেজ বা ছবি আমাদের অ্যানালিটিক্সে যাওয়ার আগেই সেখান থেকে ব্যক্তিগত তথ্য
              মুছে ফেলা হয়। এআই কখনো সরাসরি রোগ নির্ণয় করে না — এটি শুধু তথ্য দেয় এবং আপনাকে আসল
              চিকিৎসকের সাথে যুক্ত করে।
            </p>
            <div className="mt-5">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/onboarding">
                  মমতা-এ যোগ দিন <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </section>

        <footer className="border-t border-border bg-white/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-muted-foreground">
            <p>© ২০২৬ মমতা। বাংলাদেশে পরম যত্নে তৈরি।</p>
            <p>
              জরুরি হেল্পলাইন: <span className="text-foreground font-medium">১৬২৬৩</span>
            </p>
          </div>
        </footer>
      </main>
      <BottomNav />
    </div>
  );
}
