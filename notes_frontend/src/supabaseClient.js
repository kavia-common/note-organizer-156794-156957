import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client factory
 * Reads REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY from environment variables
 * and returns a configured Supabase client instance or null if not configured.
 */

// PUBLIC_INTERFACE
export function getSupabaseClient() {
  /** Returns a configured Supabase client instance or null if env vars are missing. */
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      'Supabase environment variables are missing. ' +
        'Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY to enable cloud sync.'
    );
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      db: { schema: 'public' }
    });
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}
