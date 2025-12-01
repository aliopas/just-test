import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;
let hasLoggedMissingConfig = false;

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function resolveSupabaseConfig() {
  if (typeof window === 'undefined') {
    return { url: undefined, key: undefined };
  }

  // Try multiple sources for environment variables.
  // Use a loose type for window.__ENV__ to avoid compile-time issues when keys change.
  const env = (window as any).__ENV__ ?? {};
  
  // Priority: window.__ENV__ > process.env.NEXT_PUBLIC_* (for Next.js)
  const rawUrl: string | undefined =
    env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Normalize URL: ensure it is a proper HTTP/HTTPS URL for supabase-js.
  const url =
    rawUrl && rawUrl.trim().length > 0
      ? isAbsoluteUrl(rawUrl)
        ? rawUrl
        : `https://${rawUrl}`
      : undefined;

  // Prefer explicit anon key; fall back to publishable default key if needed
  let key =
    env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  // Debug logging (always in development, or when config is missing)
  if (process.env.NODE_ENV === 'development' || (!url || !key)) {
    console.warn('[Supabase Config Debug]', {
      hasWindowEnv: !!window.__ENV__,
      windowEnvUrl: env.SUPABASE_URL ? 'set' : 'missing',
      windowEnvKey: env.SUPABASE_ANON_KEY
        ? 'anon'
        : env.SUPABASE_PUBLISHABLE_DEFAULT_KEY
          ? 'publishable_fallback'
          : 'missing',
      nextEnvUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
      nextEnvKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? 'anon'
        : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
          ? 'publishable_fallback'
          : 'missing',
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
    if (!hasLoggedMissingConfig) {
      const missing: string[] = [];
      if (!url) missing.push('SUPABASE_URL');
      if (!key) missing.push('SUPABASE_ANON_KEY or PUBLISHABLE_DEFAULT_KEY');

      // Log a single warning instead of spamming errors in the console.
      // The app will gracefully degrade by returning null here.
      // eslint-disable-next-line no-console
      console.warn(
        `[Supabase] Skipping client initialization due to missing configuration: ${missing.join(
          ', '
        )}. ` +
          `Configure NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_ANON_KEY or ` +
          `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY for full Supabase functionality.`
      );
      hasLoggedMissingConfig = true;
    }
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

