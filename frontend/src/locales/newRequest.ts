import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'pageTitle'
  | 'pageSubtitle'
  | 'form.type'
  | 'form.amount'
  | 'form.currency'
  | 'form.targetPrice'
  | 'form.expiry'
  | 'form.notes'
  | 'form.documents'
  | 'form.submit'
  | 'form.reset'
  | 'form.uploadHint'
  | 'status.submitting'
  | 'status.success'
  | 'status.error'
  | 'summary.title'
  | 'summary.autoSubmit';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    pageTitle: 'New Investment Request',
    pageSubtitle:
      'Submit a buy or sell request. Compliance will review it after submission.',
    'form.type': 'Request type',
    'form.amount': 'Amount',
    'form.currency': 'Currency',
    'form.targetPrice': 'Target price (optional)',
    'form.expiry': 'Expiry date',
    'form.notes': 'Notes (optional)',
    'form.documents': 'Attachments',
    'form.submit': 'Submit request',
    'form.reset': 'Reset form',
    'form.uploadHint': 'Drag & drop files here or click to browse (PDF/JPG/PNG).',
    'status.submitting': 'Saving request…',
    'status.success':
      'Request saved as draft. Submit after attaching required documents.',
    'status.error': 'Unable to save request. Please try again.',
    'summary.title': 'Before you submit',
    'summary.autoSubmit':
      'Draft requests stay pending until you submit them after attaching documents.',
  },
  ar: {
    pageTitle: 'طلب استثماري جديد',
    pageSubtitle:
      'قدّم طلب شراء أو بيع. سيتم مراجعته من قبل الفريق المختص بعد الإرسال.',
    'form.type': 'نوع الطلب',
    'form.amount': 'المبلغ',
    'form.currency': 'العملة',
    'form.targetPrice': 'السعر المستهدف (اختياري)',
    'form.expiry': 'تاريخ الصلاحية',
    'form.notes': 'ملاحظات (اختياري)',
    'form.documents': 'المرفقات',
    'form.submit': 'إرسال الطلب',
    'form.reset': 'إعادة تعيين النموذج',
    'form.uploadHint':
      'اسحب الملفات هنا أو اضغط للاختيار (PDF/JPG/PNG).',
    'status.submitting': 'جاري حفظ الطلب…',
    'status.success':
      'تم حفظ الطلب كمسودة. أرسل الطلب بعد إرفاق المستندات المطلوبة.',
    'status.error': 'تعذّر حفظ الطلب. حاول مرة أخرى.',
    'summary.title': 'قبل الإرسال',
    'summary.autoSubmit':
      'تظل الطلبات في حالة مسودة حتى تقوم بإرسالها بعد إرفاق المستندات المطلوبة.',
  },
};

export function tRequest(
  key: MessageKey,
  language: InvestorLanguage = 'ar'
): string {
  return messages[language][key] ?? messages.en[key] ?? key;
}


