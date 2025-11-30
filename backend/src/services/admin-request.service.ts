import { requireSupabaseAdmin } from '../lib/supabase';
import type { AdminRequestListQuery } from '../schemas/admin-requests.schema';
import type { RequestStatus } from './request-state.service';
import { transitionRequestStatus } from './request-state.service';
import {
  notifyInvestorOfDecision,
  notifyInvestorOfInfoRequest,
  notifyInvestorOfSettlement,
} from './notification.service';

type MaybeArray<T> = T | T[] | null | undefined;

function firstOrNull<T>(value: MaybeArray<T>): T | null {
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

type AdminRequestRow = {
  id: string;
  request_number: string;
  status: string;
  type: 'buy' | 'sell' | 'partnership' | 'board_nomination' | 'feedback';
  amount: number | string | null;
  currency: string | null;
  target_price: number | string | null;
  expiry_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  users?: MaybeArray<{
    id: string;
    email: string | null;
    phone: string | null;
    phone_cc: string | null;
    status: string | null;
    created_at: string | null;
  }>;
};

export function escapeLikePattern(value: string): string {
  return value.replace(/[%_]/g, ch => `\\${ch}`);
}

/**
 * Mark a request as read by an admin user
 * If the request is in 'draft' status and hasn't been read by any admin before,
 * automatically transition it to 'screening' status
 */
export async function markRequestAsRead(params: {
  requestId: string;
  adminId: string;
}): Promise<{ viewedAt: string }> {
  const adminClient = requireSupabaseAdmin();

  // Check if this is the first time any admin reads this request
  const { data: existingViews, error: checkError } = await adminClient
    .from('admin_request_views')
    .select('id')
    .eq('request_id', params.requestId)
    .limit(1);

  if (checkError) {
    throw new Error(`Failed to check existing views: ${checkError.message}`);
  }

  const isFirstRead = existingViews === null || existingViews.length === 0;

  // Get current request status
  const { data: requestData, error: requestError } = await adminClient
    .from('requests')
    .select('status')
    .eq('id', params.requestId)
    .single<{ status: string }>();

  if (requestError) {
    throw new Error(`Failed to fetch request: ${requestError.message}`);
  }

  // If this is the first read and request is in 'draft' status, transition to 'screening'
  if (isFirstRead && requestData.status === 'draft') {
    try {
      await transitionRequestStatus({
        requestId: params.requestId,
        actorId: params.adminId,
        toStatus: 'screening',
        note: 'Request opened by admin - moved to screening',
      });
    } catch (transitionError) {
      // Log error but don't fail the read operation
      console.error('Failed to transition request status:', transitionError);
    }
  }

  // Use upsert to handle both new views and updates
  const { data, error } = await adminClient
    .from('admin_request_views')
    .upsert(
      {
        request_id: params.requestId,
        admin_id: params.adminId,
        viewed_at: new Date().toISOString(),
      },
      {
        onConflict: 'request_id,admin_id',
      }
    )
    .select('viewed_at')
    .single();

  if (error) {
    throw new Error(`Failed to mark request as read: ${error.message}`);
  }

  return {
    viewedAt: data.viewed_at as string,
  };
}

/**
 * Check if a request has been read by an admin
 */
export async function isRequestReadByAdmin(params: {
  requestId: string;
  adminId: string;
}): Promise<boolean> {
  const adminClient = requireSupabaseAdmin();

  const { data, error } = await adminClient
    .from('admin_request_views')
    .select('id')
    .eq('request_id', params.requestId)
    .eq('admin_id', params.adminId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to check request read status: ${error.message}`);
  }

  return data !== null;
}

export async function listAdminRequests(params: {
  actorId: string;
  query: AdminRequestListQuery;
}) {
  let adminClient;
  try {
    adminClient = requireSupabaseAdmin();
  } catch (initError) {
    console.error('Failed to initialize Supabase admin client:', {
      error: initError instanceof Error ? initError.message : String(initError),
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    throw new Error(
      `Failed to initialize database connection: ${
        initError instanceof Error ? initError.message : 'Unknown error'
      }`
    );
  }

  const page = params.query.page ?? 1;
  const limit = params.query.limit ?? 25;
  const offset = (page - 1) * limit;

  // Validate page and limit
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }

  // Determine sort field and order first
  const sortField = params.query.sortBy ?? 'created_at';
  const order = (params.query.order ?? 'desc') === 'asc' ? true : false;

  // Validate sortField is one of the allowed fields (must be on the main requests table)
  const allowedSortFields = ['created_at', 'amount', 'status'] as const;
  const validSortField = allowedSortFields.includes(
    sortField as (typeof allowedSortFields)[number]
  )
    ? sortField
    : 'created_at';

  // Get requests without relations first to avoid Supabase query issues
  let queryBuilder = adminClient.from('requests').select(
      `
        id,
        request_number,
        status,
        type,
        amount,
        currency,
        target_price,
        expiry_at,
        metadata,
        created_at,
        updated_at,
        user_id
      `,
      { count: 'exact' }
    );

  // Apply filters first
  if (params.query.status) {
    queryBuilder = queryBuilder.eq('status', params.query.status);
  }

  // Filter by type(s) - support multiple types
  if (params.query.type) {
    const types = Array.isArray(params.query.type)
      ? params.query.type
      : [params.query.type];
    if (types.length === 1) {
      queryBuilder = queryBuilder.eq('type', types[0]);
    } else if (types.length > 1) {
      queryBuilder = queryBuilder.in('type', types);
    }
  }

  // Filter by amount - handle NULL values properly
  // For requests without amount (non-financial), they should still be included
  // Note: Supabase .gte() and .lte() exclude NULL values by default
  // We'll apply amount filters in post-processing to properly handle NULL values
  // This ensures requests without amount are always included
  // Store amount filters for post-processing
  const amountFilters = {
    minAmount: params.query.minAmount,
    maxAmount: params.query.maxAmount,
  };

  if (params.query.createdFrom) {
    queryBuilder = queryBuilder.gte('created_at', params.query.createdFrom);
  }

  if (params.query.createdTo) {
    queryBuilder = queryBuilder.lte('created_at', params.query.createdTo);
  }

  // Apply search filter if provided
  // Note: Supabase .or() with nested relations doesn't work reliably
  // For now, we only search on request_number. Profile name search can be added later
  // using a different approach (e.g., separate query or full-text search)
  if (params.query.search) {
    const pattern = `%${escapeLikePattern(params.query.search)}%`;
    queryBuilder = queryBuilder.ilike('request_number', pattern);
  }

  // Apply ordering and pagination last (matching pattern from other services)
  // For amount sorting, we need to handle NULL values properly to ensure non-financial requests are included
  // Use post-processing for amount sorting to handle NULL values correctly
  const shouldUsePostProcessingSort = validSortField === 'amount';
  
  let result;
  try {
    if (shouldUsePostProcessingSort) {
      // For amount sorting, first get all requests without ordering by amount
      // We'll sort by created_at as secondary sort, then post-process
      result = await queryBuilder
        .order('created_at', { ascending: false })
        .range(0, 10000); // Get a larger set to sort properly
    } else {
      result = await queryBuilder
        .order(validSortField, { ascending: order })
        .range(offset, offset + limit - 1);
    }
  } catch (queryError) {
    console.error('Failed to execute admin requests query - Exception:', {
      queryError,
      errorMessage:
        queryError instanceof Error ? queryError.message : String(queryError),
      errorStack: queryError instanceof Error ? queryError.stack : undefined,
      sortField: validSortField,
      order,
      offset,
      limit,
      query: params.query,
    });
    throw new Error(
      `Failed to execute query: ${
        queryError instanceof Error ? queryError.message : 'Unknown error'
      }`
    );
  }

  const { data, count, error } = result;

  if (error) {
    console.error('Failed to list admin requests - Supabase error:', {
      error: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      sortField: validSortField,
      order,
      query: params.query,
    });
    throw new Error(`Failed to list admin requests: ${error.message}`);
  }

  let rows = (data as AdminRequestRow[] | null) ?? [];

  // Apply post-processing sort for amount field to handle NULL values properly
  if (shouldUsePostProcessingSort) {
    rows.sort((a, b) => {
      const aAmount = a.amount == null ? null : (typeof a.amount === 'string' ? Number.parseFloat(a.amount) : a.amount);
      const bAmount = b.amount == null ? null : (typeof b.amount === 'string' ? Number.parseFloat(b.amount) : b.amount);
      
      // NULL values (non-financial requests) always go last
      if (aAmount == null && bAmount == null) {
        // Both NULL, sort by created_at descending
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      // For descending (order = false), NULL values go to the end (positive value)
      // For ascending (order = true), NULL values go to the end (positive value)
      if (aAmount == null) return 1; // NULL always goes last
      if (bAmount == null) return -1; // NULL always goes last
      
      // Both have values, compare normally
      const diff = (aAmount as number) - (bAmount as number);
      return order ? diff : -diff;
    });
    
    // Apply pagination after sorting
    rows = rows.slice(offset, offset + limit);
  }

  // Apply amount filters in post-processing to properly handle NULL values
  // This ensures requests without amount (non-financial) are always included
  if (amountFilters.minAmount !== undefined || amountFilters.maxAmount !== undefined) {
    const originalCount = rows.length;
    rows = rows.filter(row => {
      // Always include NULL amounts (non-financial requests)
      if (row.amount == null) {
        return true;
      }
      
      const amountValue = typeof row.amount === 'string' 
        ? Number.parseFloat(row.amount) 
        : row.amount;
      
      if (typeof amountValue !== 'number' || !Number.isFinite(amountValue)) {
        return true; // Include invalid amounts to be safe
      }
      
      // Check minAmount
      if (amountFilters.minAmount !== undefined) {
        if (amountValue < amountFilters.minAmount) {
          return false;
        }
      }
      
      // Check maxAmount
      if (amountFilters.maxAmount !== undefined) {
        if (amountValue > amountFilters.maxAmount) {
          return false;
        }
      }
      
      return true;
    });
    
    console.log('Amount filter applied:', {
      originalCount,
      filteredCount: rows.length,
      amountFilters,
    });
  }

  // Log for debugging
  console.log('Admin requests query result:', {
    rowsCount: rows.length,
    totalCount: count,
    query: params.query,
    types: rows.map(r => r.type),
    statuses: rows.map(r => r.status),
    requestNumbers: rows.map(r => r.request_number),
  });

  // If no rows, return empty result early
  if (rows.length === 0) {
    console.log('No requests found with filters:', params.query);
    return {
      requests: [],
      meta: {
        page: params.query.page ?? 1,
        limit: params.query.limit ?? 25,
        total: count ?? 0,
        pageCount: 0,
        hasNext: false,
      },
    };
  }

  // Get read status for all requests by this admin
  const requestIds = rows.map(row => row.id);
  let readStatusMap: Record<string, boolean> = {};

  if (requestIds.length > 0) {
    const { data: readViews, error: readError } = await adminClient
      .from('admin_request_views')
      .select('request_id')
      .eq('admin_id', params.actorId)
      .in('request_id', requestIds);

    if (!readError && readViews) {
      readStatusMap = readViews.reduce(
        (acc, view) => {
          acc[view.request_id as string] = true;
          return acc;
        },
        {} as Record<string, boolean>
      );
    }
  }

  // Get all user IDs from requests
  const userIds = rows
    .map(row => row.user_id)
    .filter((id): id is string => id !== null && id !== undefined && id !== '');

  // Get users data in one query
  const usersMap: Record<
    string,
    {
      id: string;
      email: string | null;
      phone: string | null;
      phone_cc: string | null;
      status: string | null;
      created_at: string | null;
    }
  > = {};

  if (userIds.length > 0) {
    const { data: users, error: usersError } = await adminClient
      .from('users')
      .select('id, email, phone, phone_cc, status, created_at')
      .in('id', userIds);

    if (!usersError && users) {
      users.forEach(user => {
        usersMap[user.id] = {
          id: user.id,
          email: user.email ?? null,
          phone: user.phone ?? null,
          phone_cc: user.phone_cc ?? null,
          status: user.status ?? null,
          created_at: user.created_at ?? null,
        };
      });
    } else if (usersError) {
      console.error('Failed to fetch users:', usersError);
    }
  }

  const profilesMap: Record<
    string,
    {
      full_name: string | null;
      preferred_name: string | null;
      language: string | null;
      id_type: string | null;
      id_number: string | null;
      id_expiry: string | null;
      nationality: string | null;
      residency_country: string | null;
      city: string | null;
      kyc_status: string | null;
      kyc_updated_at: string | null;
      risk_profile: string | null;
      communication_preferences: Record<string, boolean> | null;
      kyc_documents: unknown;
      created_at: string | null;
      updated_at: string | null;
    }
  > = {};

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await adminClient
      .from('investor_profiles')
      .select('*')
      .in('user_id', userIds);

    if (profilesError) {
      console.error('Failed to fetch investor profiles:', {
        error: profilesError.message,
        code: profilesError.code,
        details: profilesError.details,
        hint: profilesError.hint,
        userIds: userIds.length,
      });
      // Don't throw - continue without profiles data
    } else if (profiles) {
      profiles.forEach(profile => {
        profilesMap[profile.user_id as string] = {
          full_name: profile.full_name ?? null,
          preferred_name: profile.preferred_name ?? null,
          language: profile.language ?? null,
          id_type: profile.id_type ?? null,
          id_number: profile.id_number ?? null,
          id_expiry: profile.id_expiry ?? null,
          nationality: profile.nationality ?? null,
          residency_country: profile.residency_country ?? null,
          city: profile.city ?? null,
          kyc_status: profile.kyc_status ?? null,
          kyc_updated_at: profile.kyc_updated_at ?? null,
          risk_profile: profile.risk_profile ?? null,
          communication_preferences:
            profile.communication_preferences as Record<string, boolean> | null,
          kyc_documents: profile.kyc_documents ?? null,
          created_at: profile.created_at ?? null,
          updated_at: profile.updated_at ?? null,
        };
      });
    }
  }

  const requests = rows.map(row => {
    const userId = row.user_id;
    const user = userId ? (usersMap[userId] ?? null) : null;
    const profile = userId ? (profilesMap[userId] ?? null) : null;

    return {
      id: row.id,
      requestNumber: row.request_number,
      status: row.status,
      type: row.type,
      amount:
        row.amount == null
          ? null
          : typeof row.amount === 'string'
            ? Number.parseFloat(row.amount)
            : row.amount,
      currency: row.currency ?? null,
      targetPrice:
        typeof row.target_price === 'string'
          ? Number.parseFloat(row.target_price)
          : row.target_price,
      expiryAt: row.expiry_at,
      metadata: row.metadata ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isRead: readStatusMap[row.id] ?? false,
      investor: {
        id: userId ?? null,
        email: user?.email ?? null,
        phone: user?.phone ?? null,
        phoneCc: user?.phone_cc ?? null,
        fullName: profile?.full_name ?? null,
        preferredName: profile?.preferred_name ?? null,
        language: profile?.language ?? null,
        idType: profile?.id_type ?? null,
        idNumber: profile?.id_number ?? null,
        idExpiry: profile?.id_expiry ?? null,
        nationality: profile?.nationality ?? null,
        residencyCountry: profile?.residency_country ?? null,
        city: profile?.city ?? null,
        kycStatus: profile?.kyc_status ?? null,
        kycUpdatedAt: profile?.kyc_updated_at ?? null,
        riskProfile: profile?.risk_profile ?? null,
        communicationPreferences: profile?.communication_preferences ?? null,
        kycDocuments: profile?.kyc_documents ?? null,
        profileCreatedAt: profile?.created_at ?? null,
        profileUpdatedAt: profile?.updated_at ?? null,
        userStatus: user?.status ?? null,
        userCreatedAt: user?.created_at ?? null,
      },
    };
  });

  const total = count ?? 0;
  const pageCount = total === 0 ? 0 : Math.ceil(total / limit);

  console.log('Returning admin requests:', {
    requestsCount: requests.length,
    total,
    pageCount,
    page,
    limit,
  });

  return {
    requests,
    meta: {
      page,
      limit,
      total,
      pageCount,
      hasNext: page < pageCount,
    },
  };
}

type AdminRequestDetailRow = {
  id: string;
  request_number: string;
  user_id: string;
  status: RequestStatus;
  type: 'buy' | 'sell' | 'partnership' | 'board_nomination' | 'feedback';
  amount: number | string | null;
  currency: string | null;
  target_price: number | string | null;
  expiry_at: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  settlement_started_at: string | null;
  settlement_completed_at: string | null;
  settlement_reference: string | null;
  settlement_notes: string | null;
  created_at: string;
  updated_at: string;
  users?: MaybeArray<{
    id: string;
    email: string | null;
    phone: string | null;
    phone_cc: string | null;
    status: string | null;
    created_at: string | null;
    profile?: MaybeArray<{
      full_name: string | null;
      preferred_name: string | null;
      language: string | null;
      id_type: string | null;
      id_number: string | null;
      id_expiry: string | null;
      nationality: string | null;
      residency_country: string | null;
      city: string | null;
      kyc_status: string | null;
      kyc_updated_at: string | null;
      risk_profile: string | null;
      communication_preferences: Record<string, boolean> | null;
      kyc_documents: unknown;
      created_at: string | null;
      updated_at: string | null;
    }>;
  }>;
};

type AdminAttachmentRow = {
  id: string;
  filename: string;
  mime_type: string | null;
  size: number | string | null;
  storage_key: string;
  created_at: string;
  category: string | null;
  metadata: Record<string, unknown> | null;
};

type AdminEventRow = {
  id: string;
  from_status: string | null;
  to_status: string | null;
  actor_id: string | null;
  note: string | null;
  created_at: string;
};

type AdminCommentRow = {
  id: string;
  comment: string;
  actor_id: string;
  created_at: string;
  actor?: MaybeArray<{
    id: string;
    email: string | null;
    profile?: MaybeArray<{
      full_name: string | null;
      preferred_name: string | null;
      language: string | null;
    }>;
  }>;
};

function normalizeNumber(value: string | number | null | undefined) {
  if (value == null) {
    return null;
  }
  if (typeof value === 'number') {
    return value;
  }
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function getAdminRequestDetail(params: {
  actorId: string;
  requestId: string;
}) {
  const adminClient = requireSupabaseAdmin();

  // Mark request as read by this admin
  try {
    await markRequestAsRead({
      requestId: params.requestId,
      adminId: params.actorId,
    });
  } catch (error) {
    // Log error but don't fail the request
    console.error('Failed to mark request as read:', error);
  }

  const { data: requestRow, error: requestError } = await adminClient
    .from('requests')
    .select(
      `
        id,
        request_number,
        user_id,
        status,
        type,
        amount,
        currency,
        target_price,
        expiry_at,
        notes,
        metadata,
        settlement_started_at,
        settlement_completed_at,
        settlement_reference,
        settlement_notes,
        created_at,
        updated_at,
        users:users!requests_user_id_fkey (
          id,
          email,
          phone,
          phone_cc,
          profile:investor_profiles!investor_profiles_user_id_fkey (
            full_name,
            preferred_name,
            language,
            id_type,
            id_number,
            id_expiry,
            nationality,
            residency_country,
            city,
            kyc_status,
            kyc_updated_at,
            risk_profile,
            communication_preferences,
            kyc_documents,
            created_at,
            updated_at
          )
        )
      `
    )
    .eq('id', params.requestId)
    .single<AdminRequestDetailRow>();

  if (requestError || !requestRow) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  const [attachmentsResult, eventsResult, commentsResult] = await Promise.all([
    adminClient
      .from('attachments')
      .select(
        `
          id,
          filename,
          mime_type,
          size,
          storage_key,
          created_at,
          category,
          metadata
        `
      )
      .eq('request_id', params.requestId)
      .order('created_at', { ascending: true }),
    adminClient
      .from('request_events')
      .select(
        `
          id,
          from_status,
          to_status,
          actor_id,
          note,
          created_at
        `
      )
      .eq('request_id', params.requestId)
      .order('created_at', { ascending: true }),
    adminClient
      .from('request_comments')
      .select(
        `
          id,
          comment,
          actor_id,
          created_at,
          actor:users!request_comments_actor_id_fkey (
            id,
            email,
            profile:investor_profiles!investor_profiles_user_id_fkey (
              full_name,
              preferred_name,
              language
            )
          )
        `
      )
      .eq('request_id', params.requestId)
      .order('created_at', { ascending: true }),
  ]);

  if (attachmentsResult.error) {
    throw new Error(
      `FAILED_ATTACHMENTS:${attachmentsResult.error.message ?? 'unknown'}`
    );
  }

  if (eventsResult.error) {
    throw new Error(`FAILED_EVENTS:${eventsResult.error.message ?? 'unknown'}`);
  }

  if (commentsResult?.error) {
    throw new Error(
      `FAILED_COMMENTS:${commentsResult.error.message ?? 'unknown'}`
    );
  }

  const user = firstOrNull(requestRow.users ?? null);
  const profile = user ? firstOrNull(user.profile ?? null) : null;

  const attachments =
    (attachmentsResult.data as AdminAttachmentRow[] | null)?.map(
      attachment => ({
        id: attachment.id,
        filename: attachment.filename,
        mimeType: attachment.mime_type,
        size: normalizeNumber(attachment.size),
        storageKey: attachment.storage_key,
        createdAt: attachment.created_at,
        category: attachment.category ?? 'general',
        metadata: attachment.metadata ?? {},
      })
    ) ?? [];

  const events =
    (eventsResult.data as AdminEventRow[] | null)?.map(event => ({
      id: event.id,
      fromStatus: event.from_status,
      toStatus: event.to_status,
      actorId: event.actor_id,
      note: event.note,
      createdAt: event.created_at,
    })) ?? [];

  const comments =
    (commentsResult?.data as AdminCommentRow[] | null)?.map(comment => {
      const actorRow = firstOrNull(comment.actor ?? null);
      const actorProfile = actorRow
        ? firstOrNull(actorRow.profile ?? null)
        : null;
      return {
        id: comment.id,
        note: comment.comment,
        createdAt: comment.created_at,
        actor: {
          id: actorRow?.id ?? null,
          email: actorRow?.email ?? null,
          fullName: actorProfile?.full_name ?? null,
          preferredName: actorProfile?.preferred_name ?? null,
          language: actorProfile?.language ?? null,
        },
      };
    }) ?? [];

  // Generate presigned download URLs for attachments
  const attachmentsWithUrls = await Promise.all(
    attachments.map(async attachment => {
      try {
        // Parse storage_key to get bucket and path
        // Format: bucket_name/path/to/file
        const parts = attachment.storageKey.split('/');
        if (parts.length < 2) {
          return { ...attachment, downloadUrl: null };
        }

        const bucket = parts[0];
        const path = parts.slice(1).join('/');

        const { data: urlData, error: urlError } = await adminClient.storage
          .from(bucket)
          .createSignedUrl(path, 3600); // 1 hour expiry

        if (urlError || !urlData?.signedUrl) {
          console.error('Failed to create signed URL:', urlError);
          return { ...attachment, downloadUrl: null };
        }

        return { ...attachment, downloadUrl: urlData.signedUrl };
      } catch (error) {
        console.error('Error generating download URL:', error);
        return { ...attachment, downloadUrl: null };
      }
    })
  );

  return {
    request: {
      id: requestRow.id,
      requestNumber: requestRow.request_number,
      userId: requestRow.user_id,
      status: requestRow.status,
      type: requestRow.type,
      amount: normalizeNumber(requestRow.amount),
      currency: requestRow.currency ?? null,
      targetPrice: normalizeNumber(requestRow.target_price),
      expiryAt: requestRow.expiry_at,
      notes: requestRow.notes,
      metadata: requestRow.metadata ?? null,
      settlement: {
        startedAt: requestRow.settlement_started_at,
        completedAt: requestRow.settlement_completed_at,
        reference: requestRow.settlement_reference,
        notes: requestRow.settlement_notes,
      },
      createdAt: requestRow.created_at,
      updatedAt: requestRow.updated_at,
      investor: {
        id: user?.id ?? null,
        email: user?.email ?? null,
        phone: user?.phone ?? null,
        phoneCc: user?.phone_cc ?? null,
        fullName: profile?.full_name ?? null,
        preferredName: profile?.preferred_name ?? null,
        language: profile?.language ?? null,
        idType: profile?.id_type ?? null,
        idNumber: profile?.id_number ?? null,
        idExpiry: profile?.id_expiry ?? null,
        nationality: profile?.nationality ?? null,
        residencyCountry: profile?.residency_country ?? null,
        city: profile?.city ?? null,
        kycStatus: profile?.kyc_status ?? null,
        kycUpdatedAt: profile?.kyc_updated_at ?? null,
        riskProfile: profile?.risk_profile ?? null,
        communicationPreferences: profile?.communication_preferences ?? null,
        kycDocuments: profile?.kyc_documents ?? null,
        profileCreatedAt: profile?.created_at ?? null,
        profileUpdatedAt: profile?.updated_at ?? null,
        userStatus: user?.status ?? null,
        userCreatedAt: user?.created_at ?? null,
      },
    },
    attachments: attachmentsWithUrls,
    events,
    comments,
  };
}

async function logRequestAudit(params: {
  actorId: string;
  action: string;
  requestId: string;
  diff: Record<string, { before: unknown; after: unknown }>;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const adminClient = requireSupabaseAdmin();
  const { error } = await adminClient.from('audit_logs').insert({
    actor_id: params.actorId,
    action: params.action,
    target_type: 'request',
    target_id: params.requestId,
    diff: params.diff,
    ip_address: params.ipAddress ?? null,
    user_agent: params.userAgent ?? null,
  });

  if (error) {
    console.error('Failed to write audit log for request decision:', error);
  }
}

type DecisionParams = {
  actorId: string;
  requestId: string;
  note?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type WorkflowStatus = 'screening' | 'compliance_review';

export async function moveAdminRequestToStatus(
  params: DecisionParams & {
    status: WorkflowStatus;
  }
) {
  const trimmedNote = params.note?.trim() || null;

  const transition = await transitionRequestStatus({
    requestId: params.requestId,
    actorId: params.actorId,
    toStatus: params.status,
    note: trimmedNote,
  });

  const diff: Record<string, { before: unknown; after: unknown }> = {
    status: {
      before: transition.event.from_status,
      after: transition.event.to_status,
    },
  };

  if (trimmedNote) {
    diff.note = {
      before: null,
      after: trimmedNote,
    };
  }

  await logRequestAudit({
    actorId: params.actorId,
    action: `request.status.${params.status}`,
    requestId: params.requestId,
    diff,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  return transition;
}

export async function approveAdminRequest(params: DecisionParams) {
  const transition = await transitionRequestStatus({
    requestId: params.requestId,
    actorId: params.actorId,
    toStatus: 'approved',
    note: params.note ?? null,
  });

  await logRequestAudit({
    actorId: params.actorId,
    action: 'request.approved',
    requestId: params.requestId,
    diff: {
      status: {
        before: transition.event.from_status,
        after: transition.event.to_status,
      },
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  await notifyInvestorOfDecision({
    userId: transition.request.user_id,
    requestId: params.requestId,
    requestNumber: transition.request.request_number,
    decision: 'approved',
    note: params.note ?? null,
    actorId: params.actorId,
  });

  return transition;
}

export async function rejectAdminRequest(params: DecisionParams) {
  const transition = await transitionRequestStatus({
    requestId: params.requestId,
    actorId: params.actorId,
    toStatus: 'rejected',
    note: params.note ?? null,
  });

  await logRequestAudit({
    actorId: params.actorId,
    action: 'request.rejected',
    requestId: params.requestId,
    diff: {
      status: {
        before: transition.event.from_status,
        after: transition.event.to_status,
      },
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  await notifyInvestorOfDecision({
    userId: transition.request.user_id,
    requestId: params.requestId,
    requestNumber: transition.request.request_number,
    decision: 'rejected',
    note: params.note ?? null,
    actorId: params.actorId,
  });

  return transition;
}

type InfoRequestParams = DecisionParams & {
  message: string;
};

export async function requestInfoFromInvestor(params: InfoRequestParams) {
  if (!params.message || params.message.trim().length === 0) {
    throw new Error('INFO_MESSAGE_REQUIRED');
  }

  const trimmedMessage = params.message.trim().slice(0, 1000);

  const transition = await transitionRequestStatus({
    requestId: params.requestId,
    actorId: params.actorId,
    toStatus: 'pending_info',
    note: trimmedMessage,
  });

  await logRequestAudit({
    actorId: params.actorId,
    action: 'request.info_requested',
    requestId: params.requestId,
    diff: {
      status: {
        before: transition.event.from_status,
        after: transition.event.to_status,
      },
      message: {
        before: null,
        after: trimmedMessage,
      },
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  await notifyInvestorOfInfoRequest({
    userId: transition.request.user_id,
    requestId: params.requestId,
    requestNumber: transition.request.request_number,
    message: trimmedMessage,
    previousStatus: transition.event.from_status,
    actorId: params.actorId,
  });

  return transition;
}

export async function listAdminRequestComments(params: {
  actorId: string;
  requestId: string;
}) {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('request_comments')
    .select(
      `
        id,
        comment,
        actor_id,
        created_at,
        actor:users!request_comments_actor_id_fkey (
          id,
          email,
          profile:investor_profiles (
            full_name,
            preferred_name,
            language
          )
        )
      `
    )
    .eq('request_id', params.requestId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to list request comments: ${error.message}`);
  }

  const rows = (data as AdminCommentRow[] | null) ?? [];
  return rows.map(row => {
    const actorRow = firstOrNull(row.actor ?? null);
    const actorProfile = actorRow
      ? firstOrNull(actorRow.profile ?? null)
      : null;
    return {
      id: row.id,
      note: row.comment,
      actor: {
        id: actorRow?.id ?? null,
        email: actorRow?.email ?? null,
        fullName: actorProfile?.full_name ?? null,
        preferredName: actorProfile?.preferred_name ?? null,
        language: actorProfile?.language ?? null,
      },
      createdAt: row.created_at,
    };
  });
}

