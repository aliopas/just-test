/**
 * إعدادات Supabase الموحدة والتبسيط
 * 
 * هذا الملف يبسط الاتصال بـ Supabase من خلال:
 * - استخدام مصدر واحد للإعدادات
 * - تقليل التعقيدات
 * - توحيد المنطق
 */

// إعدادات Supabase من متغيرات البيئة مع قيم افتراضية آمنة لمنع الانهيار
export const SUPABASE_CONFIG = {
  url:
    (typeof window !== 'undefined' && (window as any).__ENV__?.SUPABASE_URL) ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://placeholder-project.supabase.co', // رابط وهمي آمن

  anonKey:
    (typeof window !== 'undefined' && (window as any).__ENV__?.SUPABASE_ANON_KEY) ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy-key', // مفتاح وهمي آمن

  storageUrl:
    (typeof window !== 'undefined' && (window as any).__ENV__?.SUPABASE_STORAGE_URL) ||
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL ||
    '',
} as const;

// التحقق من صحة الإعدادات
export function validateSupabaseConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!SUPABASE_CONFIG.url) missing.push('SUPABASE_URL');
  if (!SUPABASE_CONFIG.anonKey) missing.push('SUPABASE_ANON_KEY');

  return {
    valid: missing.length === 0,
    missing,
  };
}

// تطبيع URL لضمان أنه يحتوي على البروتوكول
export function normalizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

// الحصول على Storage Base URL
export function getStorageBaseUrl(): string {
  if (SUPABASE_CONFIG.storageUrl) {
    return normalizeUrl(SUPABASE_CONFIG.storageUrl);
  }

  if (SUPABASE_CONFIG.url) {
    const baseUrl = normalizeUrl(SUPABASE_CONFIG.url);
    return `${baseUrl.replace(/\/+$/, '')}/storage/v1/object/public`;
  }

  return '';
}

// تصدير الإعدادات النهائية
export const SUPABASE = {
  url: normalizeUrl(SUPABASE_CONFIG.url),
  anonKey: SUPABASE_CONFIG.anonKey,
  storageBaseUrl: getStorageBaseUrl(),
} as const;

