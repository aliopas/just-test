import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'section.title'
  | 'section.subtitle'
  | 'metrics.impressions'
  | 'metrics.views'
  | 'metrics.ctr'
  | 'top.title'
  | 'top.subtitle'
  | 'top.empty'
  | 'top.impressions'
  | 'top.views'
  | 'top.ctr'
  | 'trend.title'
  | 'trend.subtitle'
  | 'trend.empty'
  | 'toast.error'
  | 'actions.retry'
  | 'meta.generatedAt';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    'section.title': 'Content engagement',
    'section.subtitle': 'News impressions and reads over the last 30 days.',
    'metrics.impressions': 'Impressions',
    'metrics.views': 'Detail views',
    'metrics.ctr': 'CTR',
    'top.title': 'Top performing news',
    'top.subtitle': 'Highest engagement (reads vs. impressions)',
    'top.empty': 'No engagement recorded yet.',
    'top.impressions': 'Impressions',
    'top.views': 'Views',
    'top.ctr': 'CTR',
    'trend.title': 'Daily engagement trend',
    'trend.subtitle': 'Reads vs. impressions',
    'trend.empty': 'No trend data for the selected range.',
    'toast.error': 'Failed to load content analytics.',
    'actions.retry': 'Retry',
    'meta.generatedAt': 'Refreshed at',
  },
  ar: {
    'section.title': 'تفاعل المحتوى',
    'section.subtitle': 'انطباعات وقراءات الأخبار خلال آخر 30 يومًا.',
    'metrics.impressions': 'الانطباعات',
    'metrics.views': 'القراءات التفصيلية',
    'metrics.ctr': 'معدل النقر (CTR)',
    'top.title': 'أعلى الأخبار أداءً',
    'top.subtitle': 'أكثر المقالات تفاعلاً (قراءات مقابل انطباعات)',
    'top.empty': 'لا يوجد تفاعل مسجل بعد.',
    'top.impressions': 'الانطباعات',
    'top.views': 'القراءات',
    'top.ctr': 'CTR',
    'trend.title': 'اتجاه التفاعل اليومي',
    'trend.subtitle': 'القراءات مقابل الانطباعات',
    'trend.empty': 'لا توجد بيانات اتجاه للفترة المختارة.',
    'toast.error': 'تعذر تحميل تحليلات المحتوى.',
    'actions.retry': 'إعادة المحاولة',
    'meta.generatedAt': 'تم التحديث في',
  },
};

export function tAdminContentAnalytics(
  key: MessageKey,
  language: InvestorLanguage = 'ar'
): string {
  return messages[language][key] ?? messages.en[key] ?? key;
}


