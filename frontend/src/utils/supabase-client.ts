import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function resolveSupabaseConfig() {
  if (typeof window === 'undefined') {
    return { url: undefined, key: undefined };
  }

  // Try multiple sources for environment variables
  const env = window.__ENV__ ?? {};
  
  // Priority: window.__ENV__ > process.env.NEXT_PUBLIC_* (for Next.js)
  const url = env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Debug logging (always in development, or when config is missing)
  if (process.env.NODE_ENV === 'development' || (!url || !key)) {
    console.warn('[Supabase Config Debug]', {
      hasWindowEnv: !!window.__ENV__,
      windowEnvUrl: env.SUPABASE_URL ? 'set' : 'missing',
      windowEnvKey: env.SUPABASE_ANON_KEY ? 'set' : 'missing',
      nextEnvUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
      nextEnvKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing',
      resolvedUrl: url ? 'found' : 'missing',
      resolvedKey: key ? 'found' : 'missing',
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
      `Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.`
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

