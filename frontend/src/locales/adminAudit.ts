import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'pageTitle'
  | 'pageSubtitle'
  | 'filters.title'
  | 'filters.dateFrom'
  | 'filters.dateTo'
  | 'filters.actor'
  | 'filters.action'
  | 'filters.resourceType'
  | 'filters.resourceId'
  | 'filters.apply'
  | 'filters.reset'
  | 'table.timestamp'
  | 'table.actor'
  | 'table.email'
  | 'table.action'
  | 'table.resource'
  | 'table.diff'
  | 'table.ip'
  | 'table.userAgent'
  | 'table.empty'
  | 'toast.loadError'
  | 'modal.diffTitle'
  | 'pagination.page'
  | 'pagination.of';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    pageTitle: 'Audit log',
    pageSubtitle:
      'Investigate operational activity by actor, resource, or timeframe.',
    'filters.title': 'Filters',
    'filters.dateFrom': 'From date',
    'filters.dateTo': 'To date',
    'filters.actor': 'Actor (User ID)',
    'filters.action': 'Action',
    'filters.resourceType': 'Resource type',
    'filters.resourceId': 'Resource ID',
    'filters.apply': 'Apply filters',
    'filters.reset': 'Reset',
    'table.timestamp': 'Timestamp',
    'table.actor': 'Actor',
    'table.email': 'Email',
    'table.action': 'Action',
    'table.resource': 'Resource',
    'table.diff': 'Diff',
    'table.ip': 'IP address',
    'table.userAgent': 'User agent',
    'table.empty': 'No audit entries match your filters.',
    'toast.loadError': 'Failed to load audit logs.',
    'modal.diffTitle': 'Change diff',
    'pagination.page': 'Page',
    'pagination.of': 'of',
  },
  ar: {
    pageTitle: 'سجل التدقيق',
    pageSubtitle:
      'تحقّق من عمليات المنصة حسب المستخدم أو المورد أو الإطار الزمني.',
    'filters.title': 'الفلاتر',
    'filters.dateFrom': 'من تاريخ',
    'filters.dateTo': 'إلى تاريخ',
    'filters.actor': 'المستخدم (معرّف)',
    'filters.action': 'الإجراء',
    'filters.resourceType': 'نوع المورد',
    'filters.resourceId': 'معرّف المورد',
    'filters.apply': 'تطبيق الفلاتر',
    'filters.reset': 'إعادة التعيين',
    'table.timestamp': 'الوقت',
    'table.actor': 'المستخدم',
    'table.email': 'البريد الإلكتروني',
    'table.action': 'الإجراء',
    'table.resource': 'المورد',
    'table.diff': 'التغييرات',
    'table.ip': 'عنوان IP',
    'table.userAgent': 'وكيل المستخدم',
    'table.empty': 'لا توجد سجلات مطابقة للمعايير.',
    'toast.loadError': 'تعذّر تحميل سجل التدقيق.',
    'modal.diffTitle': 'التغييرات',
    'pagination.page': 'الصفحة',
    'pagination.of': 'من',
  },
};

export function tAdminAudit(
  key: MessageKey,
  language: InvestorLanguage = 'ar'
): string {
  return messages[language][key] ?? messages.en[key] ?? key;
}

