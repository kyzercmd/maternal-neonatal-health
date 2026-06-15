import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import * as React from "react";
import { isAdmin, adminLogout } from "@/lib/api/admin";
import { cn } from "@/lib/utils";
import { LayoutDashboard, MessageSquare, ShoppingBag, Users, IdCard, LogOut, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Momota" }] }),
  component: AdminShell,
});

function AdminShell() {
  const nav = useNavigate();
  const { location } = useRouterState();
  const onLogin = location.pathname === "/admin/login";
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (onLogin) { setReady(true); return; }
    if (!isAdmin()) nav({ to: "/admin/login" });
    else setReady(true);
  }, [onLogin, nav, location.pathname]);

  if (onLogin) return <Outlet />;
  if (!ready) return null;

  const items = [
    { to: "/admin", label: "Analytics", Icon: LayoutDashboard, exact: true },
    { to: "/admin/posts", label: "Posts", Icon: MessageSquare },
    { to: "/admin/marketplace", label: "Marketplace", Icon: ShoppingBag },
    { to: "/admin/users", label: "Users", Icon: Users },
    { to: "/admin/nid", label: "NID Queue", Icon: IdCard },
  ];

  return (
    <div className="min-h-screen flex bg-secondary/40">
      <aside className="w-60 shrink-0 bg-white border-r border-border p-4 hidden md:flex flex-col">
        <Link to="/admin" className="flex items-center gap-2 mb-6 px-2">
          <span className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center"><ShieldCheck className="size-4" /></span>
          <div>
            <p className="font-display text-base leading-none">Momota</p>
            <p className="text-[11px] text-muted-foreground">Moderation</p>
          </div>
        </Link>
        <nav className="space-y-1 text-sm">
          {items.map(({ to, label, Icon, exact }) => {
            const active = exact ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link key={to} to={to} className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md transition",
                active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-secondary"
              )}>
                <Icon className="size-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => { adminLogout(); nav({ to: "/admin/login" }); }}
          className="mt-auto flex items-center gap-2 px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 h-12 bg-white border-b border-border">
          <span className="font-display text-sm">Momota Admin</span>
          <button onClick={() => { adminLogout(); nav({ to: "/admin/login" }); }} className="text-xs text-destructive">Sign out</button>
        </header>
        <nav className="md:hidden flex gap-1 overflow-x-auto no-scrollbar p-2 bg-white border-b border-border text-xs">
          {items.map(({ to, label, Icon, exact }) => {
            const active = exact ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link key={to} to={to} className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-md whitespace-nowrap",
                active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/80"
              )}>
                <Icon className="size-3.5" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
