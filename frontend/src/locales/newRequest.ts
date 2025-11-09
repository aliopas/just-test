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
    'status.submitting': 'Saving requestâ€¦',
    'status.success':
      'Request saved as draft. Submit after attaching required documents.',
    'status.error': 'Unable to save request. Please try again.',
    'summary.title': 'Before you submit',
    'summary.autoSubmit':
      'Draft requests stay pending until you submit them after attaching documents.',
  },
  ar: {
    pageTitle: 'Ø·Ù„Ø¨ Ø§Ø³ØªØ«Ù…Ø§Ø±ÙŠ Ø¬Ø¯ÙŠØ¯',
    pageSubtitle:
      'Ù‚Ø¯Ù‘Ù… Ø·Ù„Ø¨ Ø´Ø±Ø§Ø¡ Ø£Ùˆ Ø¨ÙŠØ¹. Ø³ÙŠØªÙ… Ù…Ø±Ø§Ø¬Ø¹ØªÙ‡ Ù…Ù† Ù‚Ø¨Ù„ Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ù…Ø®ØªØµ Ø¨Ø¹Ø¯ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„.',
    'form.type': 'Ù†ÙˆØ¹ Ø§Ù„Ø·Ù„Ø¨',
    'form.amount': 'Ø§Ù„Ù…Ø¨Ù„Øº',
    'form.currency': 'Ø§Ù„Ø¹Ù…Ù„Ø©',
    'form.targetPrice': 'Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ù…Ø³ØªÙ‡Ø¯Ù (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)',
    'form.expiry': 'ØªØ§Ø±ÙŠØ® Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ©',
    'form.notes': 'Ù…Ù„Ø§Ø­Ø¸Ø§Øª (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)',
    'form.documents': 'Ø§Ù„Ù…Ø±ÙÙ‚Ø§Øª',
    'form.submit': 'Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨',
    'form.reset': 'Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ù†Ù…ÙˆØ°Ø¬',
    'form.uploadHint':
      'Ø§Ø³Ø­Ø¨ Ø§Ù„Ù…Ù„ÙØ§Øª Ù‡Ù†Ø§ Ø£Ùˆ Ø§Ø¶ØºØ· Ù„Ù„Ø§Ø®ØªÙŠØ§Ø± (PDF/JPG/PNG).',
    'status.submitting': 'Ø¬Ø§Ø±ÙŠ Ø­ÙØ¸ Ø§Ù„Ø·Ù„Ø¨â€¦',
    'status.success':
      'ØªÙ… Ø­ÙØ¸ Ø§Ù„Ø·Ù„Ø¨ ÙƒÙ…Ø³ÙˆØ¯Ø©. Ø£Ø±Ø³Ù„ Ø§Ù„Ø·Ù„Ø¨ Ø¨Ø¹Ø¯ Ø¥Ø±ÙØ§Ù‚ Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©.',
    'status.error': 'ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„Ø·Ù„Ø¨. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.',
    'summary.title': 'Ù‚Ø¨Ù„ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„',
    'summary.autoSubmit':
      'ØªØ¸Ù„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª ÙÙŠ Ø­Ø§Ù„Ø© Ù…Ø³ÙˆØ¯Ø© Ø­ØªÙ‰ ØªÙ‚ÙˆÙ… Ø¨Ø¥Ø±Ø³Ø§Ù„Ù‡Ø§ Ø¨Ø¹Ø¯ Ø¥Ø±ÙØ§Ù‚ Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©.',
  },
};

export function tRequest(
  key: MessageKey,
  language: InvestorLanguage = 'ar'
): string {
  return messages[language][key] ?? messages.en[key] ?? key;
}


