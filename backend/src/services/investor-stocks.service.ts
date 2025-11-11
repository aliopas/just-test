import { supabaseAdmin } from '../lib/supabase';

type StockRow = {
  recorded_at: string;
  open_price: string | number | null;
  high_price: string | number | null;
  low_price: string | number | null;
  close_price: string | number | null;
  volume: string | number | null;
};

export interface InvestorStockSnapshot {
  recordedAt: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface InvestorStockHighlight {
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  recordedAt: string;
  previousClose: number | null;
}

export interface InvestorStockInsights {
  rangeHigh30d: number;
  rangeLow30d: number;
  averageVolume30d: number;
  movingAverage7d: number;
  movingAverage30d: number;
  volatility30d: number;
  trend: 'up' | 'down' | 'flat';
  bestDay: string | null;
  worstDay: string | null;
}

export interface InvestorStockFeed {
  symbol: string;
  companyName: string;
  currency: string;
  latest: InvestorStockHighlight;
  timeline: InvestorStockSnapshot[];
  insights: InvestorStockInsights;
}

const DEFAULT_LIMIT = 60;
const MIN_LIMIT = 10;
const MAX_LIMIT = 180;

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function clampLimit(limit?: number | null): number {
  if (!limit) {
    return DEFAULT_LIMIT;
  }
  if (!Number.isFinite(limit)) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.max(Math.floor(limit), MIN_LIMIT), MAX_LIMIT);
}

function calculateMovingAverage(values: number[], window: number): number {
  if (values.length === 0) {
    return 0;
  }
  const slice = values.slice(-window);
  const total = slice.reduce((sum, value) => sum + value, 0);
  return Number((total / slice.length).toFixed(2));
}

function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    values.length;
  return Number(Math.sqrt(variance).toFixed(2));
}

function resolveTrend(
  firstClose: number,
  lastClose: number,
  thresholdPercent = 1
): 'up' | 'down' | 'flat' {
  if (firstClose === 0) {
    return 'flat';
  }
  const deltaPercent = ((lastClose - firstClose) / firstClose) * 100;
  if (deltaPercent > thresholdPercent) {
    return 'up';
  }
  if (deltaPercent < -thresholdPercent) {
    return 'down';
  }
  return 'flat';
}

function buildEmptyFeed(): InvestorStockFeed {
  const nowIso = new Date().toISOString();
  return {
    symbol: 'BACURA',
    companyName: 'Bacura Holdings',
    currency: 'SAR',
    latest: {
      price: 0,
      change: 0,
      changePercent: 0,
      open: 0,
      high: 0,
      low: 0,
      volume: 0,
      recordedAt: nowIso,
      previousClose: null,
    },
    timeline: [],
    insights: {
      rangeHigh30d: 0,
      rangeLow30d: 0,
      averageVolume30d: 0,
      movingAverage7d: 0,
      movingAverage30d: 0,
      volatility30d: 0,
      trend: 'flat',
      bestDay: null,
      worstDay: null,
    },
  };
}

function mapRowsToTimeline(rows: StockRow[]): InvestorStockSnapshot[] {
  return rows
    .map<InvestorStockSnapshot>(row => {
      const recordedAt = row.recorded_at;
      return {
        recordedAt,
        open: Number(toNumber(row.open_price).toFixed(2)),
        high: Number(toNumber(row.high_price).toFixed(2)),
        low: Number(toNumber(row.low_price).toFixed(2)),
        close: Number(toNumber(row.close_price).toFixed(2)),
        volume: Math.max(Math.round(toNumber(row.volume)), 0),
      };
    })
    .sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );
}

