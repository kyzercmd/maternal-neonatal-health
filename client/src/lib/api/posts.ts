// Community posts data access.
// Currently reads/writes the in-memory store; flip API_ENABLED by setting
// VITE_API_BASE_URL and uncomment the apiFetch lines below to use the Go backend.

import { apiFetch, API_ENABLED } from "./client";
import { endpoints } from "./endpoints";
import { postsStore, reportsStore } from "@/lib/store";
import type { Post as ApiPost } from "./types";
import type { Post as LocalPost } from "@/lib/types";

export async function listPosts(): Promise<LocalPost[]> {
  if (API_ENABLED) {
    const data = await apiFetch<ApiPost[]>(endpoints.posts);
    return data as unknown as LocalPost[]; // map server→local shape here when wired
  }
  return postsStore.get();
}

export async function reportPost(postId: string, reason: string): Promise<void> {
  if (API_ENABLED) {
    await apiFetch(endpoints.postReport(postId), {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    return;
  }
  reportsStore.set((r) => ({ ...r, [postId]: (r[postId] || 0) + 1 }));
}

export async function deletePost(postId: string): Promise<void> {
  if (API_ENABLED) {
    await apiFetch(endpoints.post(postId), { method: "DELETE" });
    return;
  }
  postsStore.set((all) => all.filter((p) => p.id !== postId));
}
