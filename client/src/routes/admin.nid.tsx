import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { nidQueueStore, useStore } from "@/lib/store";
import { reviewNid } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, IdCard, Search } from "lucide-react";

export const Route = createFileRoute("/admin/nid")({
  component: AdminNid,
});

function AdminNid() {
  const [queue] = useStore(nidQueueStore);
  const [q, setQ] = React.useState("");
  const term = q.trim().toLowerCase();
  const filtered = !term
    ? queue
    : queue.filter(
        (n) =>
          n.name?.toLowerCase().includes(term) ||
          n.phone?.toLowerCase().includes(term) ||
          (n.district || "").toLowerCase().includes(term) ||
          n.status.toLowerCase().includes(term),
      );

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl">NID verification queue</h1>
          <p className="text-sm text-muted-foreground">
            Approve manually to grant community access. {queue.length} total · showing{" "}
            {filtered.length}.
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, status…"
            className="pl-9 h-10"
          />
        </div>
      </header>

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((n) => (
          <article key={n.id} className="card-warm p-4">
            <div className="flex items-center gap-3">
              <span className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <IdCard className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{n.name}</p>
                <p className="text-xs text-muted-foreground">
                  {n.phone} · {n.district || "—"}
                </p>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-md ${
                  n.status === "pending"
                    ? "bg-marigold/15 text-marigold"
                    : n.status === "approved"
                      ? "bg-sage/15 text-sage"
                      : "bg-destructive/10 text-destructive"
                }`}
              >
                {n.status}
              </span>
            </div>
            <div className="mt-3 rounded-md bg-secondary p-3 text-xs text-muted-foreground">
              File: <span className="text-foreground">{n.fileName}</span>
              <br />
              Submitted: {new Date(n.submittedAt).toLocaleString()}
            </div>
            {n.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="rounded-lg flex-1"
                  onClick={() => reviewNid(n.id, "approved")}
                >
                  <Check className="size-3.5 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg flex-1 text-destructive border-destructive/30"
                  onClick={() => reviewNid(n.id, "rejected")}
                >
                  <X className="size-3.5 mr-1" /> Reject
                </Button>
              </div>
            )}
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="card-warm p-8 text-center text-sm text-muted-foreground sm:col-span-2">
            {queue.length === 0
              ? "No pending submissions. Complete the NID flow in onboarding to populate this queue."
              : `No submissions match "${q}".`}
          </div>
        )}
      </div>
    </div>
  );
}
