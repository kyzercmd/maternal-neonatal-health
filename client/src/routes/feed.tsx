import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RequireTier } from "@/components/layout/RequireTier";
import { SearchBar } from "@/components/common/SearchBar";
import { Reveal } from "@/components/common/Reveal";
import { Avatar } from "@/components/common/Avatar";
import { MediaUploader, type UploadedMedia } from "@/components/common/MediaUploader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { postsStore, useStore } from "@/lib/store";
import type { Post, Comment } from "@/lib/types";
import { Heart, MessageCircle, Flag, Send, MapPin } from "lucide-react";
import { useAuth, getCohort } from "@/lib/auth";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/feed")({
  head: () => ({ meta: [{ title: "Community — Momota" }] }),
  component: () => (<AppShell><RequireTier level={3}><FeedPage /></RequireTier></AppShell>),
});

function FeedPage() {
  const { user } = useAuth();
  const t = useT();
  const cohort = getCohort(user.child);
  const [query, setQuery] = React.useState("");
  const [posts, setPosts] = useStore(postsStore);
  const [draft, setDraft] = React.useState("");
  const [media, setMedia] = React.useState<UploadedMedia[]>([]);

  const filtered = posts.filter((p) =>
    (cohort === "unknown" || p.cohort === cohort) &&
    (!query || p.text.toLowerCase().includes(query.toLowerCase()))
  );

  const publish = () => {
    if (!draft.trim()) return;
    const newPost: Post = {
      id: crypto.randomUUID(),
      author: { name: user.mother.name || "You", district: user.district || "Bangladesh", avatarHue: 320 },
      cohort: cohort === "unknown" ? "0-6m" : cohort,
      timeAgo: "now",
      text: draft.trim(),
      images: media.filter((m) => m.type === "image").map((m) => m.url),
      likes: 0, liked: false, comments: [],
    };
    setPosts([newPost, ...posts]);
    setDraft(""); setMedia([]);
  };

  const updatePost = (np: Post) => setPosts((all) => all.map((x) => x.id === np.id ? np : x));

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div className="space-y-4 max-w-2xl mx-auto w-full">
        <SearchBar value={query} onChange={setQuery} placeholder={t("searchCommunity")} lang={user.language === "bn" ? "bn-BD" : "en-US"} />

        <Reveal className="card-warm p-4">
          <div className="flex gap-3">
            <Avatar name={user.mother.name || "You"} hue={320} size={40} src={user.avatar} />
            <div className="flex-1 min-w-0">
              <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t("postPlaceholder")} rows={2} className="bg-white" />
              <div className="mt-3"><MediaUploader value={media} onChange={setMedia} compact label={t("addPhotosVideos")} maxLabel={t("upToFiles").replace("{n}", "6")} /></div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">{t("postingTo")} <strong className="text-foreground">{cohort === "unknown" ? t("allCohort") : cohort}</strong> {t("cohortLabel")}</span>
                <Button size="sm" onClick={publish} disabled={!draft.trim()} className="rounded-lg">
                  <Send className="size-3.5 mr-1" /> {t("post")}
                </Button>

              </div>
            </div>
          </div>
        </Reveal>

        {filtered.map((p, i) => (
          <Reveal key={p.id} delay={i * 40}><PostCard post={p} onChange={updatePost} authorName={user.mother.name || "You"} /></Reveal>
        ))}
        {filtered.length === 0 && <div className="text-center text-sm text-muted-foreground py-10">No posts in this cohort yet — be the first to share 🌷</div>}
      </div>

      <aside className="hidden lg:block space-y-4">
        <div className="card-warm p-4">
          <h3 className="font-display text-lg">{t("yourCohort")}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t("yourCohortBody")}</p>
          <span className="inline-block mt-3 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/15">{cohort}</span>
        </div>
        <div className="card-warm p-4">
          <h3 className="font-display text-lg">{t("guidelines")}</h3>
          <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc pl-4">
            <li>{t("guideline1")}</li>
            <li>{t("guideline2")}</li>
            <li>{t("guideline3")}</li>
          </ul>
        </div>
      </aside>

    </div>
  );
}

