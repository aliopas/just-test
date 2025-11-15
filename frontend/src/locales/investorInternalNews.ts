import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'pageTitle'
  | 'pageSubtitle'
  | 'emptyTitle'
  | 'emptySubtitle'
  | 'loading'
  | 'error'
  | 'refresh'
  | 'card.publishedAt'
  | 'attachments.title'
  | 'attachments.download'
  | 'attachments.imagesTitle'
  | 'attachments.filesTitle';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    pageTitle: 'Internal Updates & Briefings',
    pageSubtitle:
      'Stay informed with private investor communications, performance summaries, and downloadable resources.',
    emptyTitle: 'No internal updates yet',
    emptySubtitle:
      'Once the Bakurah team publishes investor-only briefings, they will appear here.',
    loading: 'Loading internal updates…',
    error: 'We could not load the internal news feed right now. Please try again.',
    refresh: 'Refresh',
    'card.publishedAt': 'Published on',
    'attachments.title': 'Attachments',
    'attachments.download': 'Download',
    'attachments.imagesTitle': 'Image gallery',
    'attachments.filesTitle': 'Files & downloads',
  },
  ar: {
    pageTitle: 'التحديثات الداخلية للمستثمرين',
    pageSubtitle:
      'اطّلع على رسائل باكورة الخاصة بالمستثمرين، موجز الأداء، والمرفقات السرية.',
    emptyTitle: 'لا توجد تحديثات داخلية بعد',
    emptySubtitle:
      'ستظهر التحديثات والمرفقات الخاصة بالمستثمرين هنا فور نشرها من فريق باكورة.',
    loading: 'جارٍ تحميل التحديثات الداخلية…',
    error: 'تعذر تحميل موجز الأخبار الداخلية، يرجى المحاولة مرة أخرى.',
    refresh: 'تحديث',
    'card.publishedAt': 'تاريخ النشر',
    'attachments.title': 'المرفقات',
    'attachments.download': 'تحميل',
    'attachments.imagesTitle': 'معرض الصور',
    'attachments.filesTitle': 'الملفات والتنزيلات',
  },
};

export function tInvestorInternalNews(
  key: MessageKey,
  language: InvestorLanguage
): string {
  return messages[language][key];
}



