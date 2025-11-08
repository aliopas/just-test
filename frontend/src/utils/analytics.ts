type AnalyticsEventName =
  | 'investor_profile_viewed'
  | 'investor_profile_updated'
  | 'investor_language_changed'
  | 'request_created';

// Placeholder analytics adapter until Segment (or similar) is wired.
class AnalyticsClient {
  track(event: AnalyticsEventName | string, payload?: Record<string, unknown>) {
    if (import.meta.env.MODE === 'test') {
      return;
    }
    // eslint-disable-next-line no-console
    console.info('[analytics]', event, payload ?? {});
  }
}

export const analytics = new AnalyticsClient();


