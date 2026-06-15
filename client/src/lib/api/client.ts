// Tiny fetch wrapper. Drop in your Go backend's base URL via VITE_API_BASE_URL.
// Until that is set, callers fall back to in-memory seed/store data.

export const API_BASE_URL: string | undefined =
  (import.meta as any).env?.VITE_API_BASE_URL || undefined;

export const API_ENABLED = !!API_BASE_URL;

export class ApiError extends Error {
  constructor(public status: number, public body: unknown, message?: string) {
    super(message ?? `API ${status}`);
  }
}

function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("momota.token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(0, null, "VITE_API_BASE_URL is not set");
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? safeJson(text) : null;
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}

function safeJson(s: string): unknown {
  try { return JSON.parse(s); } catch { return s; }
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("momota.token", token);
  else localStorage.removeItem("momota.token");
}
