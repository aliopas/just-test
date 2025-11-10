export interface AdminContentAnalyticsNewsRow {
  newsId: string;
  title: string | null;
  slug: string | null;
  publishedAt: string | null;
  impressions: number;
  views: number;
  ctr: number;
}

export interface AdminContentAnalyticsTrendPoint {
  day: string;
  impressions: number;
  views: number;
  ctr: number;
}

export interface AdminContentAnalyticsSummary {
  totalImpressions: number;
  totalViews: number;
  overallCtr: number;
  topNews: AdminContentAnalyticsNewsRow[];
}

export interface AdminContentAnalyticsResponse {
  summary: AdminContentAnalyticsSummary;
  trend: AdminContentAnalyticsTrendPoint[];
  news: AdminContentAnalyticsNewsRow[];
  generatedAt: string;
  range: {
    from: string;
    to: string;
    days: number;
  };
}


