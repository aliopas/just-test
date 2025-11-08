import { requireSupabaseAdmin } from '../lib/supabase';
import type { AdminRequestListQuery } from '../schemas/admin-requests.schema';
import type { RequestStatus } from './request-state.service';

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
  type: 'buy' | 'sell';
  amount: number | string;
  currency: string;
  target_price: number | string | null;
  expiry_at: string | null;
  created_at: string;
  updated_at: string;
  users?: MaybeArray<{
    id: string;
    email: string | null;
    profile?: MaybeArray<{
      full_name: string | null;
      preferred_name: string | null;
      language: string | null;
    }>;
  }>;
};

export function escapeLikePattern(value: string): string {
  return value.replace(/[%_]/g, ch => `\\${ch}`);
}

export async function listAdminRequests(params: {
  actorId: string;
  query: AdminRequestListQuery;
}) {
  const adminClient = requireSupabaseAdmin();
  const page = params.query.page ?? 1;
  const limit = params.query.limit ?? 25;
  const offset = (page - 1) * limit;

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
        created_at,
        updated_at,
        users:users!requests_user_id_fkey (
          id,
          email,
          profile:investor_profiles (
            full_name,
            preferred_name,
            language
          )
        )
      `,
    { count: 'exact' }
  );

  if (params.query.status) {
    queryBuilder = queryBuilder.eq('status', params.query.status);
  }

  if (params.query.type) {
    queryBuilder = queryBuilder.eq('type', params.query.type);
  }

  if (params.query.minAmount !== undefined) {
    queryBuilder = queryBuilder.gte('amount', params.query.minAmount);
  }

  if (params.query.maxAmount !== undefined) {
    queryBuilder = queryBuilder.lte('amount', params.query.maxAmount);
  }

  if (params.query.createdFrom) {
    queryBuilder = queryBuilder.gte('created_at', params.query.createdFrom);
  }

  if (params.query.createdTo) {
    queryBuilder = queryBuilder.lte('created_at', params.query.createdTo);
  }

  if (params.query.search) {
    const pattern = `%${escapeLikePattern(params.query.search)}%`;
    queryBuilder = queryBuilder.or(
      `request_number.ilike.${pattern},users.profile.full_name.ilike.${pattern},users.profile.preferred_name.ilike.${pattern}`
    );
  }

  const sortField = params.query.sortBy ?? 'created_at';
  const order = (params.query.order ?? 'desc') === 'asc' ? true : false;

  const { data, count, error } = await queryBuilder
    .order(sortField, { ascending: order })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to list admin requests: ${error.message}`);
  }

  const rows = (data as AdminRequestRow[] | null) ?? [];

  const firstOrNull = <T>(value: MaybeArray<T>): T | null => {
    if (!value) {
      return null;
    }
    return Array.isArray(value) ? (value[0] ?? null) : value;
  };

  const requests = rows.map(row => {
    const user = firstOrNull(row.users);
    const profile = user ? firstOrNull(user.profile) : null;

    return {
      id: row.id,
      requestNumber: row.request_number,
      status: row.status,
      type: row.type,
      amount:
        typeof row.amount === 'string'
          ? Number.parseFloat(row.amount)
          : row.amount,
      currency: row.currency,
      targetPrice:
        typeof row.target_price === 'string'
          ? Number.parseFloat(row.target_price)
          : row.target_price,
      expiryAt: row.expiry_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      investor: {
        id: user?.id ?? null,
        email: user?.email ?? null,
        fullName: profile?.full_name ?? null,
        preferredName: profile?.preferred_name ?? null,
        language: profile?.language ?? null,
      },
    };
  });

  const total = count ?? 0;
  const pageCount = total === 0 ? 0 : Math.ceil(total / limit);

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
  type: 'buy' | 'sell';
  amount: number | string;
  currency: string;
  target_price: number | string | null;
  expiry_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  users?: MaybeArray<{
    id: string;
    email: string | null;
    profile?: MaybeArray<{
      full_name: string | null;
      preferred_name: string | null;
      language: string | null;
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
};

type AdminEventRow = {
  id: string;
  from_status: string | null;
  to_status: string | null;
  actor_id: string | null;
  note: string | null;
  created_at: string;
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
        created_at,
        updated_at,
        users:users!requests_user_id_fkey (
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
    .eq('id', params.requestId)
    .single<AdminRequestDetailRow>();

  if (requestError || !requestRow) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  const [attachmentsResult, eventsResult] = await Promise.all([
    adminClient
      .from('attachments')
      .select(
        `
          id,
          filename,
          mime_type,
          size,
          storage_key,
          created_at
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
  ]);

  if (attachmentsResult.error) {
    throw new Error(
      `FAILED_ATTACHMENTS:${attachmentsResult.error.message ?? 'unknown'}`
    );
  }

  if (eventsResult.error) {
    throw new Error(`FAILED_EVENTS:${eventsResult.error.message ?? 'unknown'}`);
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

  return {
    request: {
      id: requestRow.id,
      requestNumber: requestRow.request_number,
      userId: requestRow.user_id,
      status: requestRow.status,
      type: requestRow.type,
      amount: normalizeNumber(requestRow.amount) ?? 0,
      currency: requestRow.currency,
      targetPrice: normalizeNumber(requestRow.target_price),
      expiryAt: requestRow.expiry_at,
      notes: requestRow.notes,
      createdAt: requestRow.created_at,
      updatedAt: requestRow.updated_at,
      investor: {
        id: user?.id ?? null,
        email: user?.email ?? null,
        fullName: profile?.full_name ?? null,
        preferredName: profile?.preferred_name ?? null,
        language: profile?.language ?? null,
      },
    },
    attachments,
    events,
    comments: events
      .filter(event => event.note && event.note.trim().length > 0)
      .map(event => ({
        id: event.id,
        note: event.note!,
        createdAt: event.createdAt,
      })),
  };
}
