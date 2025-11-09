import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'pageTitle'
  | 'lastUpdated'
  | 'tabs.basic'
  | 'tabs.identity'
  | 'tabs.preferences'
  | 'fields.fullName'
  | 'fields.preferredName'
  | 'fields.language'
  | 'fields.idType'
  | 'fields.idNumber'
  | 'fields.idExpiry'
  | 'fields.nationality'
  | 'fields.residencyCountry'
  | 'fields.city'
  | 'fields.kycStatus'
  | 'fields.riskProfile'
  | 'fields.communication.email'
  | 'fields.communication.sms'
  | 'fields.communication.push'
  | 'fields.communication.title'
  | 'fields.documents.title'
  | 'fields.documents.helper'
  | 'actions.edit'
  | 'actions.save'
  | 'actions.cancel'
  | 'actions.refresh'
  | 'status.loading'
  | 'status.empty'
  | 'status.error'
  | 'status.noChanges'
  | 'toast.saved'
  | 'toast.error'
  | 'toast.uploadPlaceholder'
  | 'analytics.update'
  | 'language.switch.ar'
  | 'language.switch.en';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    pageTitle: 'Investor Profile',
    lastUpdated: 'Last updated',
    'tabs.basic': 'General',
    'tabs.identity': 'Identity & Compliance',
    'tabs.preferences': 'Preferences',
    'fields.fullName': 'Full name',
    'fields.preferredName': 'Preferred name',
    'fields.language': 'Preferred language',
    'fields.idType': 'Identification type',
    'fields.idNumber': 'Identification number',
    'fields.idExpiry': 'Expiry date',
    'fields.nationality': 'Nationality',
    'fields.residencyCountry': 'Country of residence',
    'fields.city': 'City',
    'fields.kycStatus': 'KYC status',
    'fields.riskProfile': 'Risk appetite',
    'fields.communication.email': 'Email notifications',
    'fields.communication.sms': 'SMS notifications',
    'fields.communication.push': 'In-app notifications',
    'fields.communication.title': 'Communication preferences',
    'fields.documents.title': 'KYC documents',
    'fields.documents.helper':
      'Upload identity documents (PDF/JPG/PNG, max 10 MB).',
    'actions.edit': 'Edit profile',
    'actions.save': 'Save changes',
    'actions.cancel': 'Cancel',
    'actions.refresh': 'Refresh',
    'status.loading': 'Loading profile…',
    'status.empty':
      'Your profile looks empty. Complete your information to unlock all features.',
    'status.error':
      'Something went wrong while loading your profile. Please try again.',
    'status.noChanges': 'No changes detected',
    'toast.saved': 'Profile updated successfully',
    'toast.error': 'Unable to update profile',
    'toast.uploadPlaceholder':
      'Document upload integration will be available soon.',
    'analytics.update': 'Investor profile updated',
    'language.switch.ar': 'العربية',
    'language.switch.en': 'English',
  },
  ar: {
    pageTitle: 'الملف الشخصي للمستثمر',
    lastUpdated: 'آخر تحديث',
    'tabs.basic': 'البيانات الأساسية',
    'tabs.identity': 'الهوية والتوثيق',
    'tabs.preferences': 'التفضيلات',
    'fields.fullName': 'الاسم الكامل',
    'fields.preferredName': 'الاسم المفضل',
    'fields.language': 'اللغة المفضلة',
    'fields.idType': 'نوع الهوية',
    'fields.idNumber': 'رقم الهوية',
    'fields.idExpiry': 'تاريخ الانتهاء',
    'fields.nationality': 'الجنسية',
    'fields.residencyCountry': 'دولة الإقامة',
    'fields.city': 'المدينة',
    'fields.kycStatus': 'حالة التحقق (KYC)',
    'fields.riskProfile': 'درجة تحمل المخاطر',
    'fields.communication.email': 'إشعارات البريد الإلكتروني',
    'fields.communication.sms': 'إشعارات الرسائل النصية',
    'fields.communication.push': 'إشعارات داخل المنصة',
    'fields.communication.title': 'تفضيلات التواصل',
    'fields.documents.title': 'وثائق التحقق KYC',
    'fields.documents.helper':
      'قم برفع مستندات الهوية (PDF/JPG/PNG، بحد أقصى 10 ميغابايت).',
    'actions.edit': 'تعديل الملف',
    'actions.save': 'حفظ التغييرات',
    'actions.cancel': 'إلغاء',
    'actions.refresh': 'إعادة التحميل',
    'status.loading': 'جاري تحميل الملف…',
    'status.empty':
      'ملفك الشخصي يبدو فارغاً. أكمل بياناتك للاستفادة من جميع المزايا.',
    'status.error':
      'حدث خطأ أثناء تحميل الملف الشخصي. حاول مرة أخرى لاحقاً.',
    'status.noChanges': 'لم يتم رصد أي تغييرات',
    'toast.saved': 'تم تحديث الملف الشخصي بنجاح',
    'toast.error': 'تعذّر تحديث الملف الشخصي',
    'toast.uploadPlaceholder':
      'سيتم تفعيل رفع الوثائق قريباً ضمن الإصدار القادم.',
    'analytics.update': 'تم تحديث الملف الشخصي للمستثمر',
    'language.switch.ar': 'العربية',
    'language.switch.en': 'الإنجليزية',
  },
};

export function getMessage(
  key: MessageKey,
  language: InvestorLanguage = 'ar'
): string {
  return messages[language][key] ?? messages.en[key] ?? key;
}



