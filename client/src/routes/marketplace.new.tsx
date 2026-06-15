import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import * as React from "react";

import { categories, districts } from "@/lib/seed";
import { listingsStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MediaUploader, type UploadedMedia } from "@/components/common/MediaUploader";
import { ArrowLeft, Check } from "lucide-react";
import type { Listing } from "@/lib/types";

export const Route = createFileRoute("/marketplace/new")({
  head: () => ({ meta: [{ title: "List an item — Momota" }] }),
  component: NewListing,
});

function NewListing() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [media, setMedia] = React.useState<UploadedMedia[]>([]);
  const [form, setForm] = React.useState({
    title: "", category: "", price: "", condition: "like-new",
    district: user.district || "", upazila: user.upazila || "",
    description: "",
    contactName: user.mother.name || "",
    contactPhone: user.phone || "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const images = media.filter((m) => m.type === "image").map((m) => m.url);
    const listing: Listing = {
      id: `u-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      price: Number(form.price) || 0,
      condition: form.condition as Listing["condition"],
      district: form.district,
      upazila: form.upazila,
      description: form.description.trim(),
      images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=70&auto=format&fit=crop"],
      seller: { name: form.contactName, phone: form.contactPhone, rating: 5.0, reviews: 0 },
      postedAgo: "just now",
      reviews: [],
    };
    listingsStore.set((all) => [listing, ...all]);
    nav({ to: "/marketplace/$id", params: { id: listing.id } });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link to="/marketplace" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to marketplace</Link>
      <h1 className="font-display text-3xl">List an item</h1>

      <form className="card-warm p-5 space-y-4" onSubmit={submit}>
        <div className="space-y-1.5"><Label>Photos & video</Label><MediaUploader value={media} onChange={setMedia} max={8} /></div>
        <div className="space-y-1.5"><Label>Title</Label><Input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Lightly used baby stroller" /></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Category</Label>
            <select required value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full h-10 rounded-md border border-input bg-white px-3 text-sm">
              <option value="">Select…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5"><Label>Price (৳, 0 = free)</Label><Input required type="number" min={0} value={form.price} onChange={(e) => set("price", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Condition</Label>
            <select value={form.condition} onChange={(e) => set("condition", e.target.value)} className="w-full h-10 rounded-md border border-input bg-white px-3 text-sm">
              {["new","like-new","good","fair"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5"><Label>District</Label>
            <select required value={form.district} onChange={(e) => set("district", e.target.value)} className="w-full h-10 rounded-md border border-input bg-white px-3 text-sm">
              <option value="">Select…</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Upazila / Thana</Label><Input required value={form.upazila} onChange={(e) => set("upazila", e.target.value)} /></div>
        </div>
        <div className="space-y-1.5"><Label>Description</Label><Textarea required rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe condition, age range, why you're selling…" className="bg-white" /></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Your name (shown to buyers)</Label><Input required value={form.contactName} onChange={(e) => set("contactName", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Contact phone</Label><Input required inputMode="tel" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} /></div>
        </div>
        <Button type="submit" className="w-full rounded-full h-11"><Check className="size-4 mr-1" /> Publish listing</Button>
      </form>
    </div>
  );
}
