import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'pageTitle'
  | 'pageSubtitle'
  | 'filters.all'
  | 'filters.unread'
  | 'filters.read'
  | 'actions.markAll'
  | 'badge.label'
  | 'list.loadMore'
  | 'list.loading'
  | 'empty.title'
  | 'empty.subtitle'
  | 'toast.loadError'
  | 'toast.markReadError'
  | 'toast.markAllSuccess'
  | 'toast.markAllError'
  | 'toast.preferencesLoadError'
  | 'toast.preferencesSaveSuccess'
  | 'toast.preferencesSaveError'
  | 'preferences.title'
  | 'preferences.subtitle'
  | 'preferences.channel.email'
  | 'preferences.channel.in_app'
  | 'preferences.channel.sms'
  | 'preferences.save'
  | 'preferences.reset'
  | 'preferences.changedNotice'
  | 'type.request_submitted.title'
  | 'type.request_submitted.body'
  | 'type.request_pending_info.title'
  | 'type.request_pending_info.body'
  | 'type.request_approved.title'
  | 'type.request_approved.body'
  | 'type.request_rejected.title'
  | 'type.request_rejected.body'
  | 'type.request_settling.title'
  | 'type.request_settling.body'
  | 'type.request_completed.title'
  | 'type.request_completed.body'
  // News & content notifications
  | 'type.news_published.title'
  | 'type.news_published.body'
  | 'type.news_approved.title'
  | 'type.news_approved.body'
  | 'type.news_rejected.title'
  | 'type.news_rejected.body';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    pageTitle: 'Notifications',
    pageSubtitle:
      'Stay informed about your requests and account activity with real-time updates.',
    'filters.all': 'All',
    'filters.unread': 'Unread',
    'filters.read': 'Read',
    'actions.markAll': 'Mark all as read',
    'badge.label': 'Notifications',
    'list.loadMore': 'Load more',
    'list.loading': 'Loading notifications…',
    'empty.title': 'You are all caught up!',
    'empty.subtitle':
      'You will see new notifications here whenever your requests change status or require action.',
    'toast.loadError': 'Unable to load notifications. Please try again.',
    'toast.markReadError': 'Unable to update this notification right now.',
    'toast.markAllSuccess': 'All notifications marked as read.',
    'toast.markAllError': 'Unable to mark notifications as read. Please retry.',
    'toast.preferencesLoadError':
      'Unable to load notification preferences. Please refresh the page.',
    'toast.preferencesSaveSuccess': 'Notification preferences saved successfully.',
    'toast.preferencesSaveError':
      'Unable to save notification preferences. Please try again.',
    'preferences.title': 'Notification Preferences',
    'preferences.subtitle':
      'Choose how you want to be notified for each request update. Changes apply immediately after saving.',
    'preferences.channel.email': 'Email',
    'preferences.channel.in_app': 'In-app',
    'preferences.channel.sms': 'SMS',
    'preferences.save': 'Save preferences',
    'preferences.reset': 'Reset to defaults',
    'preferences.changedNotice': 'There are unsaved changes.',
    'type.request_submitted.title': 'Request submitted',
    'type.request_submitted.body':
      'Your investment request {requestNumber} was received successfully.',
    'type.request_pending_info.title': 'Action required',
    'type.request_pending_info.body':
      'We need more information for request {requestNumber}.',
    'type.request_approved.title': 'Request approved',
    'type.request_approved.body':
      'Great news! Request {requestNumber} has been approved.',
    'type.request_rejected.title': 'Request rejected',
    'type.request_rejected.body':
      'Request {requestNumber} was not approved. Please review the details.',
    'type.request_settling.title': 'Settlement in progress',
    'type.request_settling.body':
      'Settlement has started for request {requestNumber}.',
    'type.request_completed.title': 'Settlement completed',
    'type.request_completed.body':
      'Settlement is complete for request {requestNumber}.',
    'type.news_published.title': 'New internal news',
    'type.news_published.body':
      '{title} has been published in your investor news feed.',
    'type.news_approved.title': 'News item approved',
    'type.news_approved.body':
      'Your news "{title}" has been approved and may now be visible to investors.',
    'type.news_rejected.title': 'News item rejected',
    'type.news_rejected.body':
      'Your news "{title}" was rejected. Review comments from the reviewer and update if needed.',
  },
  ar: {
    pageTitle: 'الإشعارات',
    pageSubtitle:
      'اطّلع على تحديثات طلباتك ونشاط حسابك فور حدوثها مع التنبيهات المباشرة.',
    'filters.all': 'الكل',
    'filters.unread': 'غير مقروءة',
    'filters.read': 'مقروءة',
    'actions.markAll': 'تحديد الكل كمقروء',
    'badge.label': 'الإشعارات',
    'list.loadMore': 'تحميل المزيد',
    'list.loading': 'جارٍ تحميل الإشعارات…',
    'empty.title': 'لا إشعارات جديدة',
    'empty.subtitle':
      'ستظهر الإشعارات هنا عندما يحدث تغيير على طلباتك أو يلزمك إجراء محدد.',
    'toast.loadError': 'تعذّر تحميل الإشعارات. يرجى المحاولة مرة أخرى.',
    'toast.markReadError': 'تعذّر تحديث حالة الإشعار الآن.',
    'toast.markAllSuccess': 'تم تحديد جميع الإشعارات كمقروءة.',
    'toast.markAllError': 'تعذّر تحديث الإشعارات. حاول مرة أخرى لاحقًا.',
    'toast.preferencesLoadError': 'تعذّر تحميل تفضيلات الإشعارات. يرجى تحديث الصفحة.',
    'toast.preferencesSaveSuccess': 'تم حفظ تفضيلات الإشعارات بنجاح.',
    'toast.preferencesSaveError': 'تعذّر حفظ تفضيلات الإشعارات. حاول مرة أخرى.',
    'preferences.title': 'تفضيلات الإشعارات',
    'preferences.subtitle':
      'اختر كيفية تلقي الإشعارات لكل تحديث على طلبك. يتم تطبيق التغييرات مباشرة بعد الحفظ.',
    'preferences.channel.email': 'البريد الإلكتروني',
    'preferences.channel.in_app': 'داخل المنصة',
    'preferences.channel.sms': 'رسائل SMS',
    'preferences.save': 'حفظ التفضيلات',
    'preferences.reset': 'استعادة الإعدادات الافتراضية',
    'preferences.changedNotice': 'هناك تغييرات غير محفوظة.',
    'type.request_submitted.title': 'تم إرسال الطلب',
    'type.request_submitted.body':
      'تم استلام طلبك رقم {requestNumber} بنجاح.',
    'type.request_pending_info.title': 'مطلوب إجراء',
    'type.request_pending_info.body':
      'نحتاج معلومات إضافية لطلبك رقم {requestNumber}.',
    'type.request_approved.title': 'تمت الموافقة على الطلب',
    'type.request_approved.body':
      'أخبار سارة! تمت الموافقة على طلبك رقم {requestNumber}.',
    'type.request_rejected.title': 'تم رفض الطلب',
    'type.request_rejected.body':
      'لم يتم اعتماد طلبك رقم {requestNumber}. يرجى مراجعة التفاصيل.',
    'type.request_settling.title': 'التسوية قيد التنفيذ',
    'type.request_settling.body':
      'بدأت عملية التسوية للطلب رقم {requestNumber}.',
    'type.request_completed.title': 'اكتملت عملية التسوية',
    'type.request_completed.body':
      'اكتملت التسوية للطلب رقم {requestNumber}.',
    'type.news_published.title': 'خبر داخلي جديد',
    'type.news_published.body':
      'تم نشر الخبر "{title}" في قسم أخبار المستثمرين.',
    'type.news_approved.title': 'تمت الموافقة على الخبر',
    'type.news_approved.body':
      'تمت الموافقة على خبرك "{title}" ويمكن أن يكون الآن ظاهرًا للمستثمرين.',
    'type.news_rejected.title': 'تم رفض الخبر',
    'type.news_rejected.body':
      'تم رفض خبرك "{title}". راجع ملاحظات المراجع وعدِّل المحتوى إذا لزم الأمر.',
  },
};

export function tNotifications(key: MessageKey, language: InvestorLanguage) {
  return messages[language][key];
}

