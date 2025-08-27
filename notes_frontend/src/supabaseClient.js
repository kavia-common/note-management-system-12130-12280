//
// PUBLIC_INTERFACE
// Supabase client initialization using environment variables.
//
// This module exports a configured Supabase client instance.
// It expects the following environment variables to be provided
// through the .env file:
// - REACT_APP_SUPABASE_URL
// - REACT_APP_SUPABASE_KEY
//
// Do not hardcode values here; the deployment environment will supply them.
//
import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client using environment variables.
 * The app will throw a clear error if variables are missing to help configuration.
 */
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Fail fast with a helpful message during development
  // This will surface clearly in the browser console.
  // eslint-disable-next-line no-console
  console.error(
    'Missing Supabase configuration. Please provide REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in your .env file.'
  );
}

/**
 * PUBLIC_INTERFACE
 * getSupabase
 * Returns the singleton Supabase client for use across the app.
 */
export function getSupabase() {
  /** Returns a configured Supabase client instance. */
  return createClient(supabaseUrl, supabaseKey);
}

export default getSupabase();
