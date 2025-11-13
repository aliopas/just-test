import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function resolveSupabaseConfig() {
  if (typeof window === 'undefined') {
    return { url: undefined, key: undefined };
  }

  // Try multiple sources for environment variables
  const env = window.__ENV__ ?? {};
  
  // Priority: window.__ENV__ > import.meta.env (for Vite)
  const url = env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_ANON_KEY;

  // Debug logging (always in development, or when config is missing)
  if (import.meta.env.DEV || (!url || !key)) {
    console.warn('[Supabase Config Debug]', {
      hasWindowEnv: !!window.__ENV__,
      windowEnvUrl: env.SUPABASE_URL ? 'set' : 'missing',
      windowEnvKey: env.SUPABASE_ANON_KEY ? 'set' : 'missing',
      viteEnvUrl: import.meta.env.VITE_SUPABASE_URL ? 'set' : 'missing',
      viteEnvKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'set' : 'missing',
      resolvedUrl: url ? 'found' : 'missing',
      resolvedKey: key ? 'found' : 'missing',
      allEnvKeys: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')),
    });
  }

  return { url, key };
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (client) {
    return client;
  }

  const { url, key } = resolveSupabaseConfig();
  if (!url || !key) {
    const missing = [];
    if (!url) missing.push('SUPABASE_URL');
    if (!key) missing.push('SUPABASE_ANON_KEY');
    
    console.error(
      `[Supabase] Missing configuration: ${missing.join(', ')}. ` +
      `Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.`
    );
    return null;
  }

  try {
    client = createClient(url, key, {
      auth: {
        persistSession: true, // Enable session persistence for password reset
        autoRefreshToken: true,
        detectSessionInUrl: true, // Detect session from URL (for password reset)
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

    return client;
  } catch (error) {
    console.error('[Supabase] Failed to create client:', error);
    return null;
  }
}

