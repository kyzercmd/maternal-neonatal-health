import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { listingsStore, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Phone, Star, ShieldCheck, MessageCircle, Tag, Calendar } from "lucide-react";
import { categories } from "@/lib/seed";
import { SmartImg } from "@/components/common/SmartImg";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/marketplace/$id")({
  head: () => ({ meta: [{ title: `Listing — Momota` }] }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const [listings] = useStore(listingsStore);
  const listing = listings.find((l) => l.id === id);
  const [activeImg, setActiveImg] = React.useState(0);
  const t = useT();

  if (!listing) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <p className="text-muted-foreground">{t("listingUnavailable")}</p>
        <Button asChild className="mt-4 rounded-full"><Link to="/marketplace">{t("backToMarket")}</Link></Button>
      </div>
    );
  }

  const cat = categories.find((c) => c.id === listing.category)?.name ?? listing.category;
  const reviews = listing.reviews ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/marketplace" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> {t("back")}</Link>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="card-warm overflow-hidden aspect-square bg-muted">
            <SmartImg src={listing.images[activeImg] ?? listing.images[0]} alt={listing.title} className="size-full object-cover" />
          </div>
          {listing.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {listing.images.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`shrink-0 size-16 rounded-lg overflow-hidden border-2 ${i === activeImg ? "border-primary" : "border-transparent"}`}>
                  <SmartImg src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-secondary text-foreground/70"><Tag className="size-3" /> {cat}</span>
            <h1 className="font-display text-3xl sm:text-4xl mt-2 text-balance">{listing.title}</h1>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-display text-3xl text-primary">{listing.price === 0 ? t("free") : `৳${listing.price.toLocaleString()}`}</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">· {listing.condition}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="size-3" /> {listing.upazila}, {listing.district}</span>
              {listing.postedAgo && <span className="flex items-center gap-1"><Calendar className="size-3" /> {t("posted")} {listing.postedAgo}</span>}
            </div>
          </div>

          {/* Seller card */}
          <div className="card-warm p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("seller")}</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="size-12 rounded-full bg-primary/15 text-primary grid place-items-center font-display text-lg">
                {listing.seller.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-sm truncate">{listing.seller.name}</p>
                  <span className="inline-flex items-center gap-0.5 text-[11px] text-sage"><ShieldCheck className="size-3" /> {t("verified")}</span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="size-3 fill-marigold text-marigold" /> {listing.seller.rating.toFixed(1)} · {listing.seller.reviews} {t("reviews").toLowerCase()}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button asChild className="rounded-full">
                <a href={`tel:${listing.seller.phone}`}><Phone className="size-4 mr-1.5" /> {t("call")}</a>
              </Button>
              <Button asChild variant="outline" className="rounded-full bg-white">
                <a href={`sms:${listing.seller.phone}`}><MessageCircle className="size-4 mr-1.5" /> {t("message")}</a>
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">{t("safetyNote")}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="card-warm p-5">
        <h2 className="font-display text-xl">{t("description")}</h2>
        <p className="text-sm text-foreground/80 mt-2 whitespace-pre-line">{listing.description}</p>

        <div className="grid sm:grid-cols-3 gap-3 mt-5 text-xs">
          <Spec label={t("condition")} value={listing.condition} />
          <Spec label={t("category")} value={cat} />
          <Spec label={t("location")} value={`${listing.upazila}, ${listing.district}`} />
        </div>
      </section>

      {/* Reviews */}
      <section className="card-warm p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">{t("reviews")} ({reviews.length})</h2>
          <span className="text-sm flex items-center gap-1 text-muted-foreground">
            <Star className="size-4 fill-marigold text-marigold" /> {listing.seller.rating.toFixed(1)} {t("averageRating")}
          </span>
        </div>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-3">{t("noReviews")}</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="border-t border-border pt-4 first:border-0 first:pt-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{r.author}</p>
                  <div className="flex items-center gap-0.5 text-marigold">
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="size-3.5 fill-current" />)}
                  </div>
                </div>
                <p className="text-sm text-foreground/80 mt-1">{r.text}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{r.timeAgo} ago</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/40 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium capitalize mt-0.5">{value}</p>
    </div>
  );
}
