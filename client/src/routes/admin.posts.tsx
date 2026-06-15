import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { postsStore, reportsStore, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Trash2, Flag, MessageCircle, Heart, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Post } from "@/lib/types";

export const Route = createFileRoute("/admin/posts")({
  component: AdminPosts,
});

function AdminPosts() {
  const [posts, setPosts] = useStore(postsStore);
  const [reports] = useStore(reportsStore);
  const [open, setOpen] = React.useState<Post | null>(null);
  const [q, setQ] = React.useState("");

  const term = q.trim().toLowerCase();
  const filtered = !term
    ? posts
    : posts.filter(
        (p) =>
          p.text?.toLowerCase().includes(term) ||
          p.author?.name?.toLowerCase().includes(term) ||
          p.author?.district?.toLowerCase().includes(term),
      );
  const sorted = [...filtered].sort((a, b) => (reports[b.id] || 0) - (reports[a.id] || 0));

  const toggleHidden = (id: string) =>
    setPosts((all) =>
      all.map((x) => (x.id === id ? ({ ...x, hidden: !(x as any).hidden } as any) : x)),
    );
  const remove = (id: string) => setPosts((all) => all.filter((x) => x.id !== id));

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl">Community posts</h1>
          <p className="text-sm text-muted-foreground">
            {posts.length} posts · showing {sorted.length} · sorted by reports
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts, authors…"
            className="pl-9 h-10"
          />
        </div>
      </header>
      <div className="space-y-3">
        {sorted.map((p) => {
          const count = reports[p.id] || 0;
          const hidden = (p as any).hidden;
          return (
            <article key={p.id} className="card-warm p-4 flex gap-4 items-start">
              {p.images?.[0] && (
                <img
                  src={p.images[0]}
                  alt=""
                  className="size-16 rounded-lg object-cover border border-border shrink-0 hidden sm:block"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <span className="font-medium text-foreground">{p.author.name}</span>
                  <span>·</span>
                  <span>{p.author.district}</span>
                  <span>·</span>
                  <span>{p.timeAgo}</span>
                  {count > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-destructive/10 text-destructive">
                      <Flag className="size-3" /> {count} report{count > 1 ? "s" : ""}
                    </span>
                  )}
                  {hidden && (
                    <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      hidden
                    </span>
                  )}
                </div>
                <p className="text-sm mt-2 whitespace-pre-line line-clamp-2">{p.text}</p>
                <div className="text-[11px] text-muted-foreground mt-2 inline-flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="size-3" /> {p.likes}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="size-3" /> {p.comments.length}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => setOpen(p)}
                >
                  <Eye className="size-3.5 mr-1" /> View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => toggleHidden(p.id)}
                >
                  {hidden ? (
                    <Eye className="size-3.5 mr-1" />
                  ) : (
                    <EyeOff className="size-3.5 mr-1" />
                  )}
                  {hidden ? "Show" : "Hide"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg text-destructive border-destructive/30"
                  onClick={() => {
                    if (confirm("Delete this post?")) remove(p.id);
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </article>
          );
        })}
        {posts.length === 0 && <p className="text-sm text-muted-foreground">No posts.</p>}
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-lg">{open.author.name}</DialogTitle>
                <DialogDescription>
                  {open.author.district} · {open.cohort} · {open.timeAgo}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm whitespace-pre-line leading-relaxed">{open.text}</p>
                {open.images?.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {open.images.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt=""
                        className="w-full aspect-square object-cover rounded-lg border border-border"
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="size-3" /> {open.likes}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="size-3" /> {open.comments.length}
                  </span>
                  {(reports[open.id] || 0) > 0 && (
                    <span className="inline-flex items-center gap-1 text-destructive">
                      <Flag className="size-3" /> {reports[open.id]} reports
                    </span>
                  )}
                </div>
                {open.comments.length > 0 && (
                  <div className="border-t border-border pt-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                      Comments
                    </p>
                    <ul className="space-y-2">
                      {open.comments.map((c) => (
                        <li
                          key={c.id}
                          className="rounded-lg border border-border p-2.5 bg-white text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{c.author.name}</span>
                            <span className="text-muted-foreground">{c.timeAgo}</span>
                          </div>
                          <p className="mt-1 text-muted-foreground leading-relaxed">{c.text}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <DialogFooter className="flex-row justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    toggleHidden(open.id);
                    setOpen(null);
                  }}
                >
                  {(open as any).hidden ? (
                    <Eye className="size-4 mr-1.5" />
                  ) : (
                    <EyeOff className="size-4 mr-1.5" />
                  )}
                  {(open as any).hidden ? "Restore post" : "Hide post"}
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive border-destructive/40"
                  onClick={() => {
                    if (confirm("Delete this post?")) {
                      remove(open.id);
                      setOpen(null);
                    }
                  }}
                >
                  <Trash2 className="size-4 mr-1.5" /> Delete post
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
