# Supabase Integration Guide

This frontend connects directly to Supabase using environment variables:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

Add them to a `.env` file in `notes_frontend` (see `.env.example`).

## Notes Table

Create a `notes` table with the following columns:
- id: uuid (primary key, default value: `uuid_generate_v4()` or `gen_random_uuid()`)
- title: text
- content: text
- created_at: timestamp with time zone, default: `now()`
- updated_at: timestamp with time zone, default: `now()`

Recommended indexes:
- index on `updated_at desc`
- index on `title`

RLS (optional but recommended):
- If using authenticated users, enable RLS and add policies accordingly.
- For a public demo, keep RLS disabled or allow read/write for anon.

## Email Redirect (if enabling auth)

If you add auth-based signup later, set the email redirect using site URL:
- In React, use `process.env.REACT_APP_SITE_URL` (ensure it is available)
- When calling `signUp`, pass `emailRedirectTo: process.env.REACT_APP_SITE_URL`

No auth is needed for this task unless you choose to protect notes per user.

## Usage

- Create, edit, delete, list, and search notes are supported.
- The app reads environment variables at build time. Restart dev server after editing `.env`.
