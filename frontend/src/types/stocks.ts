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

export type StockTrend = 'up' | 'down' | 'flat';

export interface InvestorStockInsights {
  rangeHigh30d: number;
  rangeLow30d: number;
  averageVolume30d: number;
  movingAverage7d: number;
  movingAverage30d: number;
  volatility30d: number;
  trend: StockTrend;
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

