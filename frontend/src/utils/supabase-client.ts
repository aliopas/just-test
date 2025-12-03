/**
 * Supabase Client - مبسط
 * 
 * يستخدم الإعدادات الموحدة من config/supabase.config.ts
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE, validateSupabaseConfig } from '../config/supabase.config';

let client: SupabaseClient | null = null;
let hasLoggedWarning = false;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  // إرجاع العميل الموجود إن كان موجوداً
  if (client) {
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
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

    return client;
  } catch (error) {
    console.error('[Supabase] فشل في إنشاء العميل:', error);
    return null;
  }
}