function buildFeedFromTimeline(
  timeline: InvestorStockSnapshot[]
): InvestorStockFeed {
  if (timeline.length === 0) {
    return buildEmptyFeed();
  }

  const sortedTimeline = timeline.slice().sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  const latest = sortedTimeline[sortedTimeline.length - 1];
  const previous =
    sortedTimeline.length >= 2
      ? sortedTimeline[sortedTimeline.length - 2]
      : undefined;

  const change = previous ? latest.close - previous.close : 0;
  const changePercent =
    previous && previous.close !== 0
      ? Number(((change / previous.close) * 100).toFixed(2))
      : 0;

  const closes = sortedTimeline.map(point => point.close);
  const volumes = sortedTimeline.map(point => point.volume);

  const last30Closes = closes.slice(-30);
  const last30Volumes = volumes.slice(-30);

  const rangeHigh30d =
    last30Closes.length > 0 ? Math.max(...last30Closes) : latest.close;
  const rangeLow30d =
    last30Closes.length > 0 ? Math.min(...last30Closes) : latest.close;
  const averageVolume30d =
    last30Volumes.length > 0
      ? Number(
          (
            last30Volumes.reduce((sum, value) => sum + value, 0) /
            last30Volumes.length
          ).toFixed(0)
        )
      : latest.volume;

  const movingAverage7d = calculateMovingAverage(closes, 7);
  const movingAverage30d = calculateMovingAverage(closes, 30);
  const volatility30d = calculateStandardDeviation(last30Closes);
  const trend = resolveTrend(closes[0] ?? latest.close, latest.close);

  let bestDay: string | null = null;
  let bestClose = Number.NEGATIVE_INFINITY;
  let worstDay: string | null = null;
  let worstClose = Number.POSITIVE_INFINITY;

  for (const point of sortedTimeline) {
    if (point.close > bestClose) {
      bestClose = point.close;
      bestDay = point.recordedAt;
    }
    if (point.close < worstClose) {
      worstClose = point.close;
      worstDay = point.recordedAt;
    }
  }

  const highlight: InvestorStockHighlight = {
    price: latest.close,
    change: Number(change.toFixed(2)),
    changePercent,
    open: latest.open,
    high: latest.high,
    low: latest.low,
    volume: latest.volume,
    recordedAt: latest.recordedAt,
    previousClose: previous ? previous.close : null,
  };

  return {
    symbol: 'BACURA',
    companyName: 'Bacura Holdings',
    currency: 'SAR',
    latest: highlight,
    timeline: sortedTimeline,
    insights: {
      rangeHigh30d: Number(rangeHigh30d.toFixed(2)),
      rangeLow30d: Number(rangeLow30d.toFixed(2)),
      averageVolume30d,
      movingAverage7d,
      movingAverage30d,
      volatility30d,
      trend,
      bestDay,
      worstDay,
    },
  };
}

function buildSyntheticTimeline(limit: number): InvestorStockSnapshot[] {
  const timeline: InvestorStockSnapshot[] = [];
  const days = Math.max(limit, MIN_LIMIT);
  const now = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const dayIndex = days - 1 - offset;
    const recordedAt = new Date(now);
    recordedAt.setHours(15, 0, 0, 0);
    recordedAt.setDate(recordedAt.getDate() - offset);

    const openBase = 93 + dayIndex * 0.22;
    const openWave = Math.sin(dayIndex / 3.7) * 1.4;
    const open = Number((openBase + openWave).toFixed(2));

    const closeWave = Math.cos(dayIndex / 2.9) * 0.95;
    const close = Number((open + closeWave).toFixed(2));

    const upSwing = 0.85 + Math.abs(Math.sin(dayIndex / 4.5)) * 1.2;
    const downSwing = 0.6 + Math.abs(Math.cos(dayIndex / 5.1)) * 1.05;

    const rawHigh = Math.max(open, close) + upSwing;
    const rawLow = Math.min(open, close) - downSwing;

    const high = Number(Math.max(rawHigh, open, close).toFixed(2));
    const low = Number(Math.max(Math.min(rawLow, open, close), 0.01).toFixed(2));

    const volumeBase = 150_000 + dayIndex * 1_950;
    const volumeWave = Math.sin(dayIndex / 2.8) * 13_000;
    const volume = Math.max(Math.round(volumeBase + volumeWave), 12_000);

    timeline.push({
      recordedAt: recordedAt.toISOString(),
      open,
      high,
      low,
      close: Number(Math.max(close, 0.01).toFixed(2)),
      volume,
    });
  }

  return timeline;
}

function buildFallbackFeed(limit: number): InvestorStockFeed {
  const timeline = buildSyntheticTimeline(limit);
  return buildFeedFromTimeline(timeline);
}

export async function getBacuraStockFeed(params?: {
  limit?: number;
}): Promise<InvestorStockFeed> {
  const limit = clampLimit(params?.limit);

  if (!supabaseAdmin) {
    console.warn(
      'Supabase admin client is not configured; returning synthetic Bacura stock feed.'
    );
    return buildFallbackFeed(limit);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('bacura_stock_snapshots')
      .select(
        `
          recorded_at,
          open_price,
          high_price,
          low_price,
          close_price,
          volume
        `
      )
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(
        'Failed to fetch Bacura stock snapshots from Supabase:',
        error
      );
      return buildFallbackFeed(limit);
    }

    const rows = (data as StockRow[] | null) ?? [];

    if (rows.length === 0) {
      console.warn(
        'Supabase returned no Bacura stock snapshots; falling back to synthetic feed.'
      );
      return buildFallbackFeed(limit);
    }

    const timeline = mapRowsToTimeline(rows);
    return buildFeedFromTimeline(timeline);
  } catch (error) {
    console.error('Unexpected error while resolving Bacura stock feed:', error);
    return buildFallbackFeed(limit);
  }
}


