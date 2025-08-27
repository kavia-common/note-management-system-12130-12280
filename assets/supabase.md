# Supabase Integration Guide

This frontend connects directly to Supabase using environment variables:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

Add them to a `.env` file in `notes_frontend`.

Example `.env` (create in `notes_frontend/.env`):
```
REACT_APP_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
REACT_APP_SUPABASE_KEY=YOUR-ANON-KEY
```

Important:
- Environment variables are read at build/start time. Restart the dev server after changes.
- Do not commit secrets. Use project/CI secrets for production.

## Backend Provisioning (performed by automation)

The following was executed on your Supabase project:

1) Table created (if not already present):
```
public.notes (
  id uuid primary key default gen_random_uuid(),
  title text,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)
```

2) Indexes created (idempotent):
- CREATE INDEX IF NOT EXISTS notes_updated_at_desc_idx ON public.notes (updated_at DESC);
- CREATE INDEX IF NOT EXISTS notes_title_idx ON public.notes (title);

3) RLS configuration:
- Row Level Security is ENABLED on public.notes
- Permissive policies for the anon role were added (idempotent):
  - notes_anon_select: FOR SELECT TO anon USING (true)
  - notes_anon_insert: FOR INSERT TO anon WITH CHECK (true)
  - notes_anon_update: FOR UPDATE TO anon USING (true) WITH CHECK (true)
  - notes_anon_delete: FOR DELETE TO anon USING (true)

This configuration allows public read/write access via the anon key for demo purposes. For production, replace with authenticated user policies.

## Production Hardening (recommended)

If you want per-user notes:
1. Add a user_id column:
```
ALTER TABLE public.notes ADD COLUMN user_id uuid REFERENCES auth.users(id);
```
2. Modify policies:
```
DROP POLICY IF EXISTS notes_anon_select ON public.notes;
DROP POLICY IF EXISTS notes_anon_insert ON public.notes;
DROP POLICY IF EXISTS notes_anon_update ON public.notes;
DROP POLICY IF EXISTS notes_anon_delete ON public.notes;

CREATE POLICY notes_select ON public.notes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY notes_insert ON public.notes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY notes_update ON public.notes
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY notes_delete ON public.notes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
```

## Frontend Integration

This project already includes:
- Supabase JS client: `@supabase/supabase-js`
- Client initialization in `src/supabaseClient.js` which reads:
  - REACT_APP_SUPABASE_URL
  - REACT_APP_SUPABASE_KEY

Data access layer: `src/api/notes.js` implements:
- listNotes()
- searchNotes(query)
- createNote({title, content})
- updateNote(id, {title, content})
- deleteNote(id)

These functions connect to the `notes` table and order by `updated_at DESC` where appropriate.

## Optional: Auth Redirects (if enabling auth later)

If you add auth:
- Set Site URL/Redirects in Supabase Dashboard > Authentication > URL Configuration
- In React, ensure a site URL env var is available (e.g., REACT_APP_SITE_URL)
- Always pass a dynamic redirect URL, e.g., `${process.env.REACT_APP_SITE_URL}auth/callback`

## Troubleshooting

- If you see "Missing Supabase configuration" in the console:
  - Ensure `.env` in `notes_frontend` contains REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY
  - Restart `npm start`

- If requests fail with "permission denied for table notes":
  - Verify RLS policies match your intended access (demo uses anon full access)
  - Ensure you used the anon public key in the frontend

- If search behaves unexpectedly:
  - The app uses ilike on title/content and orders by updated_at DESC
