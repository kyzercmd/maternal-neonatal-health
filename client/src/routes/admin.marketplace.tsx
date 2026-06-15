import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { listingsStore, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Eye,
  MapPin,
  Phone,
  Star,
  ShieldCheck,
  Tag,
  Calendar,
  Sparkles,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Listing } from "@/lib/types";
import { categories } from "@/lib/seed";

export const Route = createFileRoute("/admin/marketplace")({
  component: AdminMarket,
});

function AdminMarket() {
  const [listings, setListings] = useStore(listingsStore);
  const [open, setOpen] = React.useState<Listing | null>(null);
  const [q, setQ] = React.useState("");

  const term = q.trim().toLowerCase();
  const filtered = !term
    ? listings
    : listings.filter(
        (l) =>
          l.title?.toLowerCase().includes(term) ||
          l.seller?.name?.toLowerCase().includes(term) ||
          l.district?.toLowerCase().includes(term) ||
          l.upazila?.toLowerCase().includes(term) ||
          l.category?.toLowerCase().includes(term),
      );

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl">Marketplace listings</h1>
          <p className="text-sm text-muted-foreground">
            {listings.length} listings · showing {filtered.length}
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, seller, district…"
            className="pl-9 h-10"
          />
        </div>
      </header>
      <div className="card-warm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs text-muted-foreground">
            <tr>
              <th className="text-left p-3">Item</th>
              <th className="text-left p-3 hidden sm:table-cell">Seller</th>
              <th className="text-left p-3 hidden md:table-cell">District</th>
              <th className="text-right p-3">Price</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-t border-border hover:bg-secondary/40 transition">
                <td className="p-3 max-w-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={l.images[0]}
                      alt=""
                      className="size-9 rounded-md object-cover border border-border"
                    />
                    <span className="truncate font-medium">{l.title}</span>
                  </div>
                </td>
                <td className="p-3 hidden sm:table-cell">{l.seller.name}</td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">
                  {l.upazila}, {l.district}
                </td>
                <td className="p-3 text-right font-display text-gradient-primary">
                  ৳{l.price.toLocaleString()}
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg mr-1"
                    onClick={() => setOpen(l)}
                  >
                    <Eye className="size-3.5 mr-1" /> View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg text-destructive border-destructive/30"
                    onClick={() => {
                      if (confirm(`Take down "${l.title}"?`))
                        setListings((all) => all.filter((x) => x.id !== l.id));
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                  {listings.length === 0 ? "No listings." : `No listings match "${q}".`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl pr-6 leading-tight">
                  {open.title}
                </DialogTitle>
                <DialogDescription>
                  Full listing details — review before moderation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid sm:grid-cols-2 gap-4 py-2">
                <div className="space-y-2">
                  <img
                    src={open.images[0]}
                    alt=""
                    className="w-full aspect-square object-cover rounded-lg border border-border"
                  />
                  {open.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-1.5">
                      {open.images.slice(1, 5).map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt=""
                          className="aspect-square object-cover rounded border border-border"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl text-gradient-primary">
                      {open.price === 0 ? "Free" : `৳${open.price.toLocaleString()}`}
                    </span>
                    {open.featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-gradient-primary text-primary-foreground font-semibold">
                        <Sparkles className="size-3" /> Featured
                      </span>
                    )}
                  </div>
                  <Field
                    icon={Tag}
                    label="Category"
                    value={categories.find((c) => c.id === open.category)?.name ?? open.category}
                  />
                  <Field icon={ShieldCheck} label="Condition" value={open.condition} />
                  <Field
                    icon={MapPin}
                    label="Location"
                    value={`${open.upazila}, ${open.district}`}
                  />
                  <Field icon={Calendar} label="Posted" value={open.postedAgo ?? "—"} />
                  <div className="rounded-lg border border-border p-3 bg-secondary/40">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Seller
                    </p>
                    <p className="font-medium">{open.seller.name}</p>
                    <p className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                      <Phone className="size-3" /> {open.seller.phone}
                    </p>
                    <p className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                      <Star className="size-3 fill-marigold text-marigold" /> {open.seller.rating} ·{" "}
                      {open.seller.reviews} reviews
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm whitespace-pre-line leading-relaxed">{open.description}</p>
              </div>
              {open.reviews && open.reviews.length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    Reviews
                  </p>
                  <ul className="space-y-2">
                    {open.reviews.map((r) => (
                      <li
                        key={r.id}
                        className="text-xs rounded-lg border border-border p-2.5 bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{r.author}</span>
                          <span className="inline-flex items-center gap-0.5 text-marigold">
                            <Star className="size-3 fill-marigold" />
                            {r.rating}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1">{r.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
                <Button variant="outline" onClick={() => setOpen(null)}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive border-destructive/40"
                  onClick={() => {
                    if (confirm(`Take down "${open.title}"?`)) {
                      setListings((all) => all.filter((x) => x.id !== open.id));
                      setOpen(null);
                    }
                  }}
                >
                  <Trash2 className="size-4 mr-1.5" /> Take down listing
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">
          {label}
        </p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}
