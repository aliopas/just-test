import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'pageTitle'
  | 'pendingActions.title'
  | 'pendingActions.subtitle'
  | 'pendingActions.empty'
  | 'recentActivity.title'
  | 'recentActivity.empty'
  | 'summary.total'
  | 'summary.pendingInfo'
  | 'summary.approved'
  | 'summary.rejected'
  | 'summary.settling'
  | 'summary.completed'
  | 'summary.screening'
  | 'summary.complianceReview'
  | 'summary.submitted'
  | 'summary.draft'
  | 'notifications.unreadLabel'
  | 'updatedAt'
  | 'viewRequest';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    pageTitle: 'Welcome back!',
    'pendingActions.title': 'Actions required',
    'pendingActions.subtitle':
      'Provide additional information to keep things moving.',
    'pendingActions.empty': 'You are all caught up. No pending items.',
    'recentActivity.title': 'Recent activity',
    'recentActivity.empty': 'No recent requests yet.',
    'summary.total': 'Total requests',
    'summary.pendingInfo': 'Pending info',
    'summary.approved': 'Approved',
    'summary.rejected': 'Rejected',
    'summary.settling': 'Settling',
    'summary.completed': 'Completed',
    'summary.screening': 'Screening',
    'summary.complianceReview': 'Compliance review',
    'summary.submitted': 'Submitted',
    'summary.draft': 'Drafts',
    'notifications.unreadLabel': 'Unread notifications',
    updatedAt: 'Updated',
    viewRequest: 'View request',
  },
  ar: {
    pageTitle: 'مرحباً بعودتك!',
    'pendingActions.title': 'إجراءات مطلوبة',
    'pendingActions.subtitle':
      'زوّدنا بالمعلومات الإضافية لاستمرار معالجة طلباتك.',
    'pendingActions.empty': 'لا توجد مهام معلّقة، كل شيء مكتمل.',
    'recentActivity.title': 'النشاط الأخير',
    'recentActivity.empty': 'لا يوجد نشاط حديث بعد.',
    'summary.total': 'إجمالي الطلبات',
    'summary.pendingInfo': 'بانتظار معلومات',
    'summary.approved': 'طلبات معتمدة',
    'summary.rejected': 'طلبات مرفوضة',
    'summary.settling': 'قيد التسوية',
    'summary.completed': 'طلبات مكتملة',
    'summary.screening': 'تحت المراجعة',
    'summary.complianceReview': 'مراجعة التزام',
    'summary.submitted': 'طلبات مرسلة',
    'summary.draft': 'مسودات',
    'notifications.unreadLabel': 'الإشعارات غير المقروءة',
    updatedAt: 'آخر تحديث',
    viewRequest: 'عرض الطلب',
  },
};

export function tDashboard(
  key: MessageKey,
  language: InvestorLanguage = 'ar'
): string {
  return messages[language][key] ?? messages.en[key] ?? key;
}

