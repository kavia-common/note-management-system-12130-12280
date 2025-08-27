# Notes Frontend (React)

Modern, lightweight notes app with Supabase integration.

## Features
- Create, edit, delete, list, and search notes
- Modern light theme
- Layout: Top bar (search/actions), Sidebar (note titles), Main editor (content)
- Primary: #1976d2, Secondary: #424242, Accent: #ffb300

## Setup
1. Copy `.env.example` to `.env` and fill:
   - REACT_APP_SUPABASE_URL
   - REACT_APP_SUPABASE_KEY
2. Ensure the `notes` table exists (see `assets/supabase.md`).
3. Install and run:
   - npm install
   - npm start

## Notes table schema
See assets/supabase.md for details.

## Scripts
- npm start
- npm test
- npm run build
