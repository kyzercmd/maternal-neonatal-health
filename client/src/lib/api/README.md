# Momota API layer

Drop-in fetch layer that the React app talks to. Today every helper falls
back to localStorage seed data so the UI works without a backend. When the
Go server is ready, set a single env var and the same helpers hit live
endpoints — no component changes required.

## 1. Wire up the backend

```
# .env (or hosting provider env)
VITE_API_BASE_URL=https://api.momota.app
```

That single variable flips `API_ENABLED` in `src/lib/api/client.ts`. Once
set, every helper that has a real implementation will issue an `apiFetch`
instead of touching the store.

## 2. Endpoint surface

See `endpoints.ts` for the full URL map. Match these in the Go router:

| Frontend call      | HTTP        | Backend route              |
| ------------------ | ----------- | -------------------------- |
| `auth/request-otp` | POST        | `/auth/otp/request`        |
| `auth/verify-otp`  | POST        | `/auth/otp/verify`         |
| `me`               | GET / PATCH | `/users/me`                |
| `posts`            | GET / POST  | `/posts`                   |
| `posts/:id/report` | POST        | `/posts/:id/report`        |
| `listings`         | GET / POST  | `/listings`                |
| `midwife/chat`     | POST        | `/midwife/chat`            |
| `medical/alerts`   | GET         | `/medical/alerts`          |
| `verification/nid` | POST        | `/verification/nid`        |
| `admin/...`        | various     | `/admin/*` (auth required) |

## 3. Data shapes

`types.ts` is the single source of truth and is shaped to translate
directly into Go structs. Field names are `snake_case` to keep JSON
unchanged across the wire.

Suggested Go DDL (Postgres):

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text not null,
  avatar_url text,
  district text, upazila text,
  language text not null default 'bn',
  tier smallint not null default 1,
  verified boolean not null default false,
  banned boolean not null default false,
  created_at timestamptz not null default now()
);
create table children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text, dob date, edd date,
  sex text, birth_weight_kg numeric, feeding text, allergies text
);
create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references users(id) on delete cascade,
  cohort text not null, body text not null, media jsonb not null default '[]',
  likes int not null default 0, comments_count int not null default 0,
  reports int not null default 0, hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create table listings (...);            -- see types.ts:Listing
create table nid_submissions (...);     -- see types.ts:NidSubmission
create table midwife_messages (...);    -- see types.ts:MidwifeMessage
create table reports (...);             -- see types.ts:Report
```

## 4. Swap procedure for a single helper

```ts
// src/lib/api/posts.ts — already wired this way
export async function listPosts(): Promise<LocalPost[]> {
  if (API_ENABLED) return apiFetch(endpoints.posts);
  return postsStore.get(); // fallback removed once backend is live
}
```

When you're confident the backend is solid, delete the seed fallback
branch and the `postsStore` import.

## 5. Auth tokens

`apiFetch` reads the bearer token from `localStorage.momota.token`. Set
it after a successful login:

```ts
import { setAuthToken } from "@/lib/api/client";
setAuthToken(serverIssuedJwt);
```

For admin sessions, use `localStorage.momota.admin.v1 === "1"` as the
client-side gate; the backend must still authorize every request.
