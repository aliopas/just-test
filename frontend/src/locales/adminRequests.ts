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
  | 'filters.newRequests'
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
  | 'type.partnership'
  | 'type.board_nomination'
  | 'type.feedback'
  | 'table.requestNumber'
  | 'table.type'
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
  | 'detail.commentPlaceholder'
  | 'detail.commentSubmit'
  | 'detail.commentUnknownActor'
  | 'detail.settlement'
  | 'detail.settlementReference'
  | 'detail.settlementStartedAt'
  | 'detail.settlementCompletedAt'
  | 'detail.attachmentCategory.general'
  | 'detail.attachmentCategory.settlement'
  | 'detail.startSettlement'
  | 'detail.completeSettlement'
  | 'detail.noteHelper'
  | 'detail.noAttachments'
  | 'detail.noEvents'
  | 'detail.noComments'
  | 'detail.actions'
  | 'detail.approve'
  | 'detail.reject'
  | 'detail.requestInfoAction'
  | 'detail.moveToScreening'
  | 'detail.moveToCompliance'
  | 'detail.updatedAt'
  | 'decision.approvedSuccess'
  | 'decision.rejectedSuccess'
  | 'decision.infoRequestedSuccess'
  | 'decision.screeningSuccess'
  | 'decision.complianceSuccess'
  | 'decision.settlementStartedSuccess'
  | 'decision.settlementCompletedSuccess'
  | 'decision.notePlaceholder'
  | 'decision.noteRequired'
  | 'decision.referenceLabel'
  | 'decision.referencePlaceholder'
  | 'decision.referenceRequired'
  | 'comment.addSuccess'
  | 'comment.addError'
  | 'comment.required';

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
    'filters.newRequests': 'New requests only',
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
    'type.partnership': 'Partnership',
    'type.board_nomination': 'Board Nomination',
    'type.feedback': 'Feedback',
    'table.requestNumber': 'Request #',
    'table.type': 'Type',
    'table.investor': 'Investor',
    'table.amount': 'Amount/Subject',
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
    'detail.commentPlaceholder': 'Share an internal update or note for the review team…',
    'detail.commentSubmit': 'Add Comment',
    'detail.commentUnknownActor': 'Unknown user',
    'detail.settlement': 'Settlement tracking',
    'detail.settlementReference': 'Settlement reference',
    'detail.settlementStartedAt': 'Settlement started',
    'detail.settlementCompletedAt': 'Settlement completed',
    'detail.attachmentCategory.general': 'General attachment',
    'detail.attachmentCategory.settlement': 'Settlement document',
    'detail.startSettlement': 'Start settlement',
    'detail.completeSettlement': 'Mark as settled',
    'detail.noteHelper': 'Use the note field to add context. Notes are required when requesting info.',
    'detail.noAttachments': 'No attachments uploaded.',
    'detail.noEvents': 'No workflow events yet.',
    'detail.noComments': 'No internal comments yet.',
    'detail.actions': 'Decision actions',
    'detail.approve': 'Approve',
    'detail.reject': 'Reject',
    'detail.requestInfoAction': 'Request info',
    'detail.moveToScreening': 'Move to screening',
    'detail.moveToCompliance': 'Move to compliance review',
    'detail.updatedAt': 'Last updated',
    'decision.approvedSuccess': 'Request approved successfully',
    'decision.rejectedSuccess': 'Request rejected successfully',
    'decision.infoRequestedSuccess': 'Information request sent successfully',
    'decision.screeningSuccess': 'Request moved to screening.',
    'decision.complianceSuccess': 'Request moved to compliance review.',
    'decision.settlementStartedSuccess': 'تم تعليم عملية التسوية كمبدوءة.',
    'decision.settlementCompletedSuccess': 'اكتملت عملية التسوية وتم إغلاق الطلب.',
    'decision.notePlaceholder': 'Add an internal note (optional, max 500 characters)…',
    'decision.noteRequired': 'Please enter a message before requesting additional information.',
    'decision.referenceLabel': 'Settlement reference',
    'decision.referencePlaceholder': 'Enter settlement reference…',
    'decision.referenceRequired': 'Settlement reference is required.',
    'comment.addSuccess': 'Comment added successfully.',
    'comment.addError': 'Failed to add comment. Please try again.',
    'comment.required': 'Please enter a comment before submitting.',
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
    'filters.newRequests': 'الطلبات الجديدة فقط',
    'filters.searchPlaceholder': 'ابحث برقم الطلب أو اسم المستثمر…',
    'filters.reset': 'إعادة تعيين',
    'filters.apply': 'تطبيق',
    'sort.label': 'ترتيب حسب',
    'sort.created': 'تاريخ الإنشاء',
    'sort.amount': 'المبلغ',
    'sort.status': 'الحالة',
    'status.all': 'الكل',
    'status.draft': 'مسودة',
    'status.submitted': 'مُرسل',
    'status.screening': 'تحت المراجعة',
    'status.pending_info': 'بانتظار معلومات',
    'status.compliance_review': 'مراجعة التزام',
    'status.approved': 'موافق عليه',
    'status.rejected': 'مرفوض',
    'status.settling': 'قيد التسوية',
    'status.completed': 'مكتمل',
    'type.all': 'الكل',
    'type.buy': 'شراء',
    'type.sell': 'بيع',
    'type.partnership': 'شراكة',
    'type.board_nomination': 'ترشيح مجلس',
    'type.feedback': 'ملاحظات',
    'table.requestNumber': 'رقم الطلب',
    'table.type': 'النوع',
    'table.investor': 'المستثمر',
    'table.amount': 'المبلغ/الموضوع',
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
    'detail.commentPlaceholder': 'شارك تحديثاً داخلياً أو ملاحظة لفريق المراجعة…',
    'detail.commentSubmit': 'إضافة تعليق',
    'detail.commentUnknownActor': 'مستخدم غير معروف',
    'detail.settlement': 'تتبع التسوية',
    'detail.settlementReference': 'مرجع التسوية',
    'detail.settlementStartedAt': 'تاريخ بدء التسوية',
    'detail.settlementCompletedAt': 'تاريخ إكمال التسوية',
    'detail.attachmentCategory.general': 'مرفق عام',
    'detail.attachmentCategory.settlement': 'مستند تسوية',
    'detail.startSettlement': 'بدء التسوية',
    'detail.completeSettlement': 'تأكيد إتمام التسوية',
    'detail.noteHelper': 'استخدم حقل الملاحظات لإضافة سياق، وهو مطلوب عند طلب معلومات إضافية.',
    'detail.noAttachments': 'لم يتم رفع أي مرفقات.',
    'detail.noEvents': 'لا يوجد سجل أحداث بعد.',
    'detail.noComments': 'لا توجد تعليقات داخلية بعد.',
    'detail.actions': 'إجراءات القرار',
    'detail.approve': 'قبول',
    'detail.reject': 'رفض',
    'detail.requestInfoAction': 'طلب معلومات',
    'detail.moveToScreening': 'نقل إلى تحت المراجعة',
    'detail.moveToCompliance': 'نقل إلى مراجعة الالتزام',
    'detail.updatedAt': 'آخر تحديث',
    'decision.approvedSuccess': 'تمت الموافقة على الطلب بنجاح',
    'decision.rejectedSuccess': 'تم رفض الطلب بنجاح',
    'decision.infoRequestedSuccess': 'تم إرسال طلب المعلومات الإضافية بنجاح',
    'decision.screeningSuccess': 'تم نقل الطلب إلى مرحلة تحت المراجعة.',
    'decision.complianceSuccess': 'تم نقل الطلب إلى مرحلة مراجعة الالتزام.',
    'decision.settlementStartedSuccess': 'تم تعليم عملية التسوية كمبدوءة.',
    'decision.settlementCompletedSuccess': 'اكتملت عملية التسوية وتم إغلاق الطلب.',
    'decision.notePlaceholder': 'أضف ملاحظة داخلية (اختياري، بحد أقصى 500 حرف)…',
    'decision.noteRequired': 'يرجى إدخال رسالة قبل طلب معلومات إضافية.',
    'decision.referenceLabel': 'مرجع التسوية',
    'decision.referencePlaceholder': 'أدخل مرجع التسوية…',
    'decision.referenceRequired': 'مرجع التسوية مطلوب.',
    'comment.addSuccess': 'تمت إضافة التعليق بنجاح.',
    'comment.addError': 'فشل في إضافة التعليق، حاول مرة أخرى.',
    'comment.required': 'يرجى كتابة التعليق قبل الإرسال.',
  },
};

export function tAdminRequests(
  key: MessageKey,
  language: InvestorLanguage = 'ar'
): string {
  return messages[language][key] ?? messages.en[key] ?? key;
}


