import {
  getContentAnalytics,
  recordNewsImpressions,
  recordNewsView,
} from '../src/services/content-analytics.service';
import { requireSupabaseAdmin } from '../src/lib/supabase';

jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

const mockRequireAdmin = requireSupabaseAdmin as jest.Mock;

function createInsertBuilder() {
  const insert = jest.fn().mockResolvedValue({ error: null });
  return {
    insert,
  };
}

function createSelectBuilder(result: unknown) {
  const builder: any = {
    select: jest.fn(() => builder),
    gte: jest.fn(() => builder),
    order: jest.fn(() => builder),
    limit: jest.fn(() => Promise.resolve(result)),
  };
  return builder;
}

describe('content-analytics.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('records news impressions for provided ids', async () => {
    const builder = createInsertBuilder();
    const fromMock = jest.fn().mockReturnValue(builder);
    mockRequireAdmin.mockReturnValue({ from: fromMock });

    await recordNewsImpressions(['news-1', 'news-2'], {
      actorId: 'user-1',
      context: 'public_feed',
    });

    expect(fromMock).toHaveBeenCalledWith('news_content_events');
    expect(builder.insert).toHaveBeenCalledWith([
      {
        news_id: 'news-1',
        event_type: 'impression',
        actor_id: 'user-1',
        context: 'public_feed',
      },
      {
        news_id: 'news-2',
        event_type: 'impression',
        actor_id: 'user-1',
        context: 'public_feed',
      },
    ]);
  });

  it('records news view event', async () => {
    const builder = createInsertBuilder();
    const fromMock = jest.fn().mockReturnValue(builder);
    mockRequireAdmin.mockReturnValue({ from: fromMock });

    await recordNewsView('news-1', { context: 'public_detail' });

    expect(builder.insert).toHaveBeenCalledWith({
      news_id: 'news-1',
      event_type: 'detail_view',
      actor_id: null,
      context: 'public_detail',
    });
  });

  it('aggregates analytics over the requested period', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-11-10T12:00:00.000Z'));

    const events = [
      {
        id: 'evt-1',
        news_id: 'news-1',
        event_type: 'impression',
        created_at: '2025-11-09T10:00:00.000Z',
        news: {
          id: 'news-1',
          title: 'Deal announced',
          slug: 'deal-announced',
          published_at: '2025-11-01T08:00:00.000Z',
        },
      },
      {
        id: 'evt-2',
        news_id: 'news-1',
        event_type: 'detail_view',
        created_at: '2025-11-09T10:05:00.000Z',
        news: {
          id: 'news-1',
          title: 'Deal announced',
          slug: 'deal-announced',
          published_at: '2025-11-01T08:00:00.000Z',
        },
      },
      {
        id: 'evt-3',
        news_id: 'news-1',
        event_type: 'detail_view',
        created_at: '2025-11-08T09:00:00.000Z',
        news: {
          id: 'news-1',
          title: 'Deal announced',
          slug: 'deal-announced',
          published_at: '2025-11-01T08:00:00.000Z',
        },
      },
      {
        id: 'evt-4',
        news_id: 'news-2',
        event_type: 'impression',
        created_at: '2025-11-07T09:00:00.000Z',
        news: {
          id: 'news-2',
          title: 'Market update',
          slug: 'market-update',
          published_at: '2025-10-28T09:00:00.000Z',
        },
      },
      {
        id: 'evt-5',
        news_id: 'news-2',
        event_type: 'detail_view',
        created_at: '2025-11-07T09:05:00.000Z',
        news: {
          id: 'news-2',
          title: 'Market update',
          slug: 'market-update',
          published_at: '2025-10-28T09:00:00.000Z',
        },
      },
    ];

    const builder = createSelectBuilder({ data: events, error: null });
    const fromMock = jest.fn().mockReturnValue(builder);
    mockRequireAdmin.mockReturnValue({ from: fromMock });

    const result = await getContentAnalytics({ days: 7, limitTop: 2 });

    expect(fromMock).toHaveBeenCalledWith('news_content_events');
    expect(builder.select).toHaveBeenCalled();
    expect(builder.gte).toHaveBeenCalledWith(
      'created_at',
      '2025-11-04T00:00:00.000Z'
    );

    expect(result.summary.totalImpressions).toBe(2);
    expect(result.summary.totalViews).toBe(3);
    expect(result.summary.overallCtr).toBeCloseTo(1.5);
    expect(result.summary.topNews[0]).toEqual(
      expect.objectContaining({
        newsId: 'news-1',
        impressions: 1,
        views: 2,
      })
    );
    expect(result.news).toHaveLength(2);

    const trendPoint = result.trend.find(point =>
      point.day.startsWith('2025-11-09')
    );
    expect(trendPoint).toEqual(
      expect.objectContaining({
        impressions: 1,
        views: 1,
      })
    );

    jest.useRealTimers();
  });
});


