import { randomUUID } from 'crypto';
import path from 'path';
import { requireSupabaseAdmin } from '../lib/supabase';
import type {
  CreateRequestInput,
  RequestAttachmentPresignInput,
  CreatePartnershipRequestInput,
  CreateBoardNominationRequestInput,
  CreateFeedbackRequestInput,
} from '../schemas/request.schema';
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

export async function createPartnershipRequest(params: {
  userId: string;
  payload: CreatePartnershipRequestInput;
}): Promise<{ id: string; requestNumber: string }> {
  const adminClient = requireSupabaseAdmin();
  const requestNumber = await generateRequestNumber();

  // Verify project exists if projectId is provided
  if (params.payload.projectId) {
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('id')
      .eq('id', params.payload.projectId)
      .single();

    if (projectError || !project) {
      throw new Error('PROJECT_NOT_FOUND');
    }
  }

  // Build metadata object
  const metadata = {
    projectId: params.payload.projectId ?? null,
    proposedAmount: params.payload.proposedAmount ?? null,
    partnershipPlan: params.payload.partnershipPlan,
  };

  const requestPayload = {
    user_id: params.userId,
    request_number: requestNumber,
    type: 'partnership' as const,
    amount: params.payload.proposedAmount ?? null,
    currency: 'SAR', // Default currency for partnership requests
    target_price: null,
    expiry_at: null,
    status: 'draft',
    notes: params.payload.notes ?? null,
    metadata,
  };

  const { data, error } = await adminClient
    .from('requests')
    .insert(requestPayload)
    .select('id')
    .single<{ id: string }>();

  if (error || !data) {
    throw new Error(`Failed to create partnership request: ${error?.message ?? 'unknown'}`);
  }

  const { error: eventError } = await adminClient
    .from('request_events')
    .insert({
      request_id: data.id,
      from_status: null,
      to_status: 'draft',
      actor_id: params.userId,
      note: 'Partnership request created',
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

export async function createBoardNominationRequest(params: {
  userId: string;
  payload: CreateBoardNominationRequestInput;
}): Promise<{ id: string; requestNumber: string }> {
  const adminClient = requireSupabaseAdmin();
  const requestNumber = await generateRequestNumber();

  // Build metadata object
  const metadata = {
    cvSummary: params.payload.cvSummary,
    experience: params.payload.experience,
    motivations: params.payload.motivations,
    qualifications: params.payload.qualifications,
  };

  const requestPayload = {
    user_id: params.userId,
    request_number: requestNumber,
    type: 'board_nomination' as const,
    amount: null, // Board nomination is not a financial request
    currency: null,
    target_price: null,
    expiry_at: null,
    status: 'draft',
    notes: params.payload.notes ?? null,
    metadata,
  };

  const { data, error } = await adminClient
    .from('requests')
    .insert(requestPayload)
    .select('id')
    .single<{ id: string }>();

  if (error || !data) {
    throw new Error(
      `Failed to create board nomination request: ${error?.message ?? 'unknown'}`
    );
  }

  const { error: eventError } = await adminClient
    .from('request_events')
    .insert({
      request_id: data.id,
      from_status: null,
      to_status: 'draft',
      actor_id: params.userId,
      note: 'Board nomination request created',
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

export async function createFeedbackRequest(params: {
  userId: string;
  payload: CreateFeedbackRequestInput;
}): Promise<{ id: string; requestNumber: string }> {
  const adminClient = requireSupabaseAdmin();
  const requestNumber = await generateRequestNumber();

  // Build metadata object
  const metadata = {
    subject: params.payload.subject,
    category: params.payload.category,
    description: params.payload.description,
    priority: params.payload.priority,
  };

  const requestPayload = {
    user_id: params.userId,
    request_number: requestNumber,
    type: 'feedback' as const,
    amount: null, // Feedback is not a financial request
    currency: null,
    target_price: null,
    expiry_at: null,
    status: 'draft',
    notes: params.payload.notes ?? null,
    metadata,
  };

  const { data, error } = await adminClient
    .from('requests')
    .insert(requestPayload)
    .select('id')
    .single<{ id: string }>();

  if (error || !data) {
    throw new Error(
      `Failed to create feedback request: ${error?.message ?? 'unknown'}`
    );
  }

  const { error: eventError } = await adminClient
    .from('request_events')
    .insert({
      request_id: data.id,
      from_status: null,
      to_status: 'draft',
      actor_id: params.userId,
      note: 'Feedback request created',
    });

  if (eventError) {
    throw new Error(
      `Failed to log initial request event: ${eventError.message}`
    );
  }

  // TODO: Send notification to admins based on priority (Story 3.11 AC #7)
  // This will be implemented when notification service supports priority-based notifications

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

  // Filter by type(s) - support multiple types
  if (params.query.type) {
    const types = Array.isArray(params.query.type) ? params.query.type : [params.query.type];
    if (types.length === 1) {
      queryBuilder = queryBuilder.eq('type', types[0]);
    } else if (types.length > 1) {
      queryBuilder = queryBuilder.in('type', types);
    }
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

// Storage bucket for request attachments
const REQUEST_ATTACHMENTS_BUCKET =
  process.env.REQUEST_ATTACHMENTS_BUCKET?.trim() || 'request-attachments';

function resolveRequestAttachmentPath(
  requestId: string,
  fileName: string,
  now: Date = new Date()
): { objectPath: string; storageKey: string } {
  const extension = path.extname(fileName).toLowerCase();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const uuid = randomUUID();
  const objectPath = `${requestId}/${year}/${month}/${uuid}${extension}`;
  const storageKey = `${REQUEST_ATTACHMENTS_BUCKET}/${objectPath}`;
  return { objectPath, storageKey };
}

export type RequestAttachmentPresignResult = {
  attachmentId: string;
  bucket: string;
  storageKey: string;
  uploadUrl: string;
  token: string | null;
  path: string;
  headers: {
    'Content-Type': string;
    'x-upsert': string;
  };
};

export async function createRequestAttachmentUploadUrl(params: {
  requestId: string;
  userId: string;
  input: RequestAttachmentPresignInput;
}): Promise<RequestAttachmentPresignResult> {
  const adminClient = requireSupabaseAdmin();

  // Verify request exists and belongs to user
  const { data: requestRecord, error: requestError } = await adminClient
    .from('requests')
    .select('id, user_id, status')
    .eq('id', params.requestId)
    .single<{ id: string; user_id: string; status: string }>();

  if (requestError || !requestRecord) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  if (requestRecord.user_id !== params.userId) {
    throw new Error('REQUEST_NOT_OWNED');
  }

  // Only allow attachments for draft or submitted requests
  if (
    requestRecord.status !== 'draft' &&
    requestRecord.status !== 'submitted'
  ) {
    throw new Error('REQUEST_NOT_EDITABLE');
  }

  const { objectPath, storageKey } = resolveRequestAttachmentPath(
    params.requestId,
    params.input.fileName
  );

  const { data, error } = await adminClient.storage
    .from(REQUEST_ATTACHMENTS_BUCKET)
    .createSignedUploadUrl(objectPath);

  if (error || !data) {
    throw new Error(
      `Failed to create signed upload url: ${error?.message ?? 'unknown error'}`
    );
  }

  // Pre-create attachment record (will be updated after successful upload)
  const attachmentId = randomUUID();
  const { error: insertError } = await adminClient
    .from('attachments')
    .insert({
      id: attachmentId,
      request_id: params.requestId,
      filename: params.input.fileName,
      mime_type: params.input.fileType,
      size: params.input.fileSize,
      storage_key: storageKey,
    });

  if (insertError) {
    throw new Error(
      `Failed to create attachment record: ${insertError.message}`
    );
  }

  return {
    attachmentId,
    bucket: REQUEST_ATTACHMENTS_BUCKET,
    storageKey,
    uploadUrl: data.signedUrl,
    token: data.token ?? null,
    path: data.path ?? objectPath,
    headers: {
      'Content-Type': params.input.fileType,
      'x-upsert': 'false',
    },
  };
}
