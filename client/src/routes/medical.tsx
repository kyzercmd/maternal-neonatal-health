import { createFileRoute, Outlet } from "@tanstack/react-router";
import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/medical")({
  head: () => ({ meta: [{ title: "Your Health Hub — Momota" }] }),
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
