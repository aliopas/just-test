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
  settlement_started_at: string | null;
  settlement_completed_at: string | null;
  settlement_reference: string | null;
  settlement_notes: string | null;
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
        settlement_started_at,
        settlement_completed_at,
        settlement_reference,
        settlement_notes,
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
            profile:investor_profiles (
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
        fullName: profile?.full_name ?? null,
        preferredName: profile?.preferred_name ?? null,
        language: profile?.language ?? null,
      },
    },
    attachments,
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

export async function moveAdminRequestToStatus(params: DecisionParams & {
  status: WorkflowStatus;
}) {
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
