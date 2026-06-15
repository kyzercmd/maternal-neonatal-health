import * as React from "react";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 pb-20 md:pb-10">
        <div className="mx-auto max-w-6xl px-3 sm:px-5 py-4 sm:py-6">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