function PostCard({ post, onChange, authorName }: { post: Post; onChange: (p: Post) => void; authorName: string }) {
  const t = useT();
  const [comment, setComment] = React.useState("");
  const toggleLike = () => onChange({ ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) });

  const addComment = () => {
    if (!comment.trim()) return;
    const c: Comment = {
      id: crypto.randomUUID(),
      author: { name: authorName, avatarHue: 320 },
      text: comment.trim(),
      timeAgo: "now",
      likes: 0, liked: false,
    };
    onChange({ ...post, comments: [...post.comments, c] });
    setComment("");
  };

  const toggleCommentLike = (id: string) => {
    onChange({
      ...post,
      comments: post.comments.map((c) =>
        c.id === id ? { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) } : c
      ),
    });
  };

  return (
    <article className="card-warm p-4">
      <header className="flex items-center gap-3">
        <Avatar name={post.author.name} hue={post.author.avatarHue} size={40} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{post.author.name}</p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1"><MapPin className="size-3" />{post.author.district} · {post.timeAgo}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild><button className="text-muted-foreground hover:text-foreground p-1" aria-label="Report"><Flag className="size-4" /></button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Report this post</DialogTitle></DialogHeader>
            <div className="space-y-2 text-sm">
              {["Spam","Harassment","Medical misinformation","Inappropriate content","Other"].map((r) => (
                <label key={r} className="flex items-center gap-2"><input type="radio" name="reason" /> {r}</label>
              ))}
            </div>
            <DialogFooter><Button>Submit report</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>
      <p className="text-sm mt-3 whitespace-pre-line">{post.text}</p>
      {post.images.length > 0 && (
        <div className="mt-3 rounded-xl overflow-hidden">
          <img src={post.images[0]} alt="" loading="lazy" decoding="async" className="w-full max-h-[420px] object-cover" />
        </div>
      )}
      <footer className="mt-3 pt-3 border-t border-border flex items-center gap-1 text-sm text-muted-foreground">
        <button onClick={toggleLike} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-secondary transition ${post.liked ? "text-primary" : ""}`}>
          <Heart className={`size-4 ${post.liked ? "fill-current" : ""}`} /> {post.likes}
        </button>
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-secondary transition"><MessageCircle className="size-4" /> {post.comments.length}</button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <SheetHeader><SheetTitle>{t("comments")} ({post.comments.length})</SheetTitle></SheetHeader>
            <ul className="py-4 space-y-4">
              {post.comments.length === 0 && (
                <li className="text-sm text-muted-foreground text-center py-4">No comments yet. Be gentle in your reply 🌷</li>
              )}
              {post.comments.map((c) => (
                <li key={c.id} className="flex gap-3">
                  <Avatar name={c.author.name} hue={c.author.avatarHue} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="rounded-2xl bg-secondary/60 px-3 py-2">
                      <p className="text-xs font-medium">{c.author.name}</p>
                      <p className="text-sm mt-0.5 whitespace-pre-line">{c.text}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 px-2 text-[11px] text-muted-foreground">
                      <span>{c.timeAgo}</span>
                      <button onClick={() => toggleCommentLike(c.id)} className={`inline-flex items-center gap-1 hover:text-foreground transition ${c.liked ? "text-primary" : ""}`}>
                        <Heart className={`size-3 ${c.liked ? "fill-current" : ""}`} /> {c.likes > 0 ? c.likes : ""} Like
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 sticky bottom-0 bg-background pt-2">
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={1} placeholder={t("writeComment")} className="bg-white" />
              <Button onClick={addComment} disabled={!comment.trim()}><Send className="size-4" /></Button>
            </div>
          </SheetContent>
        </Sheet>
        
      </footer>
    </article>
  );
}
