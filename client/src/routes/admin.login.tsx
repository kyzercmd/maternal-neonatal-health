import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLogin } from "@/lib/api/admin";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin sign in — Momota" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const ok = await adminLogin(email, password);
    setBusy(false);
    if (!ok) {
      setError("Invalid email or password.");
      return;
    }
    nav({ to: "/admin" });
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-secondary/40">
      <form onSubmit={submit} className="w-full max-w-sm card-warm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="size-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <ShieldCheck className="size-4" />
          </span>
          <div>
            <h1 className="font-display text-xl leading-none">Moderator sign in</h1>
            <p className="text-xs text-muted-foreground mt-1">Momota internal dashboard</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="em">Email</Label>
          <Input
            id="em"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@momota.app"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw">Password</Label>
          <Input
            id="pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full rounded-lg">
          {busy ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-[11px] text-muted-foreground text-center">
          Demo credentials — <code className="font-mono">admin@momota.app</code> /{" "}
          <code className="font-mono">momota123</code>
        </p>
      </form>
    </div>
  );
}
