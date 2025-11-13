import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'pageTitle'
  | 'pageSubtitle'
  | 'list.emptyTitle'
  | 'list.emptySubtitle'
  | 'list.searchPlaceholder'
  | 'list.audience.all'
  | 'list.audience.public'
  | 'list.audience.investor_internal'
  | 'list.status.all'
  | 'list.status.draft'
  | 'list.status.pending_review'
  | 'list.status.scheduled'
  | 'list.status.published'
  | 'list.status.rejected'
  | 'list.status.archived'
  | 'list.actions.new'
  | 'list.actions.publishScheduled'
  | 'table.title'
  | 'table.status'
  | 'table.audience'
  | 'table.scheduledAt'
  | 'table.publishedAt'
  | 'table.updatedAt'
  | 'table.actions'
  | 'table.edit'
  | 'table.delete'
  | 'table.approve'
  | 'table.reject'
  | 'table.reviewHistory'
  | 'table.noReviews'
  | 'table.reviewedAt'
  | 'table.reviewer'
  | 'table.reviewComment'
  | 'table.loading'
  | 'table.error'
  | 'form.drawerTitle.create'
  | 'form.drawerTitle.edit'
  | 'form.title'
  | 'form.slug'
  | 'form.status'
  | 'form.audience.label'
  | 'form.audience.public'
  | 'form.audience.investor_internal'
  | 'form.audience.helper'
  | 'form.body'
  | 'form.cover'
  | 'form.coverHint'
  | 'form.attachments.label'
  | 'form.attachments.helper'
  | 'form.attachments.upload'
  | 'form.attachments.empty'
  | 'form.attachments.remove'
  | 'form.attachments.uploading'
  | 'form.attachments.type.document'
  | 'form.attachments.type.image'
  | 'form.scheduleLabel'
  | 'form.schedulePlaceholder'
  | 'form.publishAtLabel'
  | 'form.save'
  | 'form.cancel'
  | 'form.deleteConfirmTitle'
  | 'form.deleteConfirmMessage'
  | 'form.deleteConfirmAccept'
  | 'form.validation.scheduleRequired'
  | 'form.validation.publishRequired'
  | 'toast.created'
  | 'toast.updated'
  | 'toast.deleted'
  | 'toast.published'
  | 'toast.publishError'
  | 'toast.presignError'
  | 'toast.presignAttachmentError'
  | 'toast.uploadError'
  | 'toast.saveError'
  | 'toast.approved'
  | 'toast.rejected'
  | 'toast.approveError'
  | 'toast.rejectError'
  | 'toast.reviewCommentRequired'
  | 'prompt.approveComment'
  | 'prompt.rejectComment'
  | 'pagination.previous'
  | 'pagination.next';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    pageTitle: 'News & Announcements',
    pageSubtitle:
      'Create, schedule, and publish investor-facing updates with cover images and Markdown content.',
    'list.emptyTitle': 'No news items yet',
    'list.emptySubtitle':
      'Start by creating your first announcement and it will appear here.',
    'list.searchPlaceholder': 'Search by title or slug…',
    'list.audience.all': 'All audiences',
    'list.audience.public': 'Public landing content',
    'list.audience.investor_internal': 'Investor internal updates',
    'list.status.all': 'All statuses',
    'list.status.draft': 'Draft',
    'list.status.pending_review': 'Pending review',
    'list.status.scheduled': 'Scheduled',
    'list.status.published': 'Published',
    'list.status.rejected': 'Rejected',
    'list.status.archived': 'Archived',
    'list.actions.new': 'Create news',
    'list.actions.publishScheduled': 'Publish scheduled items',
    'table.title': 'Title',
    'table.status': 'Status',
    'table.audience': 'Audience',
    'table.scheduledAt': 'Scheduled',
    'table.publishedAt': 'Published',
    'table.updatedAt': 'Updated',
    'table.actions': 'Actions',
    'table.edit': 'Edit',
    'table.delete': 'Delete',
    'table.approve': 'Approve',
    'table.reject': 'Reject',
    'table.reviewHistory': 'Review history',
    'table.noReviews': 'No review decisions yet.',
    'table.reviewedAt': 'Reviewed at',
    'table.reviewer': 'Reviewer',
    'table.reviewComment': 'Comment',
    'table.loading': 'Loading news…',
    'table.error': 'Failed to load news. Please try again.',
    'form.drawerTitle.create': 'Create news item',
    'form.drawerTitle.edit': 'Edit news item',
    'form.title': 'Title',
    'form.slug': 'Slug',
    'form.status': 'Status',
    'form.audience.label': 'Target audience',
    'form.audience.public': 'Public (landing page)',
    'form.audience.investor_internal': 'Investor portal (internal)',
    'form.audience.helper':
      'Internal audience items require sign-in and may include private documents.',
    'form.body': 'Content (Markdown supported)',
    'form.cover': 'Cover image',
    'form.coverHint':
      'Upload a high quality image. Recommended formats: PNG, JPG, WEBP. Max 10MB.',
    'form.attachments.label': 'Supporting documents & media',
    'form.attachments.helper':
      'Upload PDF, Office documents, ZIP archives, or additional images (max 25MB each).',
    'form.attachments.upload': 'Upload attachments',
    'form.attachments.empty': 'No attachments added yet.',
    'form.attachments.remove': 'Remove',
    'form.attachments.uploading': 'Uploading attachments…',
    'form.attachments.type.document': 'Document',
    'form.attachments.type.image': 'Image',
    'form.scheduleLabel': 'Schedule at',
    'form.schedulePlaceholder': 'Select date & time',
    'form.publishAtLabel': 'Published at',
    'form.save': 'Save',
    'form.cancel': 'Cancel',
    'form.deleteConfirmTitle': 'Delete news item?',
    'form.deleteConfirmMessage':
      'Are you sure you want to delete this news item? This action cannot be undone.',
    'form.deleteConfirmAccept': 'Delete permanently',
    'form.validation.scheduleRequired':
      'Scheduled items must include a scheduled date/time.',
    'form.validation.publishRequired':
      'Published items must include a publish date/time.',
    'toast.created': 'News item created successfully.',
    'toast.updated': 'News item updated successfully.',
    'toast.deleted': 'News item deleted successfully.',
    'toast.published': 'Scheduled news published successfully.',
    'toast.publishError': 'Failed to publish scheduled news.',
    'toast.presignError': 'Failed to prepare image upload. Please retry.',
    'toast.presignAttachmentError':
      'Failed to prepare attachment upload. Please retry.',
    'toast.uploadError': 'Failed to upload image. Please retry.',
    'toast.saveError': 'Failed to save news item. Please retry.',
    'toast.approved': 'News item approved successfully.',
    'toast.rejected': 'News item rejected successfully.',
    'toast.approveError': 'Failed to approve news item. Please retry.',
    'toast.rejectError': 'Failed to reject news item. Please retry.',
    'toast.reviewCommentRequired': 'Please provide a rejection comment before continuing.',
    'prompt.approveComment':
      'Add an optional note for approval (leave empty to skip)…',
    'prompt.rejectComment': 'Provide a rejection comment (required)…',
    'pagination.previous': 'Previous',
    'pagination.next': 'Next',
  },
  ar: {
    pageTitle: 'إدارة الأخبار والإعلانات',
    pageSubtitle:
      'قم بإنشاء وجدولة ونشر التحديثات الموجهة للمستثمرين مع الصور والمحتوى بنسق Markdown.',
    'list.emptyTitle': 'لا توجد أخبار بعد',
    'list.emptySubtitle':
      'ابدأ بإنشاء أول إعلان وسيظهر هنا بمجرد حفظه.',
    'list.searchPlaceholder': 'ابحث بالعنوان أو بالمعرّف (slug)…',
    'list.audience.all': 'جميع الفئات',
    'list.audience.public': 'محتوى عام للصفحة الرئيسية',
    'list.audience.investor_internal': 'تحديثات داخلية للمستثمرين',
    'list.status.all': 'جميع الحالات',
    'list.status.draft': 'مسودة',
    'list.status.pending_review': 'قيد المراجعة',
    'list.status.scheduled': 'مجدول',
    'list.status.published': 'منشور',
    'list.status.rejected': 'مرفوض',
    'list.status.archived': 'مؤرشف',
    'list.actions.new': 'إنشاء خبر',
    'list.actions.publishScheduled': 'نشر العناصر المجدولة',
    'table.title': 'العنوان',
    'table.status': 'الحالة',
    'table.audience': 'الفئة المستهدفة',
    'table.scheduledAt': 'موعد الجدولة',
    'table.publishedAt': 'تاريخ النشر',
    'table.updatedAt': 'آخر تحديث',
    'table.actions': 'إجراءات',
    'table.edit': 'تعديل',
    'table.delete': 'حذف',
    'table.approve': 'موافقة',
    'table.reject': 'رفض',
    'table.reviewHistory': 'سجل المراجعات',
    'table.noReviews': 'لا توجد قرارات مراجعة حتى الآن.',
    'table.reviewedAt': 'تاريخ المراجعة',
    'table.reviewer': 'المراجع',
    'table.reviewComment': 'الملاحظة',
    'table.loading': 'جارٍ تحميل الأخبار…',
    'table.error': 'تعذر تحميل الأخبار، حاول مرة أخرى.',
    'form.drawerTitle.create': 'إنشاء خبر',
    'form.drawerTitle.edit': 'تعديل خبر',
    'form.title': 'العنوان',
    'form.slug': 'المعرّف (slug)',
    'form.status': 'الحالة',
    'form.audience.label': 'الفئة المستهدفة',
    'form.audience.public': 'عام (صفحة الهبوط)',
    'form.audience.investor_internal': 'داخلي (بوابة المستثمر)',
    'form.audience.helper':
      'العناصر الداخلية تظهر فقط للمستثمرين بعد تسجيل الدخول ويمكن أن تحتوي على مستندات خاصة.',
    'form.body': 'المحتوى (يدعم Markdown)',
    'form.cover': 'صورة الغلاف',
    'form.coverHint':
      'قم برفع صورة عالية الجودة. الصيغ المقترحة: PNG، JPG، WEBP. الحد الأقصى 10MB.',
    'form.attachments.label': 'المستندات والوسائط المساندة',
    'form.attachments.helper':
      'يمكنك رفع ملفات PDF أو مستندات Office أو ملفات ZIP أو صور إضافية (بحد أقصى 25MB لكل ملف).',
    'form.attachments.upload': 'رفع مرفقات',
    'form.attachments.empty': 'لا توجد مرفقات حتى الآن.',
    'form.attachments.remove': 'إزالة',
    'form.attachments.uploading': 'جارٍ رفع المرفقات…',
    'form.attachments.type.document': 'مستند',
    'form.attachments.type.image': 'صورة',
    'form.scheduleLabel': 'تاريخ/وقت الجدولة',
    'form.schedulePlaceholder': 'اختر التاريخ والوقت',
    'form.publishAtLabel': 'تاريخ النشر',
    'form.save': 'حفظ',
    'form.cancel': 'إلغاء',
    'form.deleteConfirmTitle': 'حذف الخبر؟',
    'form.deleteConfirmMessage':
      'هل أنت متأكد من حذف هذا الخبر؟ لا يمكن التراجع عن هذه العملية.',
    'form.deleteConfirmAccept': 'حذف نهائي',
    'form.validation.scheduleRequired':
      'يجب تحديد تاريخ ووقت للعنصر المجدول.',
    'form.validation.publishRequired':
      'يجب تحديد تاريخ ووقت للعنصر المنشور.',
    'toast.created': 'تم إنشاء الخبر بنجاح.',
    'toast.updated': 'تم تحديث الخبر بنجاح.',
    'toast.deleted': 'تم حذف الخبر بنجاح.',
    'toast.published': 'تم نشر الأخبار المجدولة بنجاح.',
    'toast.publishError': 'تعذر نشر الأخبار المجدولة.',
    'toast.presignError': 'تعذّر تحضير رفع الصورة، حاول مرة أخرى.',
    'toast.presignAttachmentError': 'تعذّر تحضير رفع المرفق، حاول مرة أخرى.',
    'toast.uploadError': 'تعذّر رفع الصورة، حاول مرة أخرى.',
    'toast.saveError': 'تعذّر حفظ الخبر، حاول مرة أخرى.',
    'toast.approved': 'تمت الموافقة على الخبر بنجاح.',
    'toast.rejected': 'تم رفض الخبر بنجاح.',
    'toast.approveError': 'تعذّرت الموافقة على الخبر، حاول مرة أخرى.',
    'toast.rejectError': 'تعذّر رفض الخبر، حاول مرة أخرى.',
    'toast.reviewCommentRequired': 'يرجى إدخال تعليق عند رفض الخبر.',
    'prompt.approveComment': 'أضف ملاحظة اختيارية للموافقة (اتركها فارغة للتخطي)…',
    'prompt.rejectComment': 'أدخل تعليق الرفض (مطلوب)…',
    'pagination.previous': 'السابق',
    'pagination.next': 'التالي',
  },
};

export function tAdminNews(key: MessageKey, language: InvestorLanguage) {
  return messages[language][key];
}


