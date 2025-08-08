## Supabase MCP + Auth/DB Setup Guide (Cursor + Vite React)

This guide documents the exact steps we used to:
- Connect Cursor MCP to a Supabase project (with write access)
- Provision database schema with RLS via MCP
- Integrate the Supabase client into a Vite React app
- Add email/password auth (plus magic link and password reset)
- Wire basic CRUD and a logout action

Use this as a repeatable checklist for future projects.

---

## 1) Prerequisites

- Node.js and npm installed (verify with `node -v` and `npm -v`)
- Ensure npm global bin is on PATH (Windows):
  - Check prefix: `npm config get prefix`
  - Prefer a user-writable path such as `C:\Users\<you>\AppData\Roaming\npm`
  - Add to PATH if needed:
    - PowerShell: `setx PATH "$env:PATH;$env:APPDATA\npm"`
- A Supabase project and a personal access token with sufficient rights

---

## 2) Configure Supabase MCP in Cursor

Create (or edit) `c:\Users\<you>\.cursor\mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=YOUR_PROJECT_REF"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "<your_personal_access_token>"
      }
    }
  }
}
```

Important:
- Use the Supabase project ref only (e.g., `ddvxhkbhzarwcpnfeaxt`). Do NOT include protocol or domain.
- Remove `--read-only` to allow schema migrations and writes.
- Keep your access token secret and rotate if exposed.

Verification (from Cursor MCP tools):
- Get project URL
- Get anon key
- List tables/migrations

If you see “Project reference in URL is not valid”, your `--project-ref` includes a URL. Replace with just the project ref.

---

## 3) Provision Database (Tables, RLS, Triggers) via MCP

Apply the migration below. It creates `public.user_profiles` and `public.prompt_logs`, enables RLS, adds owner-only policies, and triggers for `updated_at`. It also installs `pg_trgm` in an `extensions` schema and hardens function search_path.

```sql
-- extensions
create extension if not exists pgcrypto;
create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;
alter extension pg_trgm set schema extensions;

-- tables
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.prompt_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  content text,
  category text,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.user_profiles enable row level security;
alter table public.prompt_logs enable row level security;

-- triggers
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_prompt_logs') then
    create trigger set_updated_at_prompt_logs
      before update on public.prompt_logs
      for each row execute procedure public.tg_set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_user_profiles') then
    create trigger set_updated_at_user_profiles
      before update on public.user_profiles
      for each row execute procedure public.tg_set_updated_at();
  end if;
end $$;

-- keep user_profiles in sync with auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        avatar_url = excluded.avatar_url,
        updated_at = now();
  return new;
end
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end $$;

-- policies (optimized with (select auth.uid()))
-- user_profiles
create or replace policy user_profiles_select_self on public.user_profiles
  for select using ((select auth.uid()) = id);
create or replace policy user_profiles_update_self on public.user_profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create or replace policy user_profiles_insert_self on public.user_profiles
  for insert with check ((select auth.uid()) = id);

-- prompt_logs
create or replace policy prompt_logs_select_owner on public.prompt_logs
  for select using ((select auth.uid()) = user_id);
create or replace policy prompt_logs_ins_owner on public.prompt_logs
  for insert with check ((select auth.uid()) = user_id);
create or replace policy prompt_logs_upd_owner on public.prompt_logs
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create or replace policy prompt_logs_del_owner on public.prompt_logs
  for delete using ((select auth.uid()) = user_id);

-- indexes
create index if not exists prompt_logs_created_at_idx on public.prompt_logs (created_at desc);
create index if not exists prompt_logs_user_id_created_idx on public.prompt_logs (user_id, created_at desc);
create index if not exists prompt_logs_tags_gin on public.prompt_logs using gin (tags);
create index if not exists prompt_logs_title_trgm on public.prompt_logs using gin (title gin_trgm_ops);
```

After applying, use advisors:
- Security advisor: fix function search_path, avoid extensions in `public`
- Performance advisor: RLS calls with `(select auth.uid())` to avoid per-row initplan

Expected residual warnings: enabling leaked password protection and MFA (configure in Supabase Auth settings).

---

## 4) Add Supabase Client to Vite React

Environment (`.env.local`):

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Client (`src/lib/supabaseClient.ts`):

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

TypeScript path aliases (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"],
      "@/ui/*": ["./src/ui/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  }
}
```

---

## 5) Wire Auth Pages and Protected Routes

Routes (`src/main.tsx`): add `/login`, `/signup`, `/update-password`, protect `/` with `RequireAuth`.

Guard (`src/lib/RequireAuth.tsx`): redirects unauthenticated users to `/login`.

Login (`src/pages/Login.tsx`):
- Email/password sign-in
- Magic link (`signInWithOtp`) with `emailRedirectTo`
- Password reset (`resetPasswordForEmail`) with redirect to `/update-password`

Signup (`src/pages/Signup.tsx`): email/password sign-up, then redirect (session or login depending on project email confirmation setting).

Update Password (`src/pages/UpdatePassword.tsx`): update password after reset link.

Logout: add a logout icon/button that calls `supabase.auth.signOut()` and routes to `/login`.

---

## 6) Basic Data Wiring

- Read: count of `prompt_logs` with `select('*', { count: 'exact', head: true })`
- Insert: create a log with `user_id = user.id` to satisfy RLS

Note: All database reads/writes require an authenticated user due to RLS policies.

---

## 7) Dev Server & Build Notes

- Vite default port is 5173; if it’s in use, Vite will switch (e.g., to 5174). You can choose a port: `npm run dev -- --port 5175`.
- On Windows PowerShell, avoid piping to `cat` (it isn’t GNU cat). Use `Get-Content` or no pipe.

---

## 8) Git Hygiene

Add to `.gitignore`:

```
# MCP and Cursor local config
.cursor/
.mcp.json
mcp.json

# Local env
*.local
.env*
```

Never commit tokens or `.env.local`.

---

## 9) Troubleshooting

- “Project reference in URL is not valid”: use only the project ref in MCP args.
- “Invalid login credentials”: password is wrong; use Magic Link or Reset Password flow.
- RLS errors: ensure the user is signed in and `user_id` matches `auth.uid()` in inserts.
- Advisors warn about `pg_trgm` in `public` or mutable function `search_path`: use the hardened SQL above.

---

## 10) Quick Verification Checklist

- MCP can fetch project URL and anon key
- Tables exist: `public.user_profiles`, `public.prompt_logs`
- RLS enabled and policies present
- App builds and runs; `/signup` and `/login` work
- Insert into `prompt_logs` succeeds when signed in
- Logout button signs out and redirects to `/login`
