import { requireSupabaseAdmin } from '../lib/supabase';
import type { CreateRequestInput } from '../schemas/request.schema';
import { generateRequestNumber } from './request-number.service';
import {
  transitionRequestStatus,
  type RequestStatus,
} from './request-state.service';
import {
  notifyAdminsOfSubmission,
  notifyInvestorOfSubmission,
} from './notification.service';
import type { RequestListQuery } from '../schemas/request-list.schema';

export async function createInvestorRequest(params: {
  userId: string;
  payload: CreateRequestInput;
}): Promise<{ id: string; requestNumber: string }> {
  const adminClient = requireSupabaseAdmin();
  const requestNumber = await generateRequestNumber();

  const requestPayload = {
    user_id: params.userId,
    request_number: requestNumber,
    type: params.payload.type,
    amount: params.payload.amount,
    currency: params.payload.currency ?? 'SAR',
    target_price: params.payload.targetPrice ?? null,
    expiry_at: params.payload.expiryAt ?? null,
    status: 'draft',
    notes: params.payload.notes ?? null,
  };

  const { data, error } = await adminClient
    .from('requests')
    .insert(requestPayload)
    .select('id')
    .single<{ id: string }>();

  if (error || !data) {
    throw new Error(`Failed to create request: ${error?.message ?? 'unknown'}`);
  }

  const { error: eventError } = await adminClient
    .from('request_events')
    .insert({
      request_id: data.id,
      from_status: null,
      to_status: 'draft',
      actor_id: params.userId,
      note: 'Request created',
    });

  if (eventError) {
    throw new Error(
      `Failed to log initial request event: ${eventError.message}`
    );
  }

  return {
    id: data.id,
    requestNumber,
  };
}

type RequestRecord = {
  id: string;
  status: string;
  user_id: string;
  request_number: string;
};

export async function submitInvestorRequest(params: {
  requestId: string;
  userId: string;
}) {
  const adminClient = requireSupabaseAdmin();

  const { data: requestRecord, error: fetchError } = await adminClient
    .from('requests')
    .select('id, status, user_id, request_number')
    .eq('id', params.requestId)
    .single<RequestRecord>();

  if (fetchError || !requestRecord) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  if (requestRecord.user_id !== params.userId) {
    throw new Error('REQUEST_NOT_OWNED');
  }

  if (requestRecord.status !== 'draft') {
    throw new Error('REQUEST_NOT_DRAFT');
  }

  const { count: attachmentCount, error: attachmentError } = await adminClient
    .from('attachments')
    .select('id', { count: 'exact', head: true })
    .eq('request_id', params.requestId);

  if (attachmentError) {
    throw new Error(`Failed to verify attachments: ${attachmentError.message}`);
  }

  if (!attachmentCount || attachmentCount === 0) {
    throw new Error('ATTACHMENTS_REQUIRED');
  }

  const transition = await transitionRequestStatus({
    requestId: params.requestId,
    actorId: params.userId,
    toStatus: 'submitted',
    note: 'Request submitted by investor',
  });

  await Promise.all([
    notifyInvestorOfSubmission({
      userId: params.userId,
      requestId: params.requestId,
      requestNumber: requestRecord.request_number,
    }),
    notifyAdminsOfSubmission({
      requestId: params.requestId,
      requestNumber: requestRecord.request_number,
    }),
  ]);

  return {
    status: transition.request.status,
  };
}

type RequestWorkflowRow = {
  id: string;
  request_number: string;
  type: string;
  amount: string | number;
  currency: string;
  target_price: string | number | null;
  expiry_at: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  last_event: {
    id: string | null;
    from_status: string | null;
    to_status: string | null;
    actor_id: string | null;
    note: string | null;
    created_at: string | null;
  } | null;
};

