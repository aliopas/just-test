import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'pageTitle'
  | 'pageSubtitle'
  | 'list.emptyTitle'
  | 'list.emptySubtitle'
  | 'list.loadMore'
  | 'card.readMore'
  | 'detail.back'
  | 'detail.publishedAt'
  | 'detail.updatedAt'
  | 'detail.loading'
  | 'detail.error'
  | 'detail.missingId'
  | 'detail.noData'
  | 'detail.attachments.title'
  | 'detail.attachments.imagesTitle'
  | 'detail.attachments.filesTitle'
  | 'detail.attachments.download'
  | 'toast.loadError'
  | 'toast.detailError';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    pageTitle: 'Latest News & Announcements',
    pageSubtitle:
      'Stay informed about Bakurah updates, investment opportunities, and platform announcements.',
    'list.emptyTitle': 'No news published yet',
    'list.emptySubtitle':
      'Please check back soon. We publish updates whenever there is something important to share.',
    'list.loadMore': 'Load more',
    'card.readMore': 'Read more',
    'detail.back': '← Back to news',
    'detail.publishedAt': 'Published on',
    'detail.updatedAt': 'Last updated',
    'detail.loading': 'Loading article…',
    'detail.error': 'Failed to load article. Please try again.',
    'detail.missingId': 'Invalid article link. Please go back to the news list.',
    'detail.noData': 'This article could not be found or is no longer available.',
    'detail.attachments.title': 'Attachments',
    'detail.attachments.imagesTitle': 'Image gallery',
    'detail.attachments.filesTitle': 'Files & downloads',
    'detail.attachments.download': 'Download',
    'toast.loadError': 'Unable to load news. Please try again.',
    'toast.detailError': 'Unable to load article. Please try again.',
  },
  ar: {
    pageTitle: 'آخر الأخبار والإعلانات',
    pageSubtitle:
      'ابقَ على اطلاع بآخر تحديثات باكورة، فرص الاستثمار، والإعلانات المهمة.',
    'list.emptyTitle': 'لا توجد أخبار منشورة بعد',
    'list.emptySubtitle':
      'عد لاحقاً للاطلاع على أحدث التحديثات فور نشرها.',
    'list.loadMore': 'تحميل المزيد',
    'card.readMore': 'عرض التفاصيل',
    'detail.back': '← العودة للأخبار',
    'detail.publishedAt': 'تاريخ النشر',
    'detail.updatedAt': 'آخر تحديث',
    'detail.loading': 'جارٍ تحميل المقال…',
    'detail.error': 'تعذّر تحميل المقال. حاول مرة أخرى.',
    'detail.missingId': 'رابط المقال غير صالح. الرجاء العودة لقائمة الأخبار.',
    'detail.noData': 'لم يتم العثور على هذا المقال أو لم يعد متاحًا.',
    'detail.attachments.title': 'المرفقات',
    'detail.attachments.imagesTitle': 'معرض الصور',
    'detail.attachments.filesTitle': 'الملفات والتنزيلات',
    'detail.attachments.download': 'تحميل',
    'toast.loadError': 'تعذّر تحميل الأخبار. حاول مرة أخرى.',
    'toast.detailError': 'تعذّر تحميل المقال. حاول مرة أخرى.',
  },
};

export function tInvestorNews(key: MessageKey, language: InvestorLanguage) {
  return messages[language][key];
}


