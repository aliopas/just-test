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
  | 'lastUpdated'
  | 'kpis.title'
  | 'kpis.subtitle'
  | 'kpis.processing.title'
  | 'kpis.processing.average'
  | 'kpis.processing.median'
  | 'kpis.processing.p90'
  | 'kpis.pendingInfo.title'
  | 'kpis.pendingInfo.total'
  | 'kpis.pendingInfo.overdue'
  | 'kpis.pendingInfo.rate'
  | 'kpis.pendingInfo.threshold'
  | 'kpis.attachments.title'
  | 'kpis.attachments.completed'
  | 'kpis.attachments.total'
  | 'kpis.attachments.rate'
  | 'kpis.notifications.title'
  | 'kpis.notifications.failed'
  | 'kpis.notifications.total'
  | 'kpis.notifications.rate'
  | 'kpis.notifications.window'
  | 'kpis.alerts.title';

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
    'kpis.title': 'Operational KPIs',
    'kpis.subtitle': 'Live indicators updated each refresh.',
    'kpis.processing.title': 'Processing time',
    'kpis.processing.average': 'Average (hrs)',
    'kpis.processing.median': 'Median (hrs)',
    'kpis.processing.p90': '90th percentile (hrs)',
    'kpis.pendingInfo.title': 'Pending info backlog',
    'kpis.pendingInfo.total': 'Total pending',
    'kpis.pendingInfo.overdue': 'Over SLA',
    'kpis.pendingInfo.rate': 'Overdue rate',
    'kpis.pendingInfo.threshold': 'Threshold',
    'kpis.attachments.title': 'Attachment success',
    'kpis.attachments.completed': 'Requests with uploads',
    'kpis.attachments.total': 'Requests requiring uploads',
    'kpis.attachments.rate': 'Success rate',
    'kpis.notifications.title': 'Notification failures',
    'kpis.notifications.failed': 'Failed jobs',
    'kpis.notifications.total': 'Total jobs',
    'kpis.notifications.rate': 'Failure rate',
    'kpis.notifications.window': 'Window',
    'kpis.alerts.title': 'Attention needed',
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
    'kpis.title': 'المؤشرات التشغيلية',
    'kpis.subtitle': 'مؤشرات محدّثة عند كل تحديث للصفحة.',
    'kpis.processing.title': 'وقت المعالجة',
    'kpis.processing.average': 'المتوسط (ساعات)',
    'kpis.processing.median': 'الوسيط (ساعات)',
    'kpis.processing.p90': 'النسبة المئوية 90 (ساعات)',
    'kpis.pendingInfo.title': 'طلبات Pending Info',
    'kpis.pendingInfo.total': 'إجمالي الطلبات',
    'kpis.pendingInfo.overdue': 'متجاوز SLA',
    'kpis.pendingInfo.rate': 'نسبة التأخر',
    'kpis.pendingInfo.threshold': 'عتبة SLA',
    'kpis.attachments.title': 'نجاح رفع المرفقات',
    'kpis.attachments.completed': 'طلبات تم الرفع لها',
    'kpis.attachments.total': 'طلبات تتطلب رفعاً',
    'kpis.attachments.rate': 'نسبة النجاح',
    'kpis.notifications.title': 'فشل الإشعارات',
    'kpis.notifications.failed': 'عدد الفشل',
    'kpis.notifications.total': 'إجمالي المهام',
    'kpis.notifications.rate': 'نسبة الفشل',
    'kpis.notifications.window': 'الفترة',
    'kpis.alerts.title': 'مؤشرات تتطلب الانتباه',
  },
};

export function tAdminDashboard(
  key: MessageKey,
  language: InvestorLanguage = 'ar'
): string {
  return messages[language][key] ?? messages.en[key] ?? key;
}