export async function addAdminRequestComment(params: {
  actorId: string;
  requestId: string;
  comment: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const trimmed = params.comment.trim();
  if (!trimmed) {
    throw new Error('COMMENT_REQUIRED');
  }

  const adminClient = requireSupabaseAdmin();
  const finalComment = trimmed.slice(0, 2000);

  const { data, error } = await adminClient
    .from('request_comments')
    .insert({
      request_id: params.requestId,
      actor_id: params.actorId,
      comment: finalComment,
    })
    .select(
      `
        id,
        comment,
        actor_id,
        created_at,
        actor:users!request_comments_actor_id_fkey (
          id,
          email,
          profile:investor_profiles (
            full_name,
            preferred_name,
            language
          )
        )
      `
    )
    .single<AdminCommentRow>();

  if (error || !data) {
    throw new Error(
      `Failed to add request comment: ${error?.message ?? 'unknown'}`
    );
  }

  await logRequestAudit({
    actorId: params.actorId,
    action: 'request.comment_added',
    requestId: params.requestId,
    diff: {
      comment: {
        before: null,
        after: finalComment,
      },
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  const actorRow = firstOrNull(data.actor ?? null);
  const actorProfile = actorRow ? firstOrNull(actorRow.profile ?? null) : null;

  return {
    id: data.id,
    note: data.comment,
    actor: {
      id: actorRow?.id ?? null,
      email: actorRow?.email ?? null,
      fullName: actorProfile?.full_name ?? null,
      preferredName: actorProfile?.preferred_name ?? null,
      language: actorProfile?.language ?? null,
    },
    createdAt: data.created_at,
  };
}

type SettlementBaseParams = {
  actorId: string;
  requestId: string;
  reference?: string | null;
  note?: string | null;
  attachmentIds?: string[];
  ipAddress?: string | null;
  userAgent?: string | null;
};

async function updateSettlementAttachments(params: {
  requestId: string;
  attachmentIds?: string[];
  stage: 'started' | 'completed';
}) {
  if (!params.attachmentIds || params.attachmentIds.length === 0) {
    return;
  }

  const adminClient = requireSupabaseAdmin();
  await adminClient
    .from('attachments')
    .update({
      category: 'settlement',
      metadata: {
        stage: params.stage,
        updated_at: new Date().toISOString(),
      },
    })
    .eq('request_id', params.requestId)
    .in('id', params.attachmentIds);
}

export async function startRequestSettlement(params: SettlementBaseParams) {
  const trimmedReference = params.reference?.trim() || null;
  const trimmedNote = params.note?.trim() || null;

  const transition = await transitionRequestStatus({
    requestId: params.requestId,
    actorId: params.actorId,
    toStatus: 'settling',
    note: trimmedNote,
  });

  const adminClient = requireSupabaseAdmin();
  const updatePayload: Record<string, unknown> = {
    settlement_started_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (trimmedReference) {
    updatePayload.settlement_reference = trimmedReference;
  }

  if (trimmedNote) {
    updatePayload.settlement_notes = trimmedNote;
  }

  const { error: updateError } = await adminClient
    .from('requests')
    .update(updatePayload)
    .eq('id', params.requestId);

  if (updateError) {
    throw new Error(`Failed to update settlement info: ${updateError.message}`);
  }

  await updateSettlementAttachments({
    requestId: params.requestId,
    attachmentIds: params.attachmentIds,
    stage: 'started',
  });

  const diff: Record<string, { before: unknown; after: unknown }> = {
    status: {
      before: transition.event.from_status,
      after: transition.event.to_status,
    },
    settlement_started_at: {
      before: null,
      after: updatePayload.settlement_started_at,
    },
  };

  if (trimmedReference) {
    diff.settlement_reference = {
      before: null,
      after: trimmedReference,
    };
  }

  if (trimmedNote) {
    diff.settlement_notes = {
      before: null,
      after: trimmedNote,
    };
  }

  await logRequestAudit({
    actorId: params.actorId,
    action: 'request.settlement_started',
    requestId: params.requestId,
    diff,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  await notifyInvestorOfSettlement({
    userId: transition.request.user_id,
    requestId: params.requestId,
    requestNumber: transition.request.request_number,
    stage: 'started',
    reference: trimmedReference,
    actorId: params.actorId,
  });

  return transition;
}

export async function completeRequestSettlement(params: SettlementBaseParams) {
  const trimmedReference = params.reference?.trim() || null;
  const trimmedNote = params.note?.trim() || null;

  const transition = await transitionRequestStatus({
    requestId: params.requestId,
    actorId: params.actorId,
    toStatus: 'completed',
    note: trimmedNote,
  });

  const adminClient = requireSupabaseAdmin();
  const updatePayload: Record<string, unknown> = {
    settlement_completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (trimmedReference) {
    updatePayload.settlement_reference = trimmedReference;
  }

  if (trimmedNote) {
    updatePayload.settlement_notes = trimmedNote;
  }

  const { error: updateError } = await adminClient
    .from('requests')
    .update(updatePayload)
    .eq('id', params.requestId);

  if (updateError) {
    throw new Error(
      `Failed to update settlement completion: ${updateError.message}`
    );
  }

  await updateSettlementAttachments({
    requestId: params.requestId,
    attachmentIds: params.attachmentIds,
    stage: 'completed',
  });

  const diff: Record<string, { before: unknown; after: unknown }> = {
    status: {
      before: transition.event.from_status,
      after: transition.event.to_status,
    },
    settlement_completed_at: {
      before: null,
      after: updatePayload.settlement_completed_at,
    },
  };

  if (trimmedReference) {
    diff.settlement_reference = {
      before: null,
      after: trimmedReference,
    };
  }

  if (trimmedNote) {
    diff.settlement_notes = {
      before: null,
      after: trimmedNote,
    };
  }

  await logRequestAudit({
    actorId: params.actorId,
    action: 'request.settlement_completed',
    requestId: params.requestId,
    diff,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  await notifyInvestorOfSettlement({
    userId: transition.request.user_id,
    requestId: params.requestId,
    requestNumber: transition.request.request_number,
    stage: 'completed',
    reference: trimmedReference,
    actorId: params.actorId,
  });

  return transition;
}
