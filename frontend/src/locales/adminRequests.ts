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
  | 'table.requestNumber'
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
  | 'detail.updatedAt'
  | 'decision.approvedSuccess'
  | 'decision.rejectedSuccess'
  | 'decision.infoRequestedSuccess'
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
    'filters.searchPlaceholder': 'Search by number or investor nameâ€¦',
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
    'table.requestNumber': 'Request #',
    'table.investor': 'Investor',
    'table.amount': 'Amount',
    'table.status': 'Status',
    'table.createdAt': 'Created',
    'table.emptyTitle': 'No requests yet',
    'table.emptySubtitle':
      'When investors submit requests, they will appear here automatically.',
    'table.error': 'Unable to load requests. Please try again.',
    'table.loading': 'Loading requestsâ€¦',
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
    'detail.commentPlaceholder': 'Share an internal update or note for the review teamâ€¦',
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
    'detail.updatedAt': 'Last updated',
    'decision.approvedSuccess': 'Request approved successfully',
    'decision.rejectedSuccess': 'Request rejected successfully',
    'decision.infoRequestedSuccess': 'Information request sent successfully',
    'decision.settlementStartedSuccess': 'Settlement process marked as started.',
    'decision.settlementCompletedSuccess': 'Settlement completed and request closed.',
    'decision.notePlaceholder': 'Add an internal note (optional, max 500 characters)â€¦',
    'decision.noteRequired': 'Please enter a message before requesting additional information.',
    'decision.referenceLabel': 'Settlement reference',
    'decision.referencePlaceholder': 'Enter settlement referenceâ€¦',
    'decision.referenceRequired': 'Settlement reference is required.',
    'comment.addSuccess': 'Comment added successfully.',
    'comment.addError': 'Failed to add comment. Please try again.',
    'comment.required': 'Please enter a comment before submitting.',
  },
  ar: {
    pageTitle: 'ØµÙ†Ø¯ÙˆÙ‚ ÙˆØ§Ø±Ø¯ Ø§Ù„Ø·Ù„Ø¨Ø§Øª',
    pageSubtitle: 'ØªØ§Ø¨Ø¹ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø§Ù„ÙˆØ§Ø±Ø¯Ø© ÙˆÙ‚Ù… Ø¨ÙØ±Ø²Ù‡Ø§ ÙˆØ§ØªØ®Ø§Ø° Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø©.',
    'filters.status': 'Ø§Ù„Ø­Ø§Ù„Ø©',
    'filters.type': 'Ø§Ù„Ù†ÙˆØ¹',
    'filters.dateFrom': 'Ù…Ù† ØªØ§Ø±ÙŠØ®',
    'filters.dateTo': 'Ø¥Ù„Ù‰ ØªØ§Ø±ÙŠØ®',
    'filters.minAmount': 'Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ø¯Ù†Ù‰ Ù„Ù„Ù…Ø¨Ù„Øº',
    'filters.maxAmount': 'Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ø¹Ù„Ù‰ Ù„Ù„Ù…Ø¨Ù„Øº',
    'filters.searchPlaceholder': 'Ø§Ø¨Ø­Ø« Ø¨Ø±Ù‚Ù… Ø§Ù„Ø·Ù„Ø¨ Ø£Ùˆ Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ«Ù…Ø±â€¦',
    'filters.reset': 'Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ†',
    'filters.apply': 'ØªØ·Ø¨ÙŠÙ‚',
    'sort.label': 'ØªØ±ØªÙŠØ¨ Ø­Ø³Ø¨',
    'sort.created': 'ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡',
    'sort.amount': 'Ø§Ù„Ù…Ø¨Ù„Øº',
    'sort.status': 'Ø§Ù„Ø­Ø§Ù„Ø©',
    'status.all': 'Ø§Ù„ÙƒÙ„',
    'status.draft': 'Ù…Ø³ÙˆØ¯Ø©',
    'status.submitted': 'Ù…ÙØ±Ø³ÙŽÙ„',
    'status.screening': 'ØªØµÙÙŠØ© Ø£ÙˆÙ„ÙŠØ©',
    'status.pending_info': 'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ù…Ø¹Ù„ÙˆÙ…Ø§Øª',
    'status.compliance_review': 'Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„ØªØ²Ø§Ù…',
    'status.approved': 'Ù…ÙˆØ§ÙÙ‚ Ø¹Ù„ÙŠÙ‡',
    'status.rejected': 'Ù…Ø±ÙÙˆØ¶',
    'status.settling': 'Ù‚ÙŠØ¯ Ø§Ù„ØªØ³ÙˆÙŠØ©',
    'status.completed': 'Ù…ÙƒØªÙ…Ù„',
    'type.all': 'Ø§Ù„ÙƒÙ„',
    'type.buy': 'Ø´Ø±Ø§Ø¡',
    'type.sell': 'Ø¨ÙŠØ¹',
    'table.requestNumber': 'Ø±Ù‚Ù… Ø§Ù„Ø·Ù„Ø¨',
    'table.investor': 'Ø§Ù„Ù…Ø³ØªØ«Ù…Ø±',
    'table.amount': 'Ø§Ù„Ù…Ø¨Ù„Øº',
    'table.status': 'Ø§Ù„Ø­Ø§Ù„Ø©',
    'table.createdAt': 'ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡',
    'table.emptyTitle': 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†',
    'table.emptySubtitle':
      'Ø¹Ù†Ø¯ Ù‚ÙŠØ§Ù… Ø§Ù„Ù…Ø³ØªØ«Ù…Ø±ÙŠÙ† Ø¨ØªÙ‚Ø¯ÙŠÙ… Ø·Ù„Ø¨Ø§ØªÙ‡Ù… Ø³ØªØ¸Ù‡Ø± Ù‡Ù†Ø§ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹.',
    'table.error': 'ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.',
    'table.loading': 'Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨Ø§Øªâ€¦',
    'pagination.previous': 'Ø§Ù„Ø³Ø§Ø¨Ù‚',
    'pagination.next': 'Ø§Ù„ØªØ§Ù„ÙŠ',
    'detail.title': 'ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨',
    'detail.back': 'Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ø§Ù„ØµÙ†Ø¯ÙˆÙ‚',
    'detail.requestInfo': 'Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø·Ù„Ø¨',
    'detail.investorInfo': 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø³ØªØ«Ù…Ø±',
    'detail.notes': 'Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ø¯Ø§Ø®Ù„ÙŠØ©',
    'detail.attachments': 'Ø§Ù„Ù…Ø±ÙÙ‚Ø§Øª',
    'detail.timeline': 'Ø³Ø¬Ù„ Ø§Ù„Ø£Ø­Ø¯Ø§Ø«',
    'detail.comments': 'Ø§Ù„ØªØ¹Ù„ÙŠÙ‚Ø§Øª Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©',
    'detail.commentPlaceholder': 'Ø´Ø§Ø±Ùƒ ØªØ­Ø¯ÙŠØ«Ø§Ù‹ Ø¯Ø§Ø®Ù„ÙŠØ§Ù‹ Ø£Ùˆ Ù…Ù„Ø§Ø­Ø¸Ø© Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©â€¦',
    'detail.commentSubmit': 'Ø¥Ø¶Ø§ÙØ© ØªØ¹Ù„ÙŠÙ‚',
    'detail.commentUnknownActor': 'Ù…Ø³ØªØ®Ø¯Ù… ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ',
    'detail.settlement': 'ØªØªØ¨Ø¹ Ø§Ù„ØªØ³ÙˆÙŠØ©',
    'detail.settlementReference': 'Ù…Ø±Ø¬Ø¹ Ø§Ù„ØªØ³ÙˆÙŠØ©',
    'detail.settlementStartedAt': 'ØªØ§Ø±ÙŠØ® Ø¨Ø¯Ø¡ Ø§Ù„ØªØ³ÙˆÙŠØ©',
    'detail.settlementCompletedAt': 'ØªØ§Ø±ÙŠØ® Ø¥ÙƒÙ…Ø§Ù„ Ø§Ù„ØªØ³ÙˆÙŠØ©',
    'detail.attachmentCategory.general': 'Ù…Ø±ÙÙ‚ Ø¹Ø§Ù…',
    'detail.attachmentCategory.settlement': 'Ù…Ø³ØªÙ†Ø¯ ØªØ³ÙˆÙŠØ©',
    'detail.startSettlement': 'Ø¨Ø¯Ø¡ Ø§Ù„ØªØ³ÙˆÙŠØ©',
    'detail.completeSettlement': 'ØªØ£ÙƒÙŠØ¯ Ø¥ØªÙ…Ø§Ù… Ø§Ù„ØªØ³ÙˆÙŠØ©',
    'detail.noteHelper': 'Ø§Ø³ØªØ®Ø¯Ù… Ø­Ù‚Ù„ Ø§Ù„Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ù„Ø¥Ø¶Ø§ÙØ© Ø³ÙŠØ§Ù‚ØŒ ÙˆÙ‡Ùˆ Ù…Ø·Ù„ÙˆØ¨ Ø¹Ù†Ø¯ Ø·Ù„Ø¨ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø¥Ø¶Ø§ÙÙŠØ©.',
    'detail.noAttachments': 'Ù„Ù… ÙŠØªÙ… Ø±ÙØ¹ Ø£ÙŠ Ù…Ø±ÙÙ‚Ø§Øª.',
    'detail.noEvents': 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø³Ø¬Ù„ Ø£Ø­Ø¯Ø§Ø« Ø¨Ø¹Ø¯.',
    'detail.noComments': 'Ù„Ø§ ØªÙˆØ¬Ø¯ ØªØ¹Ù„ÙŠÙ‚Ø§Øª Ø¯Ø§Ø®Ù„ÙŠØ© Ø¨Ø¹Ø¯.',
    'detail.actions': 'Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„Ù‚Ø±Ø§Ø±',
    'detail.approve': 'Ù‚Ø¨ÙˆÙ„',
    'detail.reject': 'Ø±ÙØ¶',
    'detail.requestInfoAction': 'Ø·Ù„Ø¨ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª',
    'detail.updatedAt': 'Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«',
    'decision.approvedSuccess': 'ØªÙ…Øª Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø·Ù„Ø¨ Ø¨Ù†Ø¬Ø§Ø­',
    'decision.rejectedSuccess': 'ØªÙ… Ø±ÙØ¶ Ø§Ù„Ø·Ù„Ø¨ Ø¨Ù†Ø¬Ø§Ø­',
    'decision.infoRequestedSuccess': 'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø¥Ø¶Ø§ÙÙŠØ© Ø¨Ù†Ø¬Ø§Ø­',
    'decision.settlementStartedSuccess': 'Settlement process marked as started.',
    'decision.settlementCompletedSuccess': 'Settlement completed and request closed.',
    'decision.notePlaceholder': 'Ø£Ø¶Ù Ù…Ù„Ø§Ø­Ø¸Ø© Ø¯Ø§Ø®Ù„ÙŠØ© (Ø§Ø®ØªÙŠØ§Ø±ÙŠØŒ Ø¨Ø­Ø¯ Ø£Ù‚ØµÙ‰ 500 Ø­Ø±Ù)â€¦',
    'decision.noteRequired': 'ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø±Ø³Ø§Ù„Ø© Ù‚Ø¨Ù„ Ø·Ù„Ø¨ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø¥Ø¶Ø§ÙÙŠØ©.',
    'decision.referenceLabel': 'Ù…Ø±Ø¬Ø¹ Ø§Ù„ØªØ³ÙˆÙŠØ©',
    'decision.referencePlaceholder': 'Ø£Ø¯Ø®Ù„ Ù…Ø±Ø¬Ø¹ Ø§Ù„ØªØ³ÙˆÙŠØ©â€¦',
    'decision.referenceRequired': 'Ù…Ø±Ø¬Ø¹ Ø§Ù„ØªØ³ÙˆÙŠØ© Ù…Ø·Ù„ÙˆØ¨.',
    'comment.addSuccess': 'ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© Ø§Ù„ØªØ¹Ù„ÙŠÙ‚ Ø¨Ù†Ø¬Ø§Ø­.',
    'comment.addError': 'ÙØ´Ù„ ÙÙŠ Ø¥Ø¶Ø§ÙØ© Ø§Ù„ØªØ¹Ù„ÙŠÙ‚ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.',
    'comment.required': 'ÙŠØ±Ø¬Ù‰ ÙƒØªØ§Ø¨Ø© Ø§Ù„ØªØ¹Ù„ÙŠÙ‚ Ù‚Ø¨Ù„ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„.',
  },
};

export function tAdminRequests(
  key: MessageKey,
  language: InvestorLanguage = 'ar'
): string {
  return messages[language][key] ?? messages.en[key] ?? key;
}


