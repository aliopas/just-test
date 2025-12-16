/**
 * Supabase Client - مبسط
 * 
 * يستخدم الإعدادات الموحدة من config/supabase.config.ts
 * 
 * NOTE: We import from the internal ESM module entrypoint instead of the
 * top-level '@supabase/supabase-js' to avoid Next.js optimizePackageImports
 * transforming this import into 'dist/esm/wrapper.mjs', which can cause
 * default export errors in Netlify builds.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js/dist/module/index.js';
import { SUPABASE, validateSupabaseConfig } from '../config/supabase.config';

let client: SupabaseClient | null = null;
let hasLoggedWarning = false;

/**
 * Reset the Supabase client (useful for testing or re-initialization)
 */
export function resetSupabaseClient(): void {
  client = null;
}

/**
 * Get or create Supabase browser client
 * Ensures session is properly initialized and refreshed
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  // إرجاع العميل الموجود إن كان موجوداً
  if (client) {
    // Verify session is still valid
    client.auth.getSession().catch((error) => {
      console.warn('[Supabase] Session check failed:', error);
    });
    return client;
  }

  // التحقق من الإعدادات
  if (typeof window === 'undefined') {
    return null;
  }

  const validation = validateSupabaseConfig();
  
  if (!validation.valid) {
    // تحذير واحد فقط في وضع التطوير
    if (!hasLoggedWarning && process.env.NODE_ENV === 'development') {
      console.warn(
        `[Supabase] إعدادات مفقودة: ${validation.missing.join(', ')}. ` +
        `يرجى تعيين NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY`
      );
      hasLoggedWarning = true;
    }
    return null;
  }

  // إنشاء العميل
  try {
    client = createClient(SUPABASE.url, SUPABASE.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        flowType: 'pkce',
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        headers: {
          'X-Client-Info': 'invastors-frontend',
        },
      },
    });

    // Set up session refresh listener
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        // Session updated, client is still valid
      }
    });

    return client;
  } catch (error) {
    console.error('[Supabase] فشل في إنشاء العميل:', error);
    return null;
  }
}

