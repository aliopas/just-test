import { requireSupabaseAdmin } from '../lib/supabase';
import { REQUEST_STATUSES, type RequestStatus } from './request-state.service';

type RequestRow = {
  id: string;
  request_number: string;
  status: RequestStatus;
  amount: number;
  currency: string | null;
  created_at: string;
  updated_at?: string;
};

type StatusRow = {
  status: string | null;
};

type PendingRow = {
  id: string;
  request_number: string;
  updated_at: string;
};

type NotificationCount = {
  count: number | null;
  error: { message?: string } | null;
};

export interface InvestorDashboardSummary {
  total: number;
  byStatus: Record<RequestStatus, number>;
}

export interface InvestorDashboardResponse {
  requestSummary: InvestorDashboardSummary;
  recentRequests: Array<{
    id: string;
    requestNumber: string;
    status: RequestStatus;
    amount: number;
    currency: string;
    createdAt: string;
  }>;
  pendingActions: {
    pendingInfoCount: number;
    items: Array<{
      id: string;
      requestNumber: string;
      updatedAt: string;
    }>;
  };
  unreadNotifications: number;
  generatedAt: string;
}

function initialiseStatusMap(): Record<RequestStatus, number> {
  return REQUEST_STATUSES.reduce<Record<RequestStatus, number>>(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<RequestStatus, number>
  );
}

export async function getInvestorDashboard(params: {
  userId: string;
  recentLimit?: number;
}): Promise<InvestorDashboardResponse> {
  const adminClient = requireSupabaseAdmin();
  const recentLimit = params.recentLimit ?? 5;

  const statusPromise = adminClient
    .from('requests')
    .select('status')
    .eq('user_id', params.userId);

  const recentPromise = adminClient
    .from('requests')
    .select(
      `
        id,
        request_number,
        status,
        amount,
        currency,
        created_at
      `
    )
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false })
    .limit(recentLimit);

  const pendingInfoPromise = adminClient
    .from('requests')
    .select('id, request_number, updated_at')
    .eq('user_id', params.userId)
    .eq('status', 'pending_info')
    .order('updated_at', { ascending: false })
    .limit(5);

  const unreadPromise = adminClient
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', params.userId)
    .is('read_at', null);

  const [statusResult, recentResult, pendingResult, unreadResult] =
    await Promise.all([
      statusPromise,
      recentPromise,
      pendingInfoPromise,
      unreadPromise as unknown as Promise<NotificationCount>,
    ]);

  if (statusResult.error) {
    throw new Error(
      `FAILED_STATUS_SUMMARY:${statusResult.error.message ?? 'unknown'}`
    );
  }

  if (recentResult.error) {
    throw new Error(
      `FAILED_RECENT_REQUESTS:${recentResult.error.message ?? 'unknown'}`
    );
  }

  if (pendingResult.error) {
    throw new Error(
      `FAILED_PENDING_INFO:${pendingResult.error.message ?? 'unknown'}`
    );
  }

  if (unreadResult.error) {
    throw new Error(
      `FAILED_UNREAD_NOTIFICATIONS:${unreadResult.error.message ?? 'unknown'}`
    );
  }

  const statusCounts = initialiseStatusMap();
  let total = 0;
  for (const row of (statusResult.data ?? []) as StatusRow[]) {
    if (!row?.status) {
      continue;
    }
    if ((row.status as RequestStatus) in statusCounts) {
      statusCounts[row.status as RequestStatus] += 1;
    }
    total += 1;
  }

  const recentRequests = ((recentResult.data ?? []) as RequestRow[]).map(
    row => ({
      id: row.id,
      requestNumber: row.request_number,
      status: row.status,
      amount: Number(row.amount ?? 0),
      currency: row.currency ?? 'SAR',
      createdAt: row.created_at,
    })
  );

  const pendingItems = ((pendingResult.data ?? []) as PendingRow[]).map(
    row => ({
      id: row.id,
      requestNumber: row.request_number,
      updatedAt: row.updated_at,
    })
  );

  const pendingInfoCount = statusCounts.pending_info ?? pendingItems.length;

  return {
    requestSummary: {
      total,
      byStatus: statusCounts,
    },
    recentRequests,
    pendingActions: {
      pendingInfoCount,
      items: pendingItems,
    },
    unreadNotifications: unreadResult.count ?? 0,
    generatedAt: new Date().toISOString(),
  };
}
