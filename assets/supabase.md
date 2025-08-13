# Supabase Integration Guide

This frontend integrates with Supabase for cloud persistence of notes. If Supabase is not configured, the app falls back to localStorage to allow full offline/local usage.

This document reflects the current configured state in your Supabase project and how the frontend integrates with it.

## Environment Variables

Create a `.env` file at `notes_frontend` project root (same folder as `package.json`) and set:

- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

These values are injected at build time by Create React App. Do not commit real keys to source control.

## Installation

Dependencies are already declared in `notes_frontend/package.json`:
- @supabase/supabase-js

No additional installation is required beyond `npm install`.

## Backend Configuration (executed)

The following was applied to your Supabase project:

1) Table: public.notes
- id uuid primary key default gen_random_uuid()
- title text not null default 'Untitled'
- content text not null default ''
- tags text[] not null default '{}'
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

2) Trigger to maintain updated_at:
- Function public.set_updated_at()
- Trigger trg_set_updated_at before update on public.notes

3) RLS (Row Level Security):
- Explicitly disabled on public.notes because this app does not implement authentication.

SQL that was executed:

```sql
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled',
  content text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_updated_at on public.notes;
create trigger trg_set_updated_at
before update on public.notes
for each row
execute function public.set_updated_at();

-- RLS is kept disabled to allow anon key access without auth.
-- If you enable RLS, see the guidance below.
```

## Usage in Code

- The client is created in `src/supabaseClient.js` using `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY`.
- CRUD operations are defined in `src/services/notesService.js`.
- If environment variables are missing, Supabase is not initialized and the app uses localStorage.

## Optional: Enabling RLS in the future

If you decide to add authentication and per-user notes, you should:
1) Add a user_id column and reference auth.users:
```sql
alter table public.notes
add column if not exists user_id uuid;

comment on column public.notes.user_id is 'Owner of the note (auth.users.id)';
```

2) Enable RLS and define policies (examples for authenticated users only):
```sql
alter table public.notes enable row level security;

-- Example policies (requires notes.user_id to be set by the app or via triggers)
create policy "Allow select own notes"
on public.notes for select
using (auth.uid() = user_id);

create policy "Allow insert own notes"
on public.notes for insert
with check (auth.uid() = user_id);

create policy "Allow update own notes"
on public.notes for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Allow delete own notes"
on public.notes for delete
using (auth.uid() = user_id);
```

3) In your frontend, set user_id to the authenticated user id when creating/updating notes.

Note: Do not enable RLS without appropriate policies, or your app will lose access using the anon key.

## Authentication

This app does not implement user authentication. If you add auth later, ensure your email redirect URLs are set using a dynamic site URL env var.

```js
// Example (if you add auth in the future):
// Add a helper like getURL() to centralize dev/prod site URL resolution.
const SITE_URL = process.env.REACT_APP_SITE_URL; // set in your env
await supabase.auth.signInWithOtp({
  email,
  options: { emailRedirectTo: SITE_URL }
});
```

Also, in the Supabase Dashboard:
- Authentication > URL Configuration: set your Site URL(s).
- Add both http://localhost:3000/** and your production domain /** as Redirect URLs.

## Troubleshooting

- If you see warnings about missing Supabase env vars, create a `.env` with the variables above.
- Ensure the `notes` table exists and matches the schema.
- Check browser console for Supabase errors and confirm your API key has the correct permissions.
- If you enable RLS, verify policies are set correctly and that requests include a session (i.e., the user is authenticated).

## What the frontend expects

- Table: public.notes with fields (id, title, content, tags, created_at, updated_at).
- No authentication required (anon key access) unless you choose to enable RLS and auth.
