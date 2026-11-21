import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Check whether valid, non-placeholder Supabase credentials are configured
 */
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-supabase-anon') &&
    supabaseUrl.startsWith('https://')
  );
};

export const getSupabaseConfigStatus = () => {
  if (isSupabaseConfigured()) {
    return {
      configured: true,
      url: supabaseUrl,
      projectHost: new URL(supabaseUrl).host
    };
  }
  return {
    configured: false,
    url: supabaseUrl || null,
    missing: [
      !supabaseUrl || supabaseUrl.includes('your-project') ? 'VITE_SUPABASE_URL' : null,
      !supabaseAnonKey || supabaseAnonKey.includes('your-anon') ? 'VITE_SUPABASE_ANON_KEY' : null
    ].filter(Boolean)
  };
};

/**
 * Real Supabase Client with persistent session storage
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'aaroh_supabase_auth_token'
      }
    })
  : null;

export default supabase;
