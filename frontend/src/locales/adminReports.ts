import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'pageTitle'
  | 'pageSubtitle'
  | 'filters.title'
  | 'filters.from'
  | 'filters.to'
  | 'filters.status'
  | 'filters.type'
  | 'filters.amount'
  | 'filters.status.all'
  | 'filters.type.all'
  | 'filters.type.buy'
  | 'filters.type.sell'
  | 'filters.type.partnership'
  | 'filters.type.board_nomination'
  | 'filters.type.feedback'
  | 'filters.apply'
  | 'filters.reset'
  | 'actions.download'
  | 'table.request'
  | 'table.status'
  | 'table.type'
  | 'table.amount'
  | 'table.investor'
  | 'table.created'
  | 'table.updated'
  | 'table.empty'
  | 'toast.loadError'
  | 'toast.downloadError'
  | 'toast.downloadSuccess'
  | 'meta.generatedAt';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    pageTitle: 'Request reports',
    pageSubtitle:
      'Generate export-ready snapshots of investor requests with advanced filters.',
    'filters.title': 'Filters',
    'filters.from': 'From date',
    'filters.to': 'To date',
    'filters.status': 'Status',
    'filters.type': 'Request type',
    'filters.amount': 'Amount range (SAR)',
    'filters.status.all': 'All statuses',
    'filters.type.all': 'All types',
    'filters.type.buy': 'Buy requests',
    'filters.type.sell': 'Sell requests',
    'filters.type.partnership': 'Partnership requests',
    'filters.type.board_nomination': 'Board nomination requests',
    'filters.type.feedback': 'Feedback requests',
    'filters.apply': 'Apply filters',
    'filters.reset': 'Reset',
    'actions.download': 'Download CSV',
    'table.request': 'Request #',
    'table.status': 'Status',
    'table.type': 'Type',
    'table.amount': 'Amount',
    'table.investor': 'Investor',
    'table.created': 'Created at',
    'table.updated': 'Updated at',
    'table.empty': 'No requests match your filters.',
    'toast.loadError': 'Failed to load report data.',
    'toast.downloadError': 'Failed to download CSV report.',
    'toast.downloadSuccess': 'CSV report downloaded.',
    'meta.generatedAt': 'Generated at',
  },
  ar: {
    pageTitle: 'تقارير الطلبات',
    pageSubtitle:
      'أنشئ تقارير جاهزة للتصدير حول طلبات المستثمرين مع فلاتر متقدمة.',
    'filters.title': 'الفلاتر',
    'filters.from': 'من تاريخ',
    'filters.to': 'إلى تاريخ',
    'filters.status': 'الحالة',
    'filters.type': 'نوع الطلب',
    'filters.amount': 'نطاق المبلغ (ريال)',
    'filters.status.all': 'جميع الحالات',
    'filters.type.all': 'كل الأنواع',
    'filters.type.buy': 'طلبات شراء',
    'filters.type.sell': 'طلبات بيع',
    'filters.type.partnership': 'طلبات شراكة',
    'filters.type.board_nomination': 'طلبات ترشيح مجلس الإدارة',
    'filters.type.feedback': 'طلبات ملاحظات',
    'filters.apply': 'تطبيق الفلاتر',
    'filters.reset': 'إعادة التعيين',
    'actions.download': 'تنزيل CSV',
    'table.request': 'رقم الطلب',
    'table.status': 'الحالة',
    'table.type': 'النوع',
    'table.amount': 'المبلغ',
    'table.investor': 'المستثمر',
    'table.created': 'تاريخ الإنشاء',
    'table.updated': 'آخر تحديث',
    'table.empty': 'لا توجد طلبات مطابقة للمعايير.',
    'toast.loadError': 'تعذّر تحميل بيانات التقرير.',
    'toast.downloadError': 'فشل تنزيل تقرير CSV.',
    'toast.downloadSuccess': 'تم تنزيل تقرير CSV.',
    'meta.generatedAt': 'تاريخ التوليد',
  },
};

export function tAdminReports(
  key: MessageKey,
  language: InvestorLanguage = 'ar'
): string {
  return messages[language][key] ?? messages.en[key] ?? key;
}

