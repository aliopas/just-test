import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'pageTitle'
  | 'summary.total'
  | 'summary.average'
  | 'summary.median'
  | 'summary.byStatus'
  | 'trend.title'
  | 'trend.subtitle'
  | 'stuck.title'
  | 'stuck.subtitle'
  | 'stuck.empty'
  | 'stuck.request'
  | 'stuck.status'
  | 'stuck.investor'
  | 'stuck.age'
  | 'stuck.view'
  | 'toast.error'
  | 'lastUpdated';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    pageTitle: 'Operations dashboard',
    'summary.total': 'Total requests',
    'summary.average': 'Avg. processing time (hrs)',
    'summary.median': 'Median processing time (hrs)',
    'summary.byStatus': 'Requests by status',
    'trend.title': 'New requests trend',
    'trend.subtitle': 'Last two weeks',
    'stuck.title': 'Stuck requests',
    'stuck.subtitle': 'Older than SLA threshold',
    'stuck.empty': 'No stuck requests 🎉',
    'stuck.request': 'Request',
    'stuck.status': 'Status',
    'stuck.investor': 'Investor',
    'stuck.age': 'Age (hrs)',
    'stuck.view': 'Open request',
    'toast.error': 'Failed to load dashboard stats.',
    lastUpdated: 'Last updated',
  },
  ar: {
    pageTitle: 'لوحة عمليات الإدارة',
    'summary.total': 'إجمالي الطلبات',
    'summary.average': 'متوسط وقت المعالجة (ساعة)',
    'summary.median': 'الوسيط لوقت المعالجة (ساعة)',
    'summary.byStatus': 'الطلبات حسب الحالة',
    'trend.title': 'اتجاه الطلبات الجديدة',
    'trend.subtitle': 'آخر أسبوعين',
    'stuck.title': 'طلبات متعثرة',
    'stuck.subtitle': 'أقدم من الوقت المسموح',
    'stuck.empty': 'لا توجد طلبات متعثرة 🎉',
    'stuck.request': 'رقم الطلب',
    'stuck.status': 'الحالة',
    'stuck.investor': 'المستثمر',
    'stuck.age': 'العمر (ساعات)',
    'stuck.view': 'عرض الطلب',
    'toast.error': 'تعذر تحميل إحصائيات اللوحة.',
    lastUpdated: 'آخر تحديث',
  },
};

export function tAdminDashboard(
  key: MessageKey,
  language: InvestorLanguage = 'ar'
): string {
  return messages[language][key] ?? messages.en[key] ?? key;
}

