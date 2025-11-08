type AnalyticsEventName =
  | 'investor_profile_viewed'
  | 'investor_profile_updated'
  | 'investor_language_changed';

interface AnalyticsPayload {
  [key: string]: unknown;
}

// Placeholder analytics adapter until Segment (or similar) is wired.
class AnalyticsClient {
  track(event: AnalyticsEventName, payload?: AnalyticsPayload) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    // eslint-disable-next-line no-console
    console.info('[analytics]', event, payload ?? {});
  }
}

export const analytics = new AnalyticsClient();


