# Notes Frontend

Modern, minimalistic notes UI built with React. Features include creating, editing, deleting, searching, and organizing notes with tags. Supabase is used for cloud persistence; the app gracefully falls back to local storage if Supabase is not configured.

## Features

- Create, edit, and delete notes
- Tag notes to organize them
- Search notes by title/content
- Minimal, light, responsive UI
- Supabase integration (optional; uses local storage when not configured)

## Layout

- Top bar: quick actions and search
- Sidebar: tag filters
- Main: note list and editor

## Environment

Set the following environment variables for Supabase:

- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

Create a `.env` file at the project root (same folder as `package.json`) or see `.env.example`.

## Supabase

See `../../assets/supabase.md` for schema and setup instructions.

## Scripts

- `npm start` – start development server
- `npm test` – run tests
- `npm run build` – production build

## Notes Schema (reference)

Table: `notes`
- id: uuid (primary key, default gen_random_uuid())
- title: text
- content: text
- tags: text[] (default '{}')
- created_at: timestamptz (default now())
- updated_at: timestamptz (default now())

Add a trigger to keep `updated_at` fresh on update or update it in the application layer (this app updates it in the application layer).

