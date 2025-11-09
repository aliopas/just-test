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
    'status.loading': 'Loading profileâ€¦',
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
    'language.switch.ar': 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©',
    'language.switch.en': 'English',
  },
  ar: {
    pageTitle: 'Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ Ù„Ù„Ù…Ø³ØªØ«Ù…Ø±',
    lastUpdated: 'Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«',
    'tabs.basic': 'Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©',
    'tabs.identity': 'Ø§Ù„Ù‡ÙˆÙŠØ© ÙˆØ§Ù„ØªÙˆØ«ÙŠÙ‚',
    'tabs.preferences': 'Ø§Ù„ØªÙØ¶ÙŠÙ„Ø§Øª',
    'fields.fullName': 'Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„',
    'fields.preferredName': 'Ø§Ù„Ø§Ø³Ù… Ø§Ù„Ù…ÙØ¶Ù„',
    'fields.language': 'Ø§Ù„Ù„ØºØ© Ø§Ù„Ù…ÙØ¶Ù„Ø©',
    'fields.idType': 'Ù†ÙˆØ¹ Ø§Ù„Ù‡ÙˆÙŠØ©',
    'fields.idNumber': 'Ø±Ù‚Ù… Ø§Ù„Ù‡ÙˆÙŠØ©',
    'fields.idExpiry': 'ØªØ§Ø±ÙŠØ® Ø§Ù„Ø§Ù†ØªÙ‡Ø§Ø¡',
    'fields.nationality': 'Ø§Ù„Ø¬Ù†Ø³ÙŠØ©',
    'fields.residencyCountry': 'Ø¯ÙˆÙ„Ø© Ø§Ù„Ø¥Ù‚Ø§Ù…Ø©',
    'fields.city': 'Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©',
    'fields.kycStatus': 'Ø­Ø§Ù„Ø© Ø§Ù„ØªØ­Ù‚Ù‚ (KYC)',
    'fields.riskProfile': 'Ø¯Ø±Ø¬Ø© ØªØ­Ù…Ù„ Ø§Ù„Ù…Ø®Ø§Ø·Ø±',
    'fields.communication.email': 'Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ',
    'fields.communication.sms': 'Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ù†ØµÙŠØ©',
    'fields.communication.push': 'Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ù†ØµØ©',
    'fields.communication.title': 'ØªÙØ¶ÙŠÙ„Ø§Øª Ø§Ù„ØªÙˆØ§ØµÙ„',
    'fields.documents.title': 'ÙˆØ«Ø§Ø¦Ù‚ Ø§Ù„ØªØ­Ù‚Ù‚ KYC',
    'fields.documents.helper':
      'Ù‚Ù… Ø¨Ø±ÙØ¹ Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø§Ù„Ù‡ÙˆÙŠØ© (PDF/JPG/PNGØŒ Ø¨Ø­Ø¯ Ø£Ù‚ØµÙ‰ 10 Ù…ÙŠØºØ§Ø¨Ø§ÙŠØª).',
    'actions.edit': 'ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ù…Ù„Ù',
    'actions.save': 'Ø­ÙØ¸ Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª',
    'actions.cancel': 'Ø¥Ù„ØºØ§Ø¡',
    'actions.refresh': 'Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„ØªØ­Ù…ÙŠÙ„',
    'status.loading': 'Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù„Ùâ€¦',
    'status.empty':
      'Ù…Ù„ÙÙƒ Ø§Ù„Ø´Ø®ØµÙŠ ÙŠØ¨Ø¯Ùˆ ÙØ§Ø±ØºÙ‹Ø§. Ø£ÙƒÙ…Ù„ Ø¨ÙŠØ§Ù†Ø§ØªÙƒ Ù„Ù„Ø§Ø³ØªÙØ§Ø¯Ø© Ù…Ù† Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ø²Ø§ÙŠØ§.',
    'status.error':
      'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ù„Ø§Ø­Ù‚Ù‹Ø§.',
    'status.noChanges': 'Ù„Ù… ÙŠØªÙ… Ø±ØµØ¯ Ø£ÙŠ ØªØºÙŠÙŠØ±Ø§Øª',
    'toast.saved': 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ Ø¨Ù†Ø¬Ø§Ø­',
    'toast.error': 'ØªØ¹Ø°Ø± ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ',
    'toast.uploadPlaceholder':
      'Ø³ÙŠØªÙ… ØªÙØ¹ÙŠÙ„ Ø±ÙØ¹ Ø§Ù„ÙˆØ«Ø§Ø¦Ù‚ Ù‚Ø±ÙŠØ¨Ù‹Ø§ Ø¶Ù…Ù† Ø§Ù„Ø¥ØµØ¯Ø§Ø± Ø§Ù„Ù‚Ø§Ø¯Ù….',
    'analytics.update': 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ Ù„Ù„Ù…Ø³ØªØ«Ù…Ø±',
    'language.switch.ar': 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©',
    'language.switch.en': 'English',
  },
};

export function getMessage(
  key: MessageKey,
  language: InvestorLanguage = 'ar'
): string {
  return messages[language][key] ?? messages.en[key] ?? key;
}



