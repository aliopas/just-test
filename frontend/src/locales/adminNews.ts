import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'pageTitle'
  | 'pageSubtitle'
  | 'list.emptyTitle'
  | 'list.emptySubtitle'
  | 'list.searchPlaceholder'
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
  | 'form.body'
  | 'form.cover'
  | 'form.coverHint'
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
    'list.searchPlaceholder': 'Search by title or slugâ€¦',
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
    'table.loading': 'Loading newsâ€¦',
    'table.error': 'Failed to load news. Please try again.',
    'form.drawerTitle.create': 'Create news item',
    'form.drawerTitle.edit': 'Edit news item',
    'form.title': 'Title',
    'form.slug': 'Slug',
    'form.status': 'Status',
    'form.body': 'Content (Markdown supported)',
    'form.cover': 'Cover image',
    'form.coverHint':
      'Upload a high quality image. Recommended formats: PNG, JPG, WEBP. Max 10MB.',
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
    'toast.uploadError': 'Failed to upload image. Please retry.',
    'toast.saveError': 'Failed to save news item. Please retry.',
    'toast.approved': 'News item approved successfully.',
    'toast.rejected': 'News item rejected successfully.',
    'toast.approveError': 'Failed to approve news item. Please retry.',
    'toast.rejectError': 'Failed to reject news item. Please retry.',
    'toast.reviewCommentRequired': 'Please provide a rejection comment before continuing.',
    'prompt.approveComment':
      'Add an optional note for approval (leave empty to skip)â€¦',
    'prompt.rejectComment': 'Provide a rejection comment (required)â€¦',
    'pagination.previous': 'Previous',
    'pagination.next': 'Next',
  },
  ar: {
    pageTitle: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø£Ø®Ø¨Ø§Ø± ÙˆØ§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª',
    pageSubtitle:
      'Ù‚Ù… Ø¨Ø¥Ù†Ø´Ø§Ø¡ ÙˆØ¬Ø¯ÙˆÙ„Ø© ÙˆÙ†Ø´Ø± Ø§Ù„ØªØ­Ø¯ÙŠØ«Ø§Øª Ø§Ù„Ù…ÙˆØ¬Ù‡Ø© Ù„Ù„Ù…Ø³ØªØ«Ù…Ø±ÙŠÙ† Ù…Ø¹ Ø§Ù„ØµÙˆØ± ÙˆØ§Ù„Ù…Ø­ØªÙˆÙ‰ Ø¨Ù†Ø³Ù‚ Markdown.',
    'list.emptyTitle': 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø£Ø®Ø¨Ø§Ø± Ø¨Ø¹Ø¯',
    'list.emptySubtitle':
      'Ø§Ø¨Ø¯Ø£ Ø¨Ø¥Ù†Ø´Ø§Ø¡ Ø£ÙˆÙ„ Ø¥Ø¹Ù„Ø§Ù† ÙˆØ³ÙŠØ¸Ù‡Ø± Ù‡Ù†Ø§ Ø¨Ù…Ø¬Ø±Ø¯ Ø­ÙØ¸Ù‡.',
    'list.searchPlaceholder': 'Ø§Ø¨Ø­Ø« Ø¨Ø§Ù„Ø¹Ù†ÙˆØ§Ù† Ø£Ùˆ Ø§Ù„Ù€ slugâ€¦',
    'list.status.all': 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ø§Ù„Ø§Øª',
    'list.status.draft': 'Ù…Ø³ÙˆØ¯Ø©',
    'list.status.pending_review': 'Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©',
    'list.status.scheduled': 'Ù…Ø¬Ø¯ÙˆÙ„',
    'list.status.published': 'Ù…Ù†Ø´ÙˆØ±',
    'list.status.rejected': 'Ù…Ø±ÙÙˆØ¶',
    'list.status.archived': 'Ù…Ø¤Ø±Ø´Ù',
    'list.actions.new': 'Ø¥Ù†Ø´Ø§Ø¡ Ø®Ø¨Ø±',
    'list.actions.publishScheduled': 'Ù†Ø´Ø± Ø§Ù„Ø¹Ù†Ø§ØµØ± Ø§Ù„Ù…Ø¬Ø¯ÙˆÙ„Ø©',
    'table.title': 'Ø§Ù„Ø¹Ù†ÙˆØ§Ù†',
    'table.status': 'Ø§Ù„Ø­Ø§Ù„Ø©',
    'table.scheduledAt': 'Ù…ÙˆØ¹Ø¯ Ø§Ù„Ø¬Ø¯ÙˆÙ„Ø©',
    'table.publishedAt': 'ØªØ§Ø±ÙŠØ® Ø§Ù„Ù†Ø´Ø±',
    'table.updatedAt': 'Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«',
    'table.actions': 'Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª',
    'table.edit': 'ØªØ¹Ø¯ÙŠÙ„',
    'table.delete': 'Ø­Ø°Ù',
    'table.approve': 'Ù…ÙˆØ§ÙÙ‚Ø©',
    'table.reject': 'Ø±ÙØ¶',
    'table.reviewHistory': 'Ø³Ø¬Ù„ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø§Øª',
    'table.noReviews': 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù‚Ø±Ø§Ø±Ø§Øª Ù…Ø±Ø§Ø¬Ø¹Ø© Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.',
    'table.reviewedAt': 'ØªØ§Ø±ÙŠØ® Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©',
    'table.reviewer': 'Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹',
    'table.reviewComment': 'Ø§Ù„Ù…Ù„Ø§Ø­Ø¸Ø©',
    'table.loading': 'Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø£Ø®Ø¨Ø§Ø±â€¦',
    'table.error': 'ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø£Ø®Ø¨Ø§Ø±ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.',
    'form.drawerTitle.create': 'Ø¥Ù†Ø´Ø§Ø¡ Ø®Ø¨Ø±',
    'form.drawerTitle.edit': 'ØªØ¹Ø¯ÙŠÙ„ Ø®Ø¨Ø±',
    'form.title': 'Ø§Ù„Ø¹Ù†ÙˆØ§Ù†',
    'form.slug': 'Ø§Ù„Ù…Ø¹Ø±Ù‘Ù (slug)',
    'form.status': 'Ø§Ù„Ø­Ø§Ù„Ø©',
    'form.body': 'Ø§Ù„Ù…Ø­ØªÙˆÙ‰ (ÙŠØ¯Ø¹Ù… Markdown)',
    'form.cover': 'ØµÙˆØ±Ø© Ø§Ù„ØºÙ„Ø§Ù',
    'form.coverHint':
      'Ù‚Ù… Ø¨Ø±ÙØ¹ ØµÙˆØ±Ø© Ø¹Ø§Ù„ÙŠØ© Ø§Ù„Ø¬ÙˆØ¯Ø©. Ø§Ù„ØµÙŠØº Ø§Ù„Ù…Ù‚ØªØ±Ø­Ø©: PNG, JPG, WEBP. Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ 10MB.',
    'form.scheduleLabel': 'ØªØ§Ø±ÙŠØ®/ÙˆÙ‚Øª Ø§Ù„Ø¬Ø¯ÙˆÙ„Ø©',
    'form.schedulePlaceholder': 'Ø§Ø®ØªØ± Ø§Ù„ØªØ§Ø±ÙŠØ® ÙˆØ§Ù„ÙˆÙ‚Øª',
    'form.publishAtLabel': 'ØªØ§Ø±ÙŠØ® Ø§Ù„Ù†Ø´Ø±',
    'form.save': 'Ø­ÙØ¸',
    'form.cancel': 'Ø¥Ù„ØºØ§Ø¡',
    'form.deleteConfirmTitle': 'Ø­Ø°Ù Ø§Ù„Ø®Ø¨Ø±ØŸ',
    'form.deleteConfirmMessage':
      'Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø­Ø°Ù Ù‡Ø°Ø§ Ø§Ù„Ø®Ø¨Ø±ØŸ Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ØªØ±Ø§Ø¬Ø¹ Ø¹Ù† Ù‡Ø°Ù‡ Ø§Ù„Ø¹Ù…Ù„ÙŠØ©.',
    'form.deleteConfirmAccept': 'Ø­Ø°Ù Ù†Ù‡Ø§Ø¦ÙŠ',
    'form.validation.scheduleRequired':
      'ÙŠØ¬Ø¨ ØªØ­Ø¯ÙŠØ¯ ØªØ§Ø±ÙŠØ® ÙˆÙˆÙ‚Øª Ù„Ù„Ø¹Ù†ØµØ± Ø§Ù„Ù…Ø¬Ø¯ÙˆÙ„.',
    'form.validation.publishRequired':
      'ÙŠØ¬Ø¨ ØªØ­Ø¯ÙŠØ¯ ØªØ§Ø±ÙŠØ® ÙˆÙˆÙ‚Øª Ù„Ù„Ø¹Ù†ØµØ± Ø§Ù„Ù…Ù†Ø´ÙˆØ±.',
    'toast.created': 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø®Ø¨Ø± Ø¨Ù†Ø¬Ø§Ø­.',
    'toast.updated': 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø®Ø¨Ø± Ø¨Ù†Ø¬Ø§Ø­.',
    'toast.deleted': 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ø®Ø¨Ø± Ø¨Ù†Ø¬Ø§Ø­.',
    'toast.published': 'ØªÙ… Ù†Ø´Ø± Ø§Ù„Ø£Ø®Ø¨Ø§Ø± Ø§Ù„Ù…Ø¬Ø¯ÙˆÙ„Ø© Ø¨Ù†Ø¬Ø§Ø­.',
    'toast.publishError': 'ØªØ¹Ø°Ø± Ù†Ø´Ø± Ø§Ù„Ø£Ø®Ø¨Ø§Ø± Ø§Ù„Ù…Ø¬Ø¯ÙˆÙ„Ø©.',
    'toast.presignError': 'ØªØ¹Ø°Ø± ØªØ­Ø¶ÙŠØ± Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±Ø©ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.',
    'toast.uploadError': 'ØªØ¹Ø°Ø± Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±Ø©ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.',
    'toast.saveError': 'ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„Ø®Ø¨Ø±ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.',
    'toast.approved': 'ØªÙ…Øª Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø¨Ø± Ø¨Ù†Ø¬Ø§Ø­.',
    'toast.rejected': 'ØªÙ… Ø±ÙØ¶ Ø§Ù„Ø®Ø¨Ø± Ø¨Ù†Ø¬Ø§Ø­.',
    'toast.approveError': 'ØªØ¹Ø°Ø± Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø¨Ø±ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.',
    'toast.rejectError': 'ØªØ¹Ø°Ø± Ø±ÙØ¶ Ø§Ù„Ø®Ø¨Ø±ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.',
    'toast.reviewCommentRequired': 'ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ ØªØ¹Ù„ÙŠÙ‚ Ø¹Ù†Ø¯ Ø±ÙØ¶ Ø§Ù„Ø®Ø¨Ø±.',
    'prompt.approveComment': 'Ø£Ø¶Ù Ù…Ù„Ø§Ø­Ø¸Ø© Ø§Ø®ØªÙŠØ§Ø±ÙŠØ© Ù„Ù„Ù…ÙˆØ§ÙÙ‚Ø© (Ø§ØªØ±ÙƒÙ‡Ø§ ÙØ§Ø±ØºØ© Ù„Ù„ØªØ®Ø·ÙŠ)â€¦',
    'prompt.rejectComment': 'Ø£Ø¯Ø®Ù„ ØªØ¹Ù„ÙŠÙ‚ Ø§Ù„Ø±ÙØ¶ (Ù…Ø·Ù„ÙˆØ¨)â€¦',
    'pagination.previous': 'Ø§Ù„Ø³Ø§Ø¨Ù‚',
    'pagination.next': 'Ø§Ù„ØªØ§Ù„ÙŠ',
  },
};

export function tAdminNews(key: MessageKey, language: InvestorLanguage) {
  return messages[language][key];
}


