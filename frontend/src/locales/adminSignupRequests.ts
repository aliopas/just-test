import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'page.title'
  | 'page.subtitle'
  | 'filters.status.label'
  | 'filters.status.all'
  | 'filters.search.placeholder'
  | 'table.fullName'
  | 'table.email'
  | 'table.phone'
  | 'table.company'
  | 'table.message'
  | 'table.status'
  | 'table.createdAt'
  | 'table.reviewedAt'
  | 'table.reviewer'
  | 'table.actions'
  | 'table.emptyTitle'
  | 'table.emptySubtitle'
  | 'table.loading'
  | 'table.error'
  | 'actions.approve'
  | 'actions.reject'
  | 'actions.viewDetails'
  | 'toast.approved'
  | 'toast.rejected'
  | 'status.pending'
  | 'status.approved'
  | 'status.rejected'
  | 'prompt.approveNote'
  | 'prompt.rejectNote'
  | 'prompt.sendInvite';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    'page.title': 'Investor signup requests',
    'page.subtitle':
      'Review and approve investor signup requests submitted from the public registration form.',
    'filters.status.label': 'Status',
    'filters.status.all': 'All statuses',
    'filters.search.placeholder': 'Search by name, email, or company…',
    'table.fullName': 'Full name',
    'table.email': 'Email',
    'table.phone': 'Phone',
    'table.company': 'Company',
    'table.message': 'Message',
    'table.status': 'Status',
    'table.createdAt': 'Submitted',
    'table.reviewedAt': 'Reviewed',
    'table.reviewer': 'Reviewer',
    'table.actions': 'Actions',
    'table.emptyTitle': 'No signup requests',
    'table.emptySubtitle':
      'When investors submit requests from the public form they will appear here.',
    'table.loading': 'Loading signup requests…',
    'table.error': 'Failed to load signup requests. Please retry.',
    'actions.approve': 'Approve',
    'actions.reject': 'Reject',
    'actions.viewDetails': 'View details',
    'toast.approved': 'Signup request approved and investor invited.',
    'toast.rejected': 'Signup request rejected.',
    'status.pending': 'Pending review',
    'status.approved': 'Approved',
    'status.rejected': 'Rejected',
    'prompt.approveNote': 'Add an optional note for the approval (optional)',
    'prompt.rejectNote': 'Please provide a reason for rejecting this request (optional)',
    'prompt.sendInvite': 'Send invitation email to the investor?',
  },
  ar: {
    'page.title': 'طلبات إنشاء حساب مستثمر',
    'page.subtitle':
      'قم بمراجعة طلبات التسجيل الواردة من النموذج العام واعتمادها أو رفضها.',
    'filters.status.label': 'الحالة',
    'filters.status.all': 'جميع الحالات',
    'filters.search.placeholder': 'ابحث بالاسم أو البريد أو الشركة…',
    'table.fullName': 'الاسم الكامل',
    'table.email': 'البريد الإلكتروني',
    'table.phone': 'الهاتف',
    'table.company': 'الجهة',
    'table.message': 'ملاحظات مقدم الطلب',
    'table.status': 'الحالة',
    'table.createdAt': 'تاريخ الإرسال',
    'table.reviewedAt': 'تاريخ المراجعة',
    'table.reviewer': 'المراجع',
    'table.actions': 'الإجراءات',
    'table.emptyTitle': 'لا توجد طلبات حالياً',
    'table.emptySubtitle':
      'عند إرسال طلبات تسجيل جديدة من النموذج العام ستظهر في هذه الصفحة.',
    'table.loading': 'جارٍ تحميل الطلبات…',
    'table.error': 'تعذر تحميل الطلبات، يرجى المحاولة مرة أخرى.',
    'actions.approve': 'اعتماد',
    'actions.reject': 'رفض',
    'actions.viewDetails': 'عرض التفاصيل',
    'toast.approved': 'تم اعتماد الطلب وإرسال دعوة للمستثمر.',
    'toast.rejected': 'تم رفض طلب التسجيل.',
    'status.pending': 'قيد المراجعة',
    'status.approved': 'معتمد',
    'status.rejected': 'مرفوض',
    'prompt.approveNote': 'أدخل ملاحظة لقرار الاعتماد (اختياري)',
    'prompt.rejectNote': 'أدخل سبب الرفض (اختياري)',
    'prompt.sendInvite': 'هل ترغب في إرسال دعوة بريدية للمستثمر؟',
  },
};

export function tAdminSignupRequests(key: MessageKey, language: InvestorLanguage): string {
  return messages[language][key];
}

