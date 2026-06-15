import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { getRegistered, setRegisteredField, type RegisteredUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ban, ShieldCheck, Eye, Phone, MapPin, Calendar, Baby, Heart, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function statusOf(u: RegisteredUser): { label: string; cls: string } {
  if (u.banned) return { label: "Banned", cls: "bg-destructive/10 text-destructive" };
  if (u.tier >= 2) return { label: "Verified", cls: "bg-sage/15 text-sage" };
  return { label: "Pending review", cls: "bg-marigold/15 text-marigold" };
}

function AdminUsers() {
  const [users, setUsers] = React.useState<RegisteredUser[]>([]);
  const [open, setOpen] = React.useState<RegisteredUser | null>(null);
  const [q, setQ] = React.useState("");

  const reload = React.useCallback(() => setUsers(Object.values(getRegistered())), []);
  React.useEffect(reload, [reload]);

  const toggleBan = (u: RegisteredUser) => {
    setRegisteredField(u.phone, { banned: !u.banned });
    reload();
    if (open?.phone === u.phone) setOpen({ ...u, banned: !u.banned });
  };

  const term = q.trim().toLowerCase();
  const filtered = users.filter((u) => !term
    || u.name?.toLowerCase().includes(term)
    || u.phone?.toLowerCase().includes(term)
    || (u.district || "").toLowerCase().includes(term)
    || (u.upazila || "").toLowerCase().includes(term));

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl">Users</h1>
          <p className="text-sm text-muted-foreground">{users.length} registered mothers · showing {filtered.length}</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, district…" className="pl-9 h-10" />
        </div>
      </header>
      <div className="card-warm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs text-muted-foreground">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3 hidden sm:table-cell">Phone</th>
              <th className="text-left p-3 hidden md:table-cell">District</th>
              <th className="text-left p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const s = statusOf(u);
              return (
                <tr key={u.phone} className="border-t border-border hover:bg-secondary/40 transition">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{u.phone}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{u.district || "—"}</td>
                  <td className="p-3"><span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${s.cls}`}><ShieldCheck className="size-3" /> {s.label}</span></td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button size="sm" variant="outline" className="rounded-lg mr-1" onClick={() => setOpen(u)}>
                      <Eye className="size-3.5 mr-1" /> View
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-lg" onClick={() => toggleBan(u)}>
                      <Ban className="size-3.5 mr-1" /> {u.banned ? "Unban" : "Ban"}
                    </Button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">{users.length === 0 ? "No registered users yet. Run the onboarding flow to seed data." : `No users match "${q}".`}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-lg">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{open.name}</DialogTitle>
                <DialogDescription>Account & profile snapshot — moderation view.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 text-sm py-1">
                <Field icon={Phone} label="Phone" value={open.phone} />
                <Field icon={MapPin} label="District" value={open.district || "—"} />
                <Field icon={ShieldCheck} label="Status" value={statusOf(open).label} />
                <Field icon={Calendar} label="Joined" value={(open as any).joinedAt || "—"} />
                <Field icon={Heart} label="Stage" value={(open as any).stage || "—"} />
                <Field icon={Baby} label="Baby" value={(open as any).babyName || "—"} />
              </div>
              {open.banned && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
                  This user is currently banned and cannot post or comment.
                </div>
              )}
              <DialogFooter className="flex-row justify-between gap-2">
                <Button variant="outline" onClick={() => setOpen(null)}>Close</Button>
                <Button variant="outline" className={open.banned ? "" : "text-destructive border-destructive/40"} onClick={() => toggleBan(open)}>
                  <Ban className="size-4 mr-1.5" /> {open.banned ? "Unban user" : "Ban user"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-2.5 bg-white">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1"><Icon className="size-3" /> {label}</p>
      <p className="text-sm mt-0.5 truncate">{value}</p>
    </div>
  );
}
