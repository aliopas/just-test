import { requireSupabaseAdmin } from '../lib/supabase';
import type { CreateRequestInput } from '../schemas/request.schema';
import { generateRequestNumber } from './request-number.service';
import { transitionRequestStatus } from './request-state.service';
import { notifyAdminsOfSubmission, notifyInvestorOfSubmission } from './notification.service';

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
