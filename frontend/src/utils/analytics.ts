type AnalyticsEventName =
  | 'investor_profile_viewed'
  | 'investor_profile_updated'
  | 'investor_language_changed'
  | 'request_created'
  | 'investor_news_view';

// Placeholder analytics adapter until Segment (or similar) is wired.
class AnalyticsClient {
  track(event: AnalyticsEventName | string, payload?: Record<string, unknown>) {
    // Skip analytics in test mode (Next.js uses NODE_ENV)
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    // eslint-disable-next-line no-console
    console.info('[analytics]', event, payload ?? {});
  }
}

export const analytics = new AnalyticsClient();



