import { requireSupabaseAdmin } from '../lib/supabase';
import type { RequestStatus } from './request-state.service';

type StatusRow = {
  status: string | null;
};

type RequestCreatedRow = {
  created_at: string;
};

type EventRow = {
  request_id: string;
  to_status: string;
  created_at: string;
};

type StuckRow = {
  id: string;
  request_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  investor: {
    email: string | null;
  } | null;
};

export interface AdminDashboardStats {
  summary: {
    totalRequests: number;
    byStatus: Record<string, number>;
    averageProcessingHours: number | null;
    medianProcessingHours: number | null;
  };
  trend: Array<{ day: string; count: number }>;
  stuckRequests: Array<{
    id: string;
    requestNumber: string;
    status: RequestStatus | string;
    investorEmail: string | null;
    ageHours: number;
    updatedAt: string;
  }>;
}

function normaliseStatusCounts(rows: StatusRow[]): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    if (!row.status) {
      return acc;
    }
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});
}

function truncateDay(value: string): string {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function buildTrend(rows: RequestCreatedRow[], trendDays: number) {
  const buckets = new Map<string, number>();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - trendDays + 1);
  startDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < trendDays; i += 1) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    buckets.set(day.toISOString(), 0);
  }

  rows.forEach(row => {
    const dayKey = truncateDay(row.created_at);
    if (buckets.has(dayKey)) {
      buckets.set(dayKey, (buckets.get(dayKey) ?? 0) + 1);
    }
  });

  return Array.from(buckets.entries())
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => (a.day > b.day ? 1 : -1));
}

function hoursBetween(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
}

function computeProcessingStats(events: EventRow[]) {
  const submittedStatus = 'submitted';
  const finalStatuses = new Set(['approved', 'rejected', 'completed']);
  const grouped = new Map<string, { submittedAt: string | null; finalAt: string | null }>();

  events.forEach(event => {
    if (!grouped.has(event.request_id)) {
      grouped.set(event.request_id, { submittedAt: null, finalAt: null });
    }
    const entry = grouped.get(event.request_id)!;
    if (event.to_status === submittedStatus) {
      entry.submittedAt ??= event.created_at;
    }
    if (finalStatuses.has(event.to_status) && entry.finalAt == null) {
      entry.finalAt = event.created_at;
    }
  });

  const durations: number[] = [];
  grouped.forEach(entry => {
    if (entry.submittedAt && entry.finalAt) {
      durations.push(hoursBetween(entry.submittedAt, entry.finalAt));
    }
  });

  if (durations.length === 0) {
    return { average: null, median: null };
  }

  const sum = durations.reduce((acc, value) => acc + value, 0);
  const average = sum / durations.length;
  const sorted = durations.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];

  return { average, median };
}

function mapStuckRows(rows: StuckRow[]) {
  return rows.map(row => ({
    id: row.id,
    requestNumber: row.request_number,
    status: row.status,
    investorEmail: row.investor?.email ?? null,
    ageHours: hoursBetween(
      row.created_at,
      row.updated_at ?? new Date().toISOString()
    ),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  }));
}

export async function getAdminDashboardStats(params?: {
  stuckThresholdHours?: number;
  trendDays?: number;
  processingWindowDays?: number;
}): Promise<AdminDashboardStats> {
  const adminClient = requireSupabaseAdmin();

  const stuckThreshold = params?.stuckThresholdHours ?? 24 * 7;
  const trendDays = params?.trendDays ?? 14;
  const processingWindowDays = params?.processingWindowDays ?? 60;

  const trendStart = new Date();
  trendStart.setDate(trendStart.getDate() - trendDays + 1);
  trendStart.setHours(0, 0, 0, 0);

  const processingStart = new Date();
  processingStart.setDate(processingStart.getDate() - processingWindowDays);

  const statusPromise = adminClient.from('requests').select('status');

  const trendPromise = adminClient
    .from('requests')
    .select('created_at')
    .gte('created_at', trendStart.toISOString());

  const processingPromise = adminClient
    .from('request_events')
    .select('request_id, to_status, created_at')
    .in('to_status', ['submitted', 'approved', 'rejected', 'completed'])
    .gte('created_at', processingStart.toISOString())
    .order('created_at', { ascending: true })
    .limit(5000);

  const stuckPromise = adminClient
    .from('requests')
    .select(
      `
        id,
        request_number,
        status,
        created_at,
        updated_at,
        investor:users!requests_user_id_fkey (
          email
        )
      `
    )
    .in('status', ['pending_info', 'screening', 'compliance_review'])
    .lt(
      'updated_at',
      new Date(Date.now() - stuckThreshold * 60 * 60 * 1000).toISOString()
    )
    .order('updated_at', { ascending: true })
    .limit(15);

  const [statusResult, trendResult, processingResult, stuckResult] =
    await Promise.all([statusPromise, trendPromise, processingPromise, stuckPromise]);

  if (statusResult.error) {
    throw new Error(`FAILED_STATUS_SUMMARY:${statusResult.error.message ?? 'unknown'}`);
  }

  if (trendResult.error) {
    throw new Error(`FAILED_TREND:${trendResult.error.message ?? 'unknown'}`);
  }

  if (processingResult.error) {
    throw new Error(`FAILED_PROCESSING:${processingResult.error.message ?? 'unknown'}`);
  }

  if (stuckResult.error) {
    throw new Error(`FAILED_STUCK:${stuckResult.error.message ?? 'unknown'}`);
  }

  const statusCounts = normaliseStatusCounts(
    (statusResult.data as StatusRow[]) ?? []
  );
  const totalRequests = Object.values(statusCounts).reduce(
    (sum, value) => sum + value,
    0
  );

  const trend = buildTrend(
    ((trendResult.data ?? []) as RequestCreatedRow[]) ?? [],
    trendDays
  );

  const { average, median } = computeProcessingStats(
    ((processingResult.data ?? []) as EventRow[]) ?? []
  );

  return {
    summary: {
      totalRequests,
      byStatus: statusCounts,
      averageProcessingHours: average,
      medianProcessingHours: median,
    },
    trend,
    stuckRequests: mapStuckRows(((stuckResult.data ?? []) as StuckRow[]) ?? []),
  };
}

