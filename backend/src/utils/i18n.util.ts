const SUPPORTED_LANGUAGES = ['ar', 'en'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const messages: Record<string, Record<SupportedLanguage, string>> = {
  profileFetched: {
    en: 'Investor profile fetched successfully',
    ar: 'تم جلب الملف الشخصي بنجاح',
  },
  profileNotFound: {
    en: 'Investor profile not found',
    ar: 'الملف الشخصي للمستثمر غير موجود',
  },
  profileUpdated: {
    en: 'Investor profile updated successfully',
    ar: 'تم تحديث الملف الشخصي للمستثمر بنجاح',
  },
  noChanges: {
    en: 'No changes detected',
    ar: 'لا يوجد تغييرات',
  },
};

export function detectLanguage(
  header?: string | string[],
  fallback: SupportedLanguage = 'ar'
): SupportedLanguage {
  if (!header) {
    return fallback;
  }

  const candidate = Array.isArray(header) ? header[0] : header;
  if (!candidate) {
    return fallback;
  }

  const [lang] = candidate.split(',');
  const normalized = lang?.trim().slice(0, 2).toLowerCase();

  return SUPPORTED_LANGUAGES.includes(normalized as SupportedLanguage)
    ? (normalized as SupportedLanguage)
    : fallback;
}

export function t(key: keyof typeof messages, lang: SupportedLanguage): string {
  const translation = messages[key];
  if (!translation) {
    return key;
  }
  return translation[lang] ?? translation.en;
}

