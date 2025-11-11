import { requireSupabaseAdmin } from '../lib/supabase';

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

function buildFallbackFeed(): InvestorStockFeed {
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

export async function getBacuraStockFeed(params?: {
  limit?: number;
}): Promise<InvestorStockFeed> {
  const adminClient = requireSupabaseAdmin();
  const limit = clampLimit(params?.limit);

  const { data, error } = await adminClient
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
    throw new Error(
      `FAILED_STOCK_SNAPSHOTS:${error.message ?? 'An unknown error occurred'}`
    );
  }

  const rows = (data as StockRow[] | null) ?? [];

  if (rows.length === 0) {
    return buildFallbackFeed();
  }

  const timeline = rows
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

  const latest = timeline[timeline.length - 1];
  const previous =
    timeline.length >= 2 ? timeline[timeline.length - 2] : undefined;

  const change = previous ? latest.close - previous.close : 0;
  const changePercent =
    previous && previous.close !== 0
      ? Number(((change / previous.close) * 100).toFixed(2))
      : 0;

  const closes = timeline.map(point => point.close);
  const volumes = timeline.map(point => point.volume);

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

  for (const point of timeline) {
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
    timeline,
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

