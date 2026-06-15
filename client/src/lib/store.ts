// Tiny localStorage-backed stores with subscription, used as a stand-in for backend state.
import * as React from "react";
import { seedListings, seedPosts } from "./seed";
import type { Listing, Post } from "./types";

function createStore<T>(key: string, initial: T) {
  let value: T = initial;
  const listeners = new Set<() => void>();
  let hydrated = false;

  const hydrate = () => {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    try {
      const raw = localStorage.getItem(key);
      if (raw) value = JSON.parse(raw);
    } catch {}
  };

  const persist = () => {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  };

  return {
    get(): T { hydrate(); return value; },
    set(updater: T | ((v: T) => T)) {
      hydrate();
      value = typeof updater === "function" ? (updater as (v: T) => T)(value) : updater;
      persist();
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
  };
}

export const listingsStore = createStore<Listing[]>("momota.listings.v1", seedListings);
export const postsStore = createStore<Post[]>("momota.posts.v1", seedPosts);

// Per-post report tally (postId → count). Used by community report flow + admin moderation.
export const reportsStore = createStore<Record<string, number>>("momota.reports.v1", {});

// Pending NID verifications submitted during onboarding.
export type PendingNid = {
  id: string;
  phone: string;
  name: string;
  district?: string;
  upazila?: string;
  fileName: string;
  submittedAt: number;
  status: "pending" | "approved" | "rejected";
};
export const nidQueueStore = createStore<PendingNid[]>("momota.nidqueue.v1", []);

export function useStore<T>(store: ReturnType<typeof createStore<T>>) {
  const value = React.useSyncExternalStore(
    store.subscribe,
    () => store.get(),
    () => store.get(),
  );
  return [value, store.set] as const;
}

// Registered users — keyed by phone — used for OTP-only re-login on a new device.
export type RegisteredUser = {
  phone: string;
  name: string;
  district?: string;
  upazila?: string;
  language: "en" | "bn";
  tier: 1 | 2 | 3;
  avatar?: string;
  motherDob?: string;
  childDob?: string;
  childEdd?: string;
  banned?: boolean;
};

const REG_KEY = "momota.registered.v1";

export function getRegistered(): Record<string, RegisteredUser> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(REG_KEY) || "{}"); } catch { return {}; }
}

export function saveRegistered(u: RegisteredUser) {
  const all = getRegistered();
  all[u.phone] = { ...all[u.phone], ...u };
  try { localStorage.setItem(REG_KEY, JSON.stringify(all)); } catch {}
}

export function setRegisteredField(phone: string, patch: Partial<RegisteredUser>) {
  const all = getRegistered();
  if (!all[phone]) return;
  all[phone] = { ...all[phone], ...patch };
  try { localStorage.setItem(REG_KEY, JSON.stringify(all)); } catch {}
}

export function lookupRegistered(phone: string): RegisteredUser | undefined {
  return getRegistered()[phone];
}

