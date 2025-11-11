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
  investor:
    | {
        email: string | null;
      }
    | { email: string | null }[]
    | null;
};

const PENDING_INFO_THRESHOLD_HOURS = 24;
const PENDING_INFO_ALERT_RATE = 0.25;
const ATTACHMENT_SUCCESS_ALERT_RATE = 0.9;
const NOTIFICATION_FAILURE_WINDOW_DAYS = 30;
const NOTIFICATION_FAILURE_ALERT_RATE = 0.05;

export interface AdminDashboardKpis {
  processingHours: {
    average: number | null;
    median: number | null;
    p90: number | null;
  };
  pendingInfoAging: {
    total: number;
    overdue: number;
    thresholdHours: number;
    rate: number;
    alert: boolean;
  };
  attachmentSuccess: {
    totalRequests: number;
    withAttachments: number;
    rate: number | null;
    alert: boolean;
  };
  notificationFailures: {
    total: number;
    failed: number;
    rate: number | null;
    windowDays: number;
    alert: boolean;
  };
}

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
  kpis: AdminDashboardKpis;
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
  const grouped = new Map<
    string,
    { submittedAt: string | null; finalAt: string | null }
  >();

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
    return { average: null, median: null, p90: null };
  }

  const sum = durations.reduce((acc, value) => acc + value, 0);
  const average = sum / durations.length;
  const sorted = durations.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
  const p90Index = Math.min(
    sorted.length - 1,
    Math.ceil(sorted.length * 0.9) - 1
  );
  const p90 = sorted[p90Index] ?? null;

  return { average, median, p90 };
}

