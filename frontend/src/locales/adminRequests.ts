import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'pageTitle'
  | 'pageSubtitle'
  | 'filters.status'
  | 'filters.type'
  | 'filters.dateFrom'
  | 'filters.dateTo'
  | 'filters.minAmount'
  | 'filters.maxAmount'
  | 'filters.searchPlaceholder'
  | 'filters.reset'
  | 'filters.apply'
  | 'sort.label'
  | 'sort.created'
  | 'sort.amount'
  | 'sort.status'
  | 'status.all'
  | 'status.draft'
  | 'status.submitted'
  | 'status.screening'
  | 'status.pending_info'
  | 'status.compliance_review'
  | 'status.approved'
  | 'status.rejected'
  | 'status.settling'
  | 'status.completed'
  | 'type.all'
  | 'type.buy'
  | 'type.sell'
  | 'table.requestNumber'
  | 'table.investor'
  | 'table.amount'
  | 'table.status'
  | 'table.createdAt'
  | 'table.emptyTitle'
  | 'table.emptySubtitle'
  | 'table.error'
  | 'table.loading'
  | 'pagination.previous'
  | 'pagination.next'
  | 'detail.title'
  | 'detail.back'
  | 'detail.requestInfo'
  | 'detail.investorInfo'
  | 'detail.notes'
  | 'detail.attachments'
  | 'detail.timeline'
  | 'detail.comments'
  | 'detail.noAttachments'
  | 'detail.noEvents'
  | 'detail.noComments'
  | 'detail.actions'
  | 'detail.approve'
  | 'detail.reject'
  | 'detail.requestInfoAction'
  | 'detail.updatedAt';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    pageTitle: 'Requests Inbox',
    pageSubtitle: 'Track all investor submissions and triage them efficiently.',
    'filters.status': 'Status',
    'filters.type': 'Type',
    'filters.dateFrom': 'From date',
    'filters.dateTo': 'To date',
    'filters.minAmount': 'Min amount',
    'filters.maxAmount': 'Max amount',
    'filters.searchPlaceholder': 'Search by number or investor name…',
    'filters.reset': 'Reset',
    'filters.apply': 'Apply',
    'sort.label': 'Sort by',
    'sort.created': 'Created date',
    'sort.amount': 'Amount',
    'sort.status': 'Status',
    'status.all': 'All',
    'status.draft': 'Draft',
    'status.submitted': 'Submitted',
    'status.screening': 'Screening',
    'status.pending_info': 'Pending info',
    'status.compliance_review': 'Compliance review',
    'status.approved': 'Approved',
    'status.rejected': 'Rejected',
    'status.settling': 'Settling',
    'status.completed': 'Completed',
    'type.all': 'All',
    'type.buy': 'Buy',
    'type.sell': 'Sell',
    'table.requestNumber': 'Request #',
    'table.investor': 'Investor',
    'table.amount': 'Amount',
    'table.status': 'Status',
    'table.createdAt': 'Created',
    'table.emptyTitle': 'No requests yet',
    'table.emptySubtitle':
      'When investors submit requests, they will appear here automatically.',
    'table.error': 'Unable to load requests. Please try again.',
    'table.loading': 'Loading requests…',
    'pagination.previous': 'Previous',
    'pagination.next': 'Next',
    'detail.title': 'Request details',
    'detail.back': 'Back to inbox',
    'detail.requestInfo': 'Request information',
    'detail.investorInfo': 'Investor information',
    'detail.notes': 'Internal notes',
    'detail.attachments': 'Attachments',
    'detail.timeline': 'Timeline',
    'detail.comments': 'Comments',
    'detail.noAttachments': 'No attachments uploaded.',
    'detail.noEvents': 'No workflow events yet.',
    'detail.noComments': 'No internal comments yet.',
    'detail.actions': 'Decision actions',
    'detail.approve': 'Approve',
    'detail.reject': 'Reject',
    'detail.requestInfoAction': 'Request info',
    'detail.updatedAt': 'Last updated',
  },
  ar: {
    pageTitle: 'صندوق وارد الطلبات',
    pageSubtitle: 'تابع جميع الطلبات الواردة وقم بفرزها واتخاذ الإجراءات المناسبة.',
    'filters.status': 'الحالة',
    'filters.type': 'النوع',
    'filters.dateFrom': 'من تاريخ',
    'filters.dateTo': 'إلى تاريخ',
    'filters.minAmount': 'الحد الأدنى للمبلغ',
    'filters.maxAmount': 'الحد الأعلى للمبلغ',
    'filters.searchPlaceholder': 'ابحث برقم الطلب أو اسم المستثمر…',
    'filters.reset': 'إعادة تعيين',
    'filters.apply': 'تطبيق',
    'sort.label': 'ترتيب حسب',
    'sort.created': 'تاريخ الإنشاء',
    'sort.amount': 'المبلغ',
    'sort.status': 'الحالة',
    'status.all': 'الكل',
    'status.draft': 'مسودة',
    'status.submitted': 'مُرسَل',
    'status.screening': 'تصفية أولية',
    'status.pending_info': 'بانتظار معلومات',
    'status.compliance_review': 'مراجعة التزام',
    'status.approved': 'موافق عليه',
    'status.rejected': 'مرفوض',
    'status.settling': 'قيد التسوية',
    'status.completed': 'مكتمل',
    'type.all': 'الكل',
    'type.buy': 'شراء',
    'type.sell': 'بيع',
    'table.requestNumber': 'رقم الطلب',
    'table.investor': 'المستثمر',
    'table.amount': 'المبلغ',
    'table.status': 'الحالة',
    'table.createdAt': 'تاريخ الإنشاء',
    'table.emptyTitle': 'لا توجد طلبات حتى الآن',
    'table.emptySubtitle':
      'عند قيام المستثمرين بتقديم طلباتهم ستظهر هنا تلقائياً.',
    'table.error': 'تعذر تحميل الطلبات. حاول مرة أخرى.',
    'table.loading': 'جاري تحميل الطلبات…',
    'pagination.previous': 'السابق',
    'pagination.next': 'التالي',
    'detail.title': 'تفاصيل الطلب',
    'detail.back': 'العودة إلى الصندوق',
    'detail.requestInfo': 'معلومات الطلب',
    'detail.investorInfo': 'بيانات المستثمر',
    'detail.notes': 'ملاحظات داخلية',
    'detail.attachments': 'المرفقات',
    'detail.timeline': 'سجل الأحداث',
    'detail.comments': 'التعليقات الداخلية',
    'detail.noAttachments': 'لم يتم رفع أي مرفقات.',
    'detail.noEvents': 'لا يوجد سجل أحداث بعد.',
    'detail.noComments': 'لا توجد تعليقات داخلية بعد.',
    'detail.actions': 'إجراءات القرار',
    'detail.approve': 'قبول',
    'detail.reject': 'رفض',
    'detail.requestInfoAction': 'طلب معلومات',
    'detail.updatedAt': 'آخر تحديث',
  },
};

export function tAdminRequests(
  key: MessageKey,
  language: InvestorLanguage = 'ar'
): string {
  return messages[language][key] ?? messages.en[key] ?? key;
}

