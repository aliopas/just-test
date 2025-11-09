import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'pageTitle'
  | 'pageSubtitle'
  | 'list.emptyTitle'
  | 'list.emptySubtitle'
  | 'list.loadMore'
  | 'card.readMore'
  | 'detail.back'
  | 'detail.publishedAt'
  | 'detail.updatedAt'
  | 'detail.loading'
  | 'detail.error'
  | 'toast.loadError'
  | 'toast.detailError';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    pageTitle: 'Latest News & Announcements',
    pageSubtitle:
      'Stay informed about Bakurah updates, investment opportunities, and platform announcements.',
    'list.emptyTitle': 'No news published yet',
    'list.emptySubtitle':
      'Please check back soon. We publish updates whenever there is something important to share.',
    'list.loadMore': 'Load more',
    'card.readMore': 'Read more',
    'detail.back': 'â† Back to news',
    'detail.publishedAt': 'Published on',
    'detail.updatedAt': 'Last updated',
    'detail.loading': 'Loading articleâ€¦',
    'detail.error': 'Failed to load article. Please try again.',
    'toast.loadError': 'Unable to load news. Please try again.',
    'toast.detailError': 'Unable to load article. Please try again.',
  },
  ar: {
    pageTitle: 'Ø¢Ø®Ø± Ø§Ù„Ø£Ø®Ø¨Ø§Ø± ÙˆØ§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª',
    pageSubtitle:
      'Ø§Ø¨Ù‚ÙŽ Ø¹Ù„Ù‰ Ø§Ø·Ù„Ø§Ø¹ Ø¨Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«Ø§Øª Ø¨Ø§ÙƒÙˆØ±Ø©ØŒ ÙØ±Øµ Ø§Ù„Ø§Ø³ØªØ«Ù…Ø§Ø±ØŒ ÙˆØ§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø§Ù„Ù…Ù‡Ù…Ø©.',
    'list.emptyTitle': 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø£Ø®Ø¨Ø§Ø± Ù…Ù†Ø´ÙˆØ±Ø© Ø¨Ø¹Ø¯',
    'list.emptySubtitle':
      'Ø¹Ø¯ Ù„Ø§Ø­Ù‚Ø§Ù‹ Ù„Ù„Ø§Ø·Ù„Ø§Ø¹ Ø¹Ù„Ù‰ Ø£Ø­Ø¯Ø« Ø§Ù„ØªØ­Ø¯ÙŠØ«Ø§Øª ÙÙˆØ± Ù†Ø´Ø±Ù‡Ø§.',
    'list.loadMore': 'ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ø²ÙŠØ¯',
    'card.readMore': 'Ø¹Ø±Ø¶ Ø§Ù„ØªÙØ§ØµÙŠÙ„',
    'detail.back': 'â† Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ø£Ø®Ø¨Ø§Ø±',
    'detail.publishedAt': 'ØªØ§Ø±ÙŠØ® Ø§Ù„Ù†Ø´Ø±',
    'detail.updatedAt': 'Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«',
    'detail.loading': 'Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù‚Ø§Ù„â€¦',
    'detail.error': 'ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù‚Ø§Ù„. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.',
    'toast.loadError': 'ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø£Ø®Ø¨Ø§Ø±. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.',
    'toast.detailError': 'ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù‚Ø§Ù„. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.',
  },
};

export function tInvestorNews(key: MessageKey, language: InvestorLanguage) {
  return messages[language][key];
}