function mapStuckRows(rows: StuckRow[]) {
  return rows.map(row => ({
    id: row.id,
    requestNumber: row.request_number,
    status: row.status,
    investorEmail: Array.isArray(row.investor)
      ? (row.investor[0]?.email ?? null)
      : (row.investor?.email ?? null),
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

  const pendingInfoCutoff = new Date(
    Date.now() - PENDING_INFO_THRESHOLD_HOURS * 60 * 60 * 1000
  ).toISOString();

  const notificationWindowStart = new Date(
    Date.now() - NOTIFICATION_FAILURE_WINDOW_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const pendingInfoPromise = adminClient
    .from('requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending_info');

  const pendingInfoOverduePromise = adminClient
    .from('requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending_info')
    .lt('updated_at', pendingInfoCutoff);

  const attachmentBasePromise = adminClient
    .from('requests')
    .select('id', { count: 'exact', head: true })
    .neq('status', 'draft');

  const attachmentWithPromise = adminClient
    .from('attachments')
    .select('request_id', { count: 'exact', head: true });

  const notificationTotalPromise = adminClient
    .from('notification_jobs')
    .select('id', { count: 'exact', head: true })
    .gte('scheduled_at', notificationWindowStart);

  const notificationFailedPromise = adminClient
    .from('notification_jobs')
    .select('id', { count: 'exact', head: true })
    .gte('scheduled_at', notificationWindowStart)
    .eq('status', 'failed');

  const [
    statusResult,
    trendResult,
    processingResult,
    stuckResult,
    pendingInfoResult,
    pendingInfoOverdueResult,
    attachmentBaseResult,
    attachmentWithResult,
    notificationTotalResult,
    notificationFailedResult,
  ] = await Promise.all([
    statusPromise,
    trendPromise,
    processingPromise,
    stuckPromise,
    pendingInfoPromise,
    pendingInfoOverduePromise,
    attachmentBasePromise,
    attachmentWithPromise,
    notificationTotalPromise,
    notificationFailedPromise,
  ]);

  if (statusResult.error) {
    throw new Error(
      `FAILED_STATUS_SUMMARY:${statusResult.error.message ?? 'unknown'}`
    );
  }

  if (trendResult.error) {
    throw new Error(`FAILED_TREND:${trendResult.error.message ?? 'unknown'}`);
  }

  if (processingResult.error) {
    throw new Error(
      `FAILED_PROCESSING:${processingResult.error.message ?? 'unknown'}`
    );
  }

  if (stuckResult.error) {
    throw new Error(`FAILED_STUCK:${stuckResult.error.message ?? 'unknown'}`);
  }

  if (pendingInfoResult.error) {
    throw new Error(
      `FAILED_PENDING_INFO:${pendingInfoResult.error.message ?? 'unknown'}`
    );
  }

  if (pendingInfoOverdueResult.error) {
    throw new Error(
      `FAILED_PENDING_INFO_OVERDUE:${
        pendingInfoOverdueResult.error.message ?? 'unknown'
      }`
    );
  }

  if (attachmentBaseResult.error) {
    throw new Error(
      `FAILED_ATTACHMENT_BASE:${attachmentBaseResult.error.message ?? 'unknown'}`
    );
  }

  if (attachmentWithResult.error) {
    throw new Error(
      `FAILED_ATTACHMENT_COUNT:${attachmentWithResult.error.message ?? 'unknown'}`
    );
  }

  if (notificationTotalResult.error) {
    throw new Error(
      `FAILED_NOTIFICATION_TOTAL:${
        notificationTotalResult.error.message ?? 'unknown'
      }`
    );
  }

  if (notificationFailedResult.error) {
    throw new Error(
      `FAILED_NOTIFICATION_FAILED:${
        notificationFailedResult.error.message ?? 'unknown'
      }`
    );
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

  const { average, median, p90 } = computeProcessingStats(
    ((processingResult.data ?? []) as EventRow[]) ?? []
  );

  const pendingInfoTotal = pendingInfoResult.count ?? 0;
  const pendingInfoOverdue = pendingInfoOverdueResult.count ?? 0;
  const pendingInfoRate =
    pendingInfoTotal === 0 ? 0 : pendingInfoOverdue / pendingInfoTotal;
  const pendingInfoAlert =
    pendingInfoOverdue > 0 && pendingInfoRate >= PENDING_INFO_ALERT_RATE;

  const attachmentBase = attachmentBaseResult.count ?? 0;
  const attachmentWith = attachmentWithResult.count ?? 0;
  const attachmentRate =
    attachmentBase === 0 ? null : Math.min(attachmentWith / attachmentBase, 1);
  const attachmentAlert =
    attachmentRate !== null && attachmentRate < ATTACHMENT_SUCCESS_ALERT_RATE;

  const notificationTotal = notificationTotalResult.count ?? 0;
  const notificationFailed = notificationFailedResult.count ?? 0;
  const notificationFailureRate =
    notificationTotal === 0 ? null : notificationFailed / notificationTotal;
  const notificationAlert =
    notificationFailureRate !== null &&
    notificationFailureRate >= NOTIFICATION_FAILURE_ALERT_RATE;

  return {
    summary: {
      totalRequests,
      byStatus: statusCounts,
      averageProcessingHours: average,
      medianProcessingHours: median,
    },
    trend,
    stuckRequests: mapStuckRows(((stuckResult.data ?? []) as StuckRow[]) ?? []),
    kpis: {
      processingHours: {
        average,
        median,
        p90,
      },
      pendingInfoAging: {
        total: pendingInfoTotal,
        overdue: pendingInfoOverdue,
        thresholdHours: PENDING_INFO_THRESHOLD_HOURS,
        rate: pendingInfoRate,
        alert: pendingInfoAlert,
      },
      attachmentSuccess: {
        totalRequests: attachmentBase,
        withAttachments: attachmentWith,
        rate: attachmentRate,
        alert: attachmentAlert,
      },
      notificationFailures: {
        total: notificationTotal,
        failed: notificationFailed,
        rate: notificationFailureRate,
        windowDays: NOTIFICATION_FAILURE_WINDOW_DAYS,
        alert: notificationAlert,
      },
    },
  };
}
