import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function resolveSupabaseConfig() {
  if (typeof window === 'undefined') {
    return { url: undefined, key: undefined };
  }

  const env = window.__ENV__ ?? {};
  const url = env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

  return { url, key };
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (client) {
    return client;
  }

  const { url, key } = resolveSupabaseConfig();
  if (!url || !key) {
    if (import.meta.env.DEV) {
      console.warn(
        'Supabase realtime client not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.'
      );
    }
    return null;
  }

  client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return client;
}