export async function listInvestorRequests(params: {
  userId: string;
  query: RequestListQuery;
}) {
  const adminClient = requireSupabaseAdmin();

  const page = params.query.page ?? 1;
  const limit = params.query.limit ?? 10;
  const offset = (page - 1) * limit;

  let queryBuilder = adminClient
    .from('v_request_workflow')
    .select(
      `
        id,
        request_number,
        type,
        amount,
        currency,
        target_price,
        expiry_at,
        status,
        created_at,
        updated_at,
        last_event
      `,
      { count: 'exact' }
    )
    .eq('user_id', params.userId);

  if (params.query.status) {
    queryBuilder = queryBuilder.eq('status', params.query.status);
  }

  const { data, error, count } = await queryBuilder
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to list requests: ${error.message}`);
  }

  const rows = (data as RequestWorkflowRow[] | null) ?? [];

  const requests = rows.map(row => ({
    id: row.id,
    requestNumber: row.request_number,
    type: row.type,
    amount: typeof row.amount === 'string' ? Number(row.amount) : row.amount,
    currency: row.currency,
    targetPrice:
      typeof row.target_price === 'string'
        ? Number.parseFloat(row.target_price)
        : row.target_price,
    expiryAt: row.expiry_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastEvent: row.last_event
      ? {
          id: row.last_event.id,
          fromStatus: row.last_event.from_status,
          toStatus: row.last_event.to_status,
          actorId: row.last_event.actor_id,
          note: row.last_event.note,
          createdAt: row.last_event.created_at,
        }
      : null,
  }));

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

type RequestDetailRow = {
  id: string;
  request_number: string;
  user_id: string;
  type: string;
  amount: string | number;
  currency: string;
  target_price: string | number | null;
  expiry_at: string | null;
  status: RequestStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type AttachmentRow = {
  id: string;
  filename: string;
  mime_type: string | null;
  size: number | null;
  storage_key: string;
  created_at: string;
};

type RequestEventRow = {
  id: string;
  from_status: string | null;
  to_status: string | null;
  actor_id: string | null;
  note: string | null;
  created_at: string;
};

async function createSignedDownloadUrl(storageKey: string) {
  try {
    const [bucket, ...pathParts] = storageKey.split('/');
    if (!bucket || pathParts.length === 0) {
      return null;
    }

    const path = pathParts.join('/');
    const adminClient = requireSupabaseAdmin();
    const { data, error } = await adminClient.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60);

    if (error || !data?.signedUrl) {
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    void error;
    return null;
  }
}

export async function getInvestorRequestDetail(params: {
  userId: string;
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
        type,
        amount,
        currency,
        target_price,
        expiry_at,
        status,
        notes,
        created_at,
        updated_at
      `
    )
    .eq('id', params.requestId)
    .single<RequestDetailRow>();

  if (requestError || !requestRow) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  if (requestRow.user_id !== params.userId) {
    throw new Error('REQUEST_NOT_OWNED');
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

  const attachmentsRows =
    (attachmentsResult.data as AttachmentRow[] | null) ?? [];
  const eventsRows = (eventsResult.data as RequestEventRow[] | null) ?? [];

  const attachments = await Promise.all(
    attachmentsRows.map(async attachment => {
      const downloadUrl = await createSignedDownloadUrl(attachment.storage_key);
      return {
        id: attachment.id,
        filename: attachment.filename,
        mimeType: attachment.mime_type,
        size: attachment.size,
        createdAt: attachment.created_at,
        storageKey: attachment.storage_key,
        downloadUrl,
      };
    })
  );

  const events = eventsRows.map(event => ({
    id: event.id,
    fromStatus: event.from_status,
    toStatus: event.to_status,
    actorId: event.actor_id,
    note: event.note,
    createdAt: event.created_at,
  }));

  return {
    request: {
      id: requestRow.id,
      requestNumber: requestRow.request_number,
      type: requestRow.type,
      amount:
        typeof requestRow.amount === 'string'
          ? Number.parseFloat(requestRow.amount)
          : requestRow.amount,
      currency: requestRow.currency,
      targetPrice:
        typeof requestRow.target_price === 'string'
          ? Number.parseFloat(requestRow.target_price)
          : requestRow.target_price,
      expiryAt: requestRow.expiry_at,
      status: requestRow.status,
      notes: requestRow.notes,
      createdAt: requestRow.created_at,
      updatedAt: requestRow.updated_at,
    },
    attachments,
    events,
    comments: events
      .filter(event => event.note && event.note.trim().length > 0)
      .map(event => ({
        id: event.id,
        note: event.note,
        createdAt: event.createdAt,
      })),
  };
}
