import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'pageTitle'
  | 'pageSubtitle'
  | 'filters.all'
  | 'filters.draft'
  | 'filters.submitted'
  | 'filters.screening'
  | 'filters.pendingInfo'
  | 'filters.complianceReview'
  | 'filters.approved'
  | 'filters.settling'
  | 'filters.completed'
  | 'filters.rejected'
  | 'emptyState.title'
  | 'emptyState.subtitle'
  | 'emptyState.cta'
  | 'table.requestNumber'
  | 'table.type'
  | 'table.amount'
  | 'table.status'
  | 'table.updatedAt'
  | 'details.title'
  | 'details.type'
  | 'details.amount'
  | 'details.targetPrice'
  | 'details.expiry'
  | 'details.notes'
  | 'details.lastUpdate'
  | 'details.attachments'
  | 'details.timeline'
  | 'details.comments'
  | 'details.noEvents'
  | 'details.noComments'
  | 'details.noAttachments'
  | 'details.download'
  | 'details.loading'
  | 'details.error'
  | 'pagination.previous'
  | 'pagination.next';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    pageTitle: 'My Requests',
    pageSubtitle: 'Track every investment request and see where it stands.',
    'filters.all': 'All',
    'filters.draft': 'Drafts',
    'filters.submitted': 'Submitted',
    'filters.screening': 'Screening',
    'filters.pendingInfo': 'Pending info',
    'filters.complianceReview': 'Compliance review',
    'filters.approved': 'Approved',
    'filters.settling': 'Settling',
    'filters.completed': 'Completed',
    'filters.rejected': 'Rejected',
    'emptyState.title': 'No requests yet',
    'emptyState.subtitle': 'Submit your first request to see it tracked here.',
    'emptyState.cta': 'Create new request',
    'table.requestNumber': 'Request #',
    'table.type': 'Type',
    'table.amount': 'Amount',
    'table.status': 'Status',
    'table.updatedAt': 'Updated',
    'details.title': 'Request details',
    'details.type': 'Type',
    'details.amount': 'Amount',
    'details.targetPrice': 'Target price',
    'details.expiry': 'Expiry date',
    'details.notes': 'Notes',
    'details.lastUpdate': 'Last update',
    'details.attachments': 'Attachments',
    'details.timeline': 'Timeline',
    'details.comments': 'Comments',
    'details.noEvents': 'No events recorded yet',
    'details.noComments': 'No comments yet',
    'details.noAttachments': 'No attachments uploaded',
    'details.download': 'Download',
    'details.loading': 'Loading request detailâ€¦',
    'details.error': 'Unable to load request detail. Please try again.',
    'pagination.previous': 'Previous',
    'pagination.next': 'Next',
  },
  ar: {
    pageTitle: 'Ø·Ù„Ø¨Ø§ØªÙŠ',
    pageSubtitle: 'ØªØ§Ø¨Ø¹ Ø¬Ù…ÙŠØ¹ Ø·Ù„Ø¨Ø§ØªÙƒ Ø§Ù„Ø§Ø³ØªØ«Ù…Ø§Ø±ÙŠØ© ÙˆØ§Ø¹Ø±Ù Ø­Ø§Ù„ØªÙ‡Ø§ Ø§Ù„Ø­Ø§Ù„ÙŠØ©.',
    'filters.all': 'Ø§Ù„ÙƒÙ„',
    'filters.draft': 'Ù…Ø³ÙˆØ¯Ø§Øª',
    'filters.submitted': 'Ù…ÙØ±Ø³Ù„Ø©',
    'filters.screening': 'ØªØµÙÙŠØ© Ø£ÙˆÙ„ÙŠØ©',
    'filters.pendingInfo': 'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ù…Ø¹Ù„ÙˆÙ…Ø§Øª',
    'filters.complianceReview': 'Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„ØªØ²Ø§Ù…',
    'filters.approved': 'Ù…ÙˆØ§ÙÙ‚ Ø¹Ù„ÙŠÙ‡Ø§',
    'filters.settling': 'Ù‚ÙŠØ¯ Ø§Ù„ØªØ³ÙˆÙŠØ©',
    'filters.completed': 'Ù…ÙƒØªÙ…Ù„Ø©',
    'filters.rejected': 'Ù…Ø±ÙÙˆØ¶Ø©',
    'emptyState.title': 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª Ø¨Ø¹Ø¯',
    'emptyState.subtitle': 'Ù‚Ø¯Ù‘Ù… Ø·Ù„Ø¨Ùƒ Ø§Ù„Ø£ÙˆÙ„ Ù„ÙŠØ¸Ù‡Ø± ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ù‡Ù†Ø§.',
    'emptyState.cta': 'Ø¥Ù†Ø´Ø§Ø¡ Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯',
    'table.requestNumber': 'Ø±Ù‚Ù… Ø§Ù„Ø·Ù„Ø¨',
    'table.type': 'Ø§Ù„Ù†ÙˆØ¹',
    'table.amount': 'Ø§Ù„Ù…Ø¨Ù„Øº',
    'table.status': 'Ø§Ù„Ø­Ø§Ù„Ø©',
    'table.updatedAt': 'Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«',
    'details.title': 'ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨',
    'details.type': 'Ø§Ù„Ù†ÙˆØ¹',
    'details.amount': 'Ø§Ù„Ù…Ø¨Ù„Øº',
    'details.targetPrice': 'Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ù…Ø³ØªÙ‡Ø¯Ù',
    'details.expiry': 'ØªØ§Ø±ÙŠØ® Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ©',
    'details.notes': 'Ù…Ù„Ø§Ø­Ø¸Ø§Øª',
    'details.lastUpdate': 'Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«',
    'details.attachments': 'Ø§Ù„Ù…Ø±ÙÙ‚Ø§Øª',
    'details.timeline': 'Ø³Ø¬Ù„ Ø§Ù„Ø£Ø­Ø¯Ø§Ø«',
    'details.comments': 'Ø§Ù„ØªØ¹Ù„ÙŠÙ‚Ø§Øª',
    'details.noEvents': 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø³Ø¬Ù„ Ø£Ø­Ø¯Ø§Ø« Ø¨Ø¹Ø¯',
    'details.noComments': 'Ù„Ø§ ØªÙˆØ¬Ø¯ ØªØ¹Ù„ÙŠÙ‚Ø§Øª Ø¨Ø¹Ø¯',
    'details.noAttachments': 'Ù„Ù… ÙŠØªÙ… Ø±ÙØ¹ Ù…Ø±ÙÙ‚Ø§Øª',
    'details.download': 'ØªÙ†Ø²ÙŠÙ„',
    'details.loading': 'Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨â€¦',
    'details.error': 'ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.',
    'pagination.previous': 'Ø§Ù„Ø³Ø§Ø¨Ù‚',
    'pagination.next': 'Ø§Ù„ØªØ§Ù„ÙŠ',
  },
};

export function tRequestList(
  key: MessageKey,
  language: InvestorLanguage = 'ar'
): string {
  return messages[language][key] ?? messages.en[key] ?? key;
}


