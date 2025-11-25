import { requireSupabaseAdmin } from '../lib/supabase';
import { REQUEST_STATUSES, type RequestStatus } from './request-state.service';

type RequestRow = {
  id: string;
  request_number: string;
  type: RequestType | null;
  status: RequestStatus;
  amount: number;
  currency: string | null;
  created_at: string;
  updated_at?: string;
};

type RequestType = 'buy' | 'sell';

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
    type: RequestType;
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
  insights: {
    averageAmountByType: Record<RequestType, number>;
    rolling30DayVolume: number;
    lastRequest: {
      id: string;
      requestNumber: string;
      type: RequestType;
      status: RequestStatus;
      amount: number;
      currency: string;
      createdAt: string;
    } | null;
  };
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
  const recentLimit = params.recentLimit ?? 8;
  const thirtyDaysAgoIso = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

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
        type,
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

  const rollingVolumePromise = adminClient
    .from('requests')
    .select('total:sum(amount)', { head: false })
    .eq('user_id', params.userId)
    .gte('created_at', thirtyDaysAgoIso)
    .maybeSingle<{ total: number | null }>();

  const averagePromises = (['buy', 'sell'] as const).map(type =>
    adminClient
      .from('requests')
      .select('average:avg(amount)', { head: false })
      .eq('user_id', params.userId)
      .eq('type', type)
      .maybeSingle<{ average: number | null }>()
  );

  const [
    statusResult,
    recentResult,
    pendingResult,
    unreadResult,
    rollingVolumeResult,
    averageBuyResult,
    averageSellResult,
  ] = await Promise.all([
    statusPromise,
    recentPromise,
    pendingInfoPromise,
    unreadPromise as unknown as Promise<NotificationCount>,
    rollingVolumePromise,
    averagePromises[0],
    averagePromises[1],
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

  const rollingVolume =
    rollingVolumeResult.error || !rollingVolumeResult.data
      ? 0
      : Number(rollingVolumeResult.data.total ?? 0);
  const averageBuy =
    averageBuyResult.error || !averageBuyResult.data
      ? 0
      : Number(averageBuyResult.data.average ?? 0);
  const averageSell =
    averageSellResult.error || !averageSellResult.data
      ? 0
      : Number(averageSellResult.data.average ?? 0);

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
    row => {
      const normalizedType: RequestType = row.type === 'sell' ? 'sell' : 'buy';

      return {
        id: row.id,
        requestNumber: row.request_number,
        type: normalizedType,
        status: row.status,
        amount: Number(row.amount ?? 0),
        currency: row.currency ?? 'SAR',
        createdAt: row.created_at,
      };
    }
  );

  const pendingItems = ((pendingResult.data ?? []) as PendingRow[]).map(
    row => ({
      id: row.id,
      requestNumber: row.request_number,
      updatedAt: row.updated_at,
    })
  );

  const pendingInfoCount = statusCounts.pending_info ?? pendingItems.length;

  const lastRecent = recentRequests[0] ?? null;

  const averageAmountByType: Record<RequestType, number> = {
    buy: averageBuy,
    sell: averageSell,
  };

  const rolling30DayVolume = rollingVolume;

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
    insights: {
      averageAmountByType,
      rolling30DayVolume,
      lastRequest: lastRecent
        ? {
            id: lastRecent.id,
            requestNumber: lastRecent.requestNumber,
            type: lastRecent.type as RequestType,
            status: lastRecent.status,
            amount: lastRecent.amount,
            currency: lastRecent.currency,
            createdAt: lastRecent.createdAt,
          }
        : null,
    },
  };
}
