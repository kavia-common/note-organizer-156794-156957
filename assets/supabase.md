# Supabase Integration Guide

This frontend integrates with Supabase for cloud persistence of notes. If Supabase is not configured, the app falls back to localStorage to allow full offline/local usage.

## Environment Variables

Set the following variables in a `.env` file at `notes_frontend` project root (same folder as `package.json`):

- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

These values will be injected at build time by Create React App.

## Installation

Dependencies are already declared in `package.json`:
- @supabase/supabase-js

## Database Schema

Create the `notes` table in your Supabase project:

```sql
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled',
  content text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at in sync
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
```

RLS (Row Level Security) is disabled by default in new projects; if you enable RLS, add appropriate policies (e.g., per-user notes).

## Usage in Code

- The client is created in `src/supabaseClient.js` using `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY`.
- CRUD operations are defined in `src/services/notesService.js`.
- If the environment variables are missing, Supabase is not initialized and the app uses localStorage.

## Authentication

This app does not implement user authentication. If you add auth, ensure emailRedirectTo is set using a site URL environment variable (e.g., REACT_APP_SITE_URL) when calling Supabase's sign-in methods.

```js
// Example (if you add auth in the future):
const SITE_URL = process.env.REACT_APP_SITE_URL; // set in your env
await supabase.auth.signInWithOtp({
  email,
  options: { emailRedirectTo: SITE_URL }
});
```

## Troubleshooting

- If you see warnings about missing Supabase env vars, create a `.env` with the variables above.
- Ensure the `notes` table exists and matches the schema.
- Check browser console for Supabase errors and confirm your API key has the correct permissions.
