import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'page.title'
  | 'page.subtitle'
  | 'actions.create'
  | 'filters.status.label'
  | 'filters.status.all'
  | 'filters.kyc.label'
  | 'filters.kyc.all'
  | 'filters.search.placeholder'
  | 'table.email'
  | 'table.name'
  | 'table.phone'
  | 'table.status'
  | 'table.kyc'
  | 'table.role'
  | 'table.createdAt'
  | 'table.emptyTitle'
  | 'table.emptySubtitle'
  | 'table.loading'
  | 'table.error'
  | 'form.title'
  | 'form.subtitle'
  | 'form.email'
  | 'form.fullName'
  | 'form.phone'
  | 'form.locale'
  | 'form.status'
  | 'form.sendInvite'
  | 'form.sendInvite.help'
  | 'form.temporaryPassword'
  | 'form.temporaryPassword.help'
  | 'form.temporaryPassword.required'
  | 'form.investor.language'
  | 'form.investor.idType'
  | 'form.investor.idNumber'
  | 'form.investor.nationality'
  | 'form.investor.residency'
  | 'form.investor.city'
  | 'form.investor.kycStatus'
  | 'form.investor.riskProfile'
  | 'form.submit'
  | 'form.cancel'
  | 'toast.created'
  | 'toast.error'
  | 'validation.phone'
  | 'validation.password'
  | 'status.pending'
  | 'status.active'
  | 'status.suspended'
  | 'status.deactivated'
  | 'kyc.pending'
  | 'kyc.in_review'
  | 'kyc.approved'
  | 'kyc.rejected'
  | 'risk.conservative'
  | 'risk.balanced'
  | 'risk.aggressive';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    'page.title': 'Investor Accounts',
    'page.subtitle':
      'Create and manage investor access, invite new users, and monitor their onboarding progress.',
    'actions.create': 'Add investor',
    'filters.status.label': 'Status',
    'filters.status.all': 'All statuses',
    'filters.kyc.label': 'KYC status',
    'filters.kyc.all': 'All KYC statuses',
    'filters.search.placeholder': 'Search by email, phone, or name…',
    'table.email': 'Email',
    'table.name': 'Name',
    'table.phone': 'Phone',
    'table.status': 'Status',
    'table.kyc': 'KYC',
    'table.role': 'Role',
    'table.createdAt': 'Created',
    'table.emptyTitle': 'No investors yet',
    'table.emptySubtitle':
      'Create your first investor account and it will show up here once saved.',
    'table.loading': 'Loading investors…',
    'table.error': 'Failed to load investors. Please retry.',
    'form.title': 'Create new investor',
    'form.subtitle':
      'Provide the contact information and choose how you would like to onboard the investor.',
    'form.email': 'Email address',
    'form.fullName': 'Full name',
    'form.phone': 'Phone number (E.164)',
    'form.locale': 'Preferred language',
    'form.status': 'Account status',
    'form.sendInvite': 'Send invitation email',
    'form.sendInvite.help':
      'The investor will receive an email from Supabase with a link to set their password.',
    'form.temporaryPassword': 'Temporary password',
    'form.temporaryPassword.help':
      'Provide a strong password if you prefer to share credentials manually.',
    'form.temporaryPassword.required':
      'Temporary password is required when invitation email is disabled.',
    'form.investor.language': 'Profile language',
    'form.investor.idType': 'ID type',
    'form.investor.idNumber': 'ID number',
    'form.investor.nationality': 'Nationality (ISO alpha-2)',
    'form.investor.residency': 'Country of residency (ISO alpha-2)',
    'form.investor.city': 'City',
    'form.investor.kycStatus': 'KYC status',
    'form.investor.riskProfile': 'Risk profile',
    'form.submit': 'Create investor',
    'form.cancel': 'Cancel',
    'toast.created': 'Investor account created successfully.',
    'toast.error': 'Failed to create investor. Please review the details and try again.',
    'validation.phone': 'Phone must be in E.164 format (e.g., +9665xxxxxxx).',
    'validation.password':
      'Password must contain uppercase, lowercase, and a number (minimum 8 characters).',
    'status.pending': 'Pending',
    'status.active': 'Active',
    'status.suspended': 'Suspended',
    'status.deactivated': 'Deactivated',
    'kyc.pending': 'Pending',
    'kyc.in_review': 'In review',
    'kyc.approved': 'Approved',
    'kyc.rejected': 'Rejected',
    'risk.conservative': 'Conservative',
    'risk.balanced': 'Balanced',
    'risk.aggressive': 'Aggressive',
  },
  ar: {
    'page.title': 'حسابات المستثمرين',
    'page.subtitle':
      'قم بإنشاء حسابات للمستثمرين وإدارتها، أرسل الدعوات، وتابع تقدمهم في عملية التسجيل.',
    'actions.create': 'إضافة مستثمر',
    'filters.status.label': 'حالة الحساب',
    'filters.status.all': 'جميع الحالات',
    'filters.kyc.label': 'حالة اعرف عميلك',
    'filters.kyc.all': 'جميع حالات اعرف عميلك',
    'filters.search.placeholder': 'ابحث بالبريد الإلكتروني أو الهاتف أو الاسم…',
    'table.email': 'البريد الإلكتروني',
    'table.name': 'الاسم',
    'table.phone': 'الهاتف',
    'table.status': 'الحالة',
    'table.kyc': 'اعرف عميلك',
    'table.role': 'الدور',
    'table.createdAt': 'تاريخ الإنشاء',
    'table.emptyTitle': 'لا توجد حسابات مستثمرين بعد',
    'table.emptySubtitle':
      'ابدأ بإنشاء أول حساب مستثمر وسيظهر هنا فور حفظه.',
    'table.loading': 'جارٍ تحميل المستثمرين…',
    'table.error': 'تعذر تحميل قائمة المستثمرين، يرجى المحاولة مرة أخرى.',
    'form.title': 'إنشاء مستثمر جديد',
    'form.subtitle':
      'أدخل بيانات التواصل الأساسية واختر الطريقة المناسبة لدعوة المستثمر للمنصة.',
    'form.email': 'عنوان البريد الإلكتروني',
    'form.fullName': 'الاسم الكامل',
    'form.phone': 'رقم الهاتف (صيغة E.164)',
    'form.locale': 'اللغة المفضلة',
    'form.status': 'حالة الحساب',
    'form.sendInvite': 'إرسال دعوة عبر البريد الإلكتروني',
    'form.sendInvite.help':
      'سيتلقى المستثمر رسالة من Supabase تحتوي على رابط لتعيين كلمة المرور.',
    'form.temporaryPassword': 'كلمة مرور مؤقتة',
    'form.temporaryPassword.help':
      'أدخل كلمة مرور قوية إذا كنت تفضل مشاركة بيانات الدخول بشكل يدوي.',
    'form.temporaryPassword.required':
      'كلمة المرور المؤقتة مطلوبة عند تعطيل إرسال الدعوة عبر البريد الإلكتروني.',
    'form.investor.language': 'لغة ملف المستثمر',
    'form.investor.idType': 'نوع الهوية',
    'form.investor.idNumber': 'رقم الهوية',
    'form.investor.nationality': 'الجنسية (رمز ISO مكون من حرفين)',
    'form.investor.residency': 'دولة الإقامة (رمز ISO مكون من حرفين)',
    'form.investor.city': 'المدينة',
    'form.investor.kycStatus': 'حالة اعرف عميلك',
    'form.investor.riskProfile': 'ملف المخاطر',
    'form.submit': 'إنشاء مستثمر',
    'form.cancel': 'إلغاء',
    'toast.created': 'تم إنشاء حساب المستثمر بنجاح.',
    'toast.error': 'تعذر إنشاء حساب المستثمر، يرجى التحقق من البيانات والمحاولة من جديد.',
    'validation.phone': 'يجب أن يكون رقم الهاتف بصيغة E.164 (مثال: ‎+9665xxxxxxx).',
    'validation.password':
      'يجب أن تحتوي كلمة المرور على حروف كبيرة وصغيرة ورقم (ثمانية أحرف على الأقل).',
    'status.pending': 'قيد التفعيل',
    'status.active': 'نشط',
    'status.suspended': 'موقوف مؤقتاً',
    'status.deactivated': 'مغلق',
    'kyc.pending': 'قيد الانتظار',
    'kyc.in_review': 'قيد المراجعة',
    'kyc.approved': 'مقبول',
    'kyc.rejected': 'مرفوض',
    'risk.conservative': 'متحفظ',
    'risk.balanced': 'متوازن',
    'risk.aggressive': 'مغامر',
  },
};

export function tAdminUsers(key: MessageKey, language: InvestorLanguage) {
  return messages[language][key];
}


