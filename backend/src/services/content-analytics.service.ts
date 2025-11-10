import { requireSupabaseAdmin } from '../lib/supabase';

type NewsContentEventType = 'impression' | 'detail_view';

type MaybeArray<T> = T | T[] | null | undefined;

type RawAnalyticsEventRow = {
  id: string;
  news_id: string;
  event_type: NewsContentEventType;
  created_at: string;
  news?:
    | {
        id: string | null;
        title: string | null;
        slug: string | null;
        published_at: string | null;
      }
    | Array<{
        id: string | null;
        title: string | null;
        slug: string | null;
        published_at: string | null;
      }>
    | null;
};

type ActorContext = {
  actorId?: string | null;
  context?: string | null;
};

type NewsMetadata = {
  id: string | null;
  title: string | null;
  slug: string | null;
  published_at: string | null;
};

function firstOrNull<T>(value: MaybeArray<T>): T | null {
  if (value == null) {
    return null;
  }
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function truncateDayIso(value: string): string {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}

function normaliseNewsMetadata(value: MaybeArray<NewsMetadata>): {
  id: string | null;
  title: string | null;
  slug: string | null;
  publishedAt: string | null;
} {
  const entry = firstOrNull(value);
  return {
    id: entry?.id ?? null,
    title: entry?.title ?? null,
    slug: entry?.slug ?? null,
    publishedAt: entry?.published_at ?? null,
  };
}

export interface ContentAnalyticsNewsRow {
  newsId: string;
  title: string | null;
  slug: string | null;
  publishedAt: string | null;
  impressions: number;
  views: number;
  ctr: number;
}

export interface ContentAnalyticsTrendPoint {
  day: string;
  impressions: number;
  views: number;
  ctr: number;
}

export interface ContentAnalyticsSummary {
  totalImpressions: number;
  totalViews: number;
  overallCtr: number;
  topNews: ContentAnalyticsNewsRow[];
}

export interface ContentAnalyticsResponse {
  summary: ContentAnalyticsSummary;
  trend: ContentAnalyticsTrendPoint[];
  news: ContentAnalyticsNewsRow[];
  generatedAt: string;
  range: {
    from: string;
    to: string;
    days: number;
  };
}

interface AnalyticsAggregationParams {
  days?: number;
  limitTop?: number;
}

export async function recordNewsImpressions(
  newsIds: string[],
  options: ActorContext = {}
): Promise<void> {
  if (!Array.isArray(newsIds) || newsIds.length === 0) {
    return;
  }

  const adminClient = requireSupabaseAdmin();
  const payload = newsIds.map(newsId => ({
    news_id: newsId,
    event_type: 'impression' as NewsContentEventType,
    actor_id: options.actorId ?? null,
    context: options.context ?? null,
  }));

  const { error } = await adminClient
    .from('news_content_events')
    .insert(payload);

  if (error) {
    throw new Error(
      `FAILED_RECORD_IMPRESSIONS:${error.message ?? 'unknown error'}`
    );
  }
}

export async function recordNewsView(
  newsId: string,
  options: ActorContext = {}
): Promise<void> {
  if (!newsId) {
    return;
  }

  const adminClient = requireSupabaseAdmin();
  const { error } = await adminClient.from('news_content_events').insert({
    news_id: newsId,
    event_type: 'detail_view' as NewsContentEventType,
    actor_id: options.actorId ?? null,
    context: options.context ?? null,
  });

  if (error) {
    throw new Error(`FAILED_RECORD_VIEW:${error.message ?? 'unknown error'}`);
  }
}

export async function getContentAnalytics(
  params: AnalyticsAggregationParams = {}
): Promise<ContentAnalyticsResponse> {
  const adminClient = requireSupabaseAdmin();
  const days = Math.max(params.days ?? 30, 1);
  const limitTop = Math.max(params.limitTop ?? 5, 1);

  const now = new Date();
  const to = now.toISOString();
  const fromDate = new Date(now);
  fromDate.setUTCDate(fromDate.getUTCDate() - (days - 1));
  fromDate.setUTCHours(0, 0, 0, 0);
  const from = fromDate.toISOString();

  const { data, error } = await adminClient
    .from('news_content_events')
    .select(
      `
        id,
        news_id,
        event_type,
        created_at,
        news:news!news_content_events_news_id_fkey (
          id,
          title,
          slug,
          published_at
        )
      `
    )
    .gte('created_at', from)
    .order('created_at', { ascending: false })
    .limit(50000);

  if (error) {
    throw new Error(
      `FAILED_FETCH_CONTENT_ANALYTICS:${error.message ?? 'unknown error'}`
    );
  }

  const rows = ((data ?? []) as RawAnalyticsEventRow[]).map(row => ({
    ...row,
    created_at: row.created_at,
  }));

  const newsAggregation = new Map<
    string,
    {
      impressions: number;
      views: number;
      metadata: ReturnType<typeof normaliseNewsMetadata>;
    }
  >();

  const trendBuckets = new Map<
    string,
    {
      impressions: number;
      views: number;
    }
  >();

  for (let offset = 0; offset < days; offset += 1) {
    const bucketDate = new Date(fromDate);
    bucketDate.setUTCDate(fromDate.getUTCDate() + offset);
    const bucketKey = bucketDate.toISOString();
    trendBuckets.set(bucketKey, { impressions: 0, views: 0 });
  }

  let totalImpressions = 0;
  let totalViews = 0;

  rows.forEach(row => {
    const metadata = normaliseNewsMetadata(row.news);
    if (!metadata.id) {
      return;
    }

    const existing = newsAggregation.get(metadata.id) ?? {
      impressions: 0,
      views: 0,
      metadata,
    };

    if (row.event_type === 'impression') {
      existing.impressions += 1;
      totalImpressions += 1;
    } else if (row.event_type === 'detail_view') {
      existing.views += 1;
      totalViews += 1;
    }

    newsAggregation.set(metadata.id, existing);

    const dayKey = truncateDayIso(row.created_at);
    if (!trendBuckets.has(dayKey)) {
      trendBuckets.set(dayKey, { impressions: 0, views: 0 });
    }
    const trendEntry = trendBuckets.get(dayKey)!;
    if (row.event_type === 'impression') {
      trendEntry.impressions += 1;
    } else if (row.event_type === 'detail_view') {
      trendEntry.views += 1;
    }
  });

  const newsRows: ContentAnalyticsNewsRow[] = Array.from(
    newsAggregation.entries()
  ).map(([newsId, value]) => {
    const ctr = value.impressions > 0 ? value.views / value.impressions : 0;

    return {
      newsId,
      title: value.metadata.title,
      slug: value.metadata.slug,
      publishedAt: value.metadata.publishedAt,
      impressions: value.impressions,
      views: value.views,
      ctr,
    };
  });

  newsRows.sort((a, b) => {
    if (b.views !== a.views) {
      return b.views - a.views;
    }
    if (b.impressions !== a.impressions) {
      return b.impressions - a.impressions;
    }
    return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '');
  });

  const trend: ContentAnalyticsTrendPoint[] = Array.from(trendBuckets.entries())
    .map(([day, value]) => {
      const ctr = value.impressions > 0 ? value.views / value.impressions : 0;
      return {
        day,
        impressions: value.impressions,
        views: value.views,
        ctr,
      };
    })
    .sort((a, b) => (a.day > b.day ? 1 : -1));

  const overallCtr = totalImpressions > 0 ? totalViews / totalImpressions : 0;
  const topNews = newsRows.slice(0, limitTop);

  return {
    summary: {
      totalImpressions,
      totalViews,
      overallCtr,
      topNews,
    },
    trend,
    news: newsRows,
    generatedAt: new Date().toISOString(),
    range: {
      from,
      to,
      days,
    },
  };
}
