import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'pageTitle'
  | 'pageSubtitle'
  | 'filters.all'
  | 'filters.draft'
  | 'filters.submitted'
  | 'filters.screening'
  | 'filters.pendingInfo'
  | 'filters.complianceReview'
  | 'filters.approved'
  | 'filters.settling'
  | 'filters.completed'
  | 'filters.rejected'
  | 'emptyState.title'
  | 'emptyState.subtitle'
  | 'emptyState.cta'
  | 'table.requestNumber'
  | 'table.type'
  | 'table.amount'
  | 'table.status'
  | 'table.updatedAt'
  | 'details.title'
  | 'details.type'
  | 'details.amount'
  | 'details.targetPrice'
  | 'details.expiry'
  | 'details.notes'
  | 'details.lastUpdate'
  | 'details.attachments'
  | 'details.timeline'
  | 'details.comments'
  | 'details.noEvents'
  | 'details.noComments'
  | 'details.noAttachments'
  | 'details.download'
  | 'details.loading'
  | 'details.error'
  | 'pagination.previous'
  | 'pagination.next';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    pageTitle: 'My Requests',
    pageSubtitle: 'Track every investment request and see where it stands.',
    'filters.all': 'All',
    'filters.draft': 'Drafts',
    'filters.submitted': 'Submitted',
    'filters.screening': 'Screening',
    'filters.pendingInfo': 'Pending info',
    'filters.complianceReview': 'Compliance review',
    'filters.approved': 'Approved',
    'filters.settling': 'Settling',
    'filters.completed': 'Completed',
    'filters.rejected': 'Rejected',
    'emptyState.title': 'No requests yet',
    'emptyState.subtitle': 'Submit your first request to see it tracked here.',
    'emptyState.cta': 'Create new request',
    'table.requestNumber': 'Request #',
    'table.type': 'Type',
    'table.amount': 'Amount',
    'table.status': 'Status',
    'table.updatedAt': 'Updated',
    'details.title': 'Request details',
    'details.type': 'Type',
    'details.amount': 'Amount',
    'details.targetPrice': 'Target price',
    'details.expiry': 'Expiry date',
    'details.notes': 'Notes',
    'details.lastUpdate': 'Last update',
    'details.attachments': 'Attachments',
    'details.timeline': 'Timeline',
    'details.comments': 'Comments',
    'details.noEvents': 'No events recorded yet',
    'details.noComments': 'No comments yet',
    'details.noAttachments': 'No attachments uploaded',
    'details.download': 'Download',
    'details.loading': 'Loading request detail…',
    'details.error': 'Unable to load request detail. Please try again.',
    'pagination.previous': 'Previous',
    'pagination.next': 'Next',
  },
  ar: {
    pageTitle: 'طلباتي',
    pageSubtitle: 'تابع جميع طلباتك الاستثمارية واعرف حالتها الحالية.',
    'filters.all': 'الكل',
    'filters.draft': 'مسودات',
    'filters.submitted': 'مرسلة',
    'filters.screening': 'تحت المراجعة',
    'filters.pendingInfo': 'بانتظار معلومات',
    'filters.complianceReview': 'مراجعة التزام',
    'filters.approved': 'معتمدة',
    'filters.settling': 'قيد التسوية',
    'filters.completed': 'مكتملة',
    'filters.rejected': 'مرفوضة',
    'emptyState.title': 'لا توجد طلبات بعد',
    'emptyState.subtitle': 'قدّم طلبك الأول ليظهر تلقائياً هنا.',
    'emptyState.cta': 'إنشاء طلب جديد',
    'table.requestNumber': 'رقم الطلب',
    'table.type': 'النوع',
    'table.amount': 'المبلغ',
    'table.status': 'الحالة',
    'table.updatedAt': 'آخر تحديث',
    'details.title': 'تفاصيل الطلب',
    'details.type': 'النوع',
    'details.amount': 'المبلغ',
    'details.targetPrice': 'السعر المستهدف',
    'details.expiry': 'تاريخ الصلاحية',
    'details.notes': 'ملاحظات',
    'details.lastUpdate': 'آخر تحديث',
    'details.attachments': 'المرفقات',
    'details.timeline': 'سجل الأحداث',
    'details.comments': 'التعليقات',
    'details.noEvents': 'لا يوجد سجل أحداث بعد',
    'details.noComments': 'لا توجد تعليقات بعد',
    'details.noAttachments': 'لم يتم رفع مرفقات',
    'details.download': 'تنزيل',
    'details.loading': 'جاري تحميل تفاصيل الطلب…',
    'details.error': 'تعذّر تحميل تفاصيل الطلب. حاول مرة أخرى.',
    'pagination.previous': 'السابق',
    'pagination.next': 'التالي',
  },
};

export function tRequestList(
  key: MessageKey,
  language: InvestorLanguage = 'ar'
): string {
  return messages[language][key] ?? messages.en[key] ?? key;
}


