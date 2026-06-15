import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { Reveal } from "@/components/common/Reveal";
import { categories } from "@/lib/seed";
import { listingsStore, useStore } from "@/lib/store";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Plus, ChevronLeft, ChevronRight, Sparkles, Construction } from "lucide-react";
import { SmartImg } from "@/components/common/SmartImg";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/marketplace/")({
  head: () => ({ meta: [{ title: "Marketplace — Momota" }] }),
  component: Marketplace,
});

const banners = [
  { title: "Donation drive — give baby books a new home", color: "from-primary/30 to-marigold/30", cta: "See donations", to: "/marketplace", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=70&auto=format&fit=crop" },
  { title: "Featured: organic cotton onesies — 20% off", color: "from-sage/30 to-primary/20", cta: "Shop now", to: "/marketplace", image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=1200&q=70&auto=format&fit=crop" },
  { title: "Free pediatric camp this Friday in Dhaka", color: "from-marigold/30 to-sage/30", cta: "Learn more", to: "/medical", image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1200&q=70&auto=format&fit=crop" },
];

const PAGE_SIZE = 12;

function ComingSoonBanner() {
  const t = useT();
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/15 via-lavender/15 to-sky/15 p-4 sm:p-5 flex items-start gap-3 shadow-sm">
      <div className="absolute inset-0 bg-gradient-mesh opacity-50 pointer-events-none" />
      <span className="relative size-10 rounded-lg bg-gradient-primary text-primary-foreground grid place-items-center shrink-0 shadow-md">
        <Construction className="size-5" />
      </span>
      <div className="relative flex-1 min-w-0">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-primary font-semibold mb-0.5">
          <Sparkles className="size-3" /> Coming soon
        </div>
        <h2 className="font-display text-base sm:text-lg leading-tight">{t("marketSoonTitle")}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
          {t("marketSoonBody")} Preview the experience below.
        </p>
      </div>
    </div>
  );
}

function Marketplace() {
  const { user } = useAuth();
  const t = useT();
  const [listings] = useStore(listingsStore);
  const [query, setQuery] = React.useState("");
  const [cat, setCat] = React.useState<string>("");
  const [page, setPage] = React.useState(1);

  const filtered = listings.filter((l) =>
    (!cat || l.category === cat) &&
    (!query || (l.title + l.description).toLowerCase().includes(query.toLowerCase()))
  );

  React.useEffect(() => { setPage(1); }, [query, cat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <ComingSoonBanner />

      <Reveal>
        <Carousel opts={{ loop: true }} className="w-full">
          <CarouselContent>
            {banners.map((b, i) => (
              <CarouselItem key={i}>
                <div className={`relative rounded-2xl overflow-hidden border border-border min-h-[260px] sm:min-h-[360px] flex items-end bg-gradient-to-br ${b.color}`}>
                  <img src={b.image} alt="" loading={i === 0 ? "eager" : "lazy"} decoding="async" className="absolute inset-0 size-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
                  <div className="relative p-6 sm:p-10 max-w-2xl text-white">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/85">{t("featured")}</p>
                    <h2 className="font-display text-2xl sm:text-4xl mt-2 text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">{b.title}</h2>
                    <Button asChild className="mt-5 rounded-lg bg-white text-foreground hover:bg-white/90"><Link to={b.to}>{b.cta}</Link></Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </Reveal>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1">
          <SearchBar value={query} onChange={setQuery} placeholder={t("searchMarket")} lang={user.language === "bn" ? "bn-BD" : "en-US"} />
        </div>
        <Button asChild className="rounded-lg h-11 sm:h-12 px-5 bg-gradient-primary text-primary-foreground">
          <Link to="/marketplace/new"><Plus className="size-4 mr-1" /> {t("listItem")}</Link>
        </Button>
      </div>

      <Reveal>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-3 px-3 pb-1">
          <button onClick={() => setCat("")} className={`shrink-0 px-3 h-9 rounded-lg text-xs border transition ${!cat ? "bg-gradient-primary text-primary-foreground border-primary" : "bg-white border-border"}`}>{t("all")}</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} className={`shrink-0 px-3 h-9 rounded-lg text-xs border transition ${cat === c.id ? "bg-gradient-primary text-primary-foreground border-primary" : "bg-white border-border"}`}>
              {c.name}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {pageItems.map((l, i) => (
          <Reveal key={l.id} delay={i * 30}>
            <Link to="/marketplace/$id" params={{ id: l.id }} className="card-warm overflow-hidden h-full flex flex-col hover:-translate-y-0.5 transition block">
              <div className="aspect-square bg-muted overflow-hidden">
                <SmartImg src={l.images[0]} alt={l.title} loading="lazy" decoding="async" className="size-full object-cover" />
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <h3 className="text-sm font-medium line-clamp-2">{l.title}</h3>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{l.upazila}, {l.district}</div>
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="font-display text-base text-gradient-primary">{l.price === 0 ? t("free") : `৳${l.price.toLocaleString()}`}</span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-0.5"><Star className="size-3 fill-marigold text-marigold" />{l.seller.rating}</span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">{t("noResults")}</p>}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1 pt-2" aria-label="Pagination">
          <Button variant="outline" size="sm" className="rounded-lg bg-white" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1;
            if (totalPages > 7 && n !== 1 && n !== totalPages && Math.abs(n - page) > 1) {
              if (n === 2 || n === totalPages - 1) return <span key={n} className="px-1 text-muted-foreground">…</span>;
              return null;
            }
            return (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-9 min-w-9 px-3 rounded-lg text-sm border transition ${n === page ? "bg-gradient-primary text-primary-foreground border-primary" : "bg-white border-border hover:bg-secondary"}`}
                aria-current={n === page ? "page" : undefined}
              >
                {n}
              </button>
            );
          })}
          <Button variant="outline" size="sm" className="rounded-lg bg-white" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </nav>
      )}
    </div>
  );
}
