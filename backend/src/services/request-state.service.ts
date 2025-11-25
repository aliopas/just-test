import { requireSupabaseAdmin } from '../lib/supabase';

export type RequestStatus =
  | 'draft'
  | 'submitted'
  | 'screening'
  | 'pending_info'
  | 'compliance_review'
  | 'approved'
  | 'rejected'
  | 'settling'
  | 'completed';

export const REQUEST_STATUSES: RequestStatus[] = [
  'draft',
  'submitted',
  'screening',
  'pending_info',
  'compliance_review',
  'approved',
  'rejected',
  'settling',
  'completed',
];

const stateMachine: Record<RequestStatus, RequestStatus[]> = {
  // Allow approval from any active status (except final states)
  draft: [
    'submitted',
    'screening',
    'pending_info',
    'compliance_review',
    'approved',
    'rejected',
  ],
  submitted: [
    'screening',
    'pending_info',
    'compliance_review',
    'approved',
    'rejected',
  ],
  screening: ['pending_info', 'compliance_review', 'approved', 'rejected'],
  pending_info: ['screening', 'compliance_review', 'approved', 'rejected'],
  compliance_review: ['approved', 'pending_info', 'rejected'],
  // Final states - cannot be changed
  approved: ['settling', 'rejected'],
  settling: ['completed', 'rejected'],
  completed: [],
  rejected: [],
};

export function getAllowedTransitions(status: RequestStatus): RequestStatus[] {
  return stateMachine[status] ?? [];
}

export function canTransition(
  fromStatus: RequestStatus,
  toStatus: RequestStatus
): boolean {
  return getAllowedTransitions(fromStatus).includes(toStatus);
}

export function assertTransition(
  fromStatus: RequestStatus,
  toStatus: RequestStatus
): void {
  if (!canTransition(fromStatus, toStatus)) {
    throw new Error(
      `Transition from "${fromStatus}" to "${toStatus}" is not permitted`
    );
  }
}

interface TransitionOptions {
  requestId: string;
  actorId: string;
  toStatus: RequestStatus;
  note?: string | null;
}

type RequestRecord = {
  id: string;
  status: RequestStatus;
  user_id: string;
  request_number: string;
};

export async function transitionRequestStatus({
  requestId,
  actorId,
  toStatus,
  note,
}: TransitionOptions) {
  const adminClient = requireSupabaseAdmin();

  const { data: requestRecord, error: fetchError } = await adminClient
    .from('requests')
    .select('id,status,user_id,request_number')
    .eq('id', requestId)
    .single<RequestRecord>();

  if (fetchError || !requestRecord) {
    throw new Error(`Request ${requestId} not found`);
  }

  const fromStatus = requestRecord.status;
  if (fromStatus === toStatus) {
    throw new Error('Request is already in the target status');
  }

  assertTransition(fromStatus, toStatus);

  const { error: updateError } = await adminClient
    .from('requests')
    .update({
      status: toStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (updateError) {
    throw new Error(`Failed to update request status: ${updateError.message}`);
  }

  const eventPayload = {
    request_id: requestId,
    from_status: fromStatus,
    to_status: toStatus,
    actor_id: actorId,
    note: note?.slice(0, 500) ?? null,
    created_at: new Date().toISOString(),
  };

  const { data: eventRecord, error: eventError } = await adminClient
    .from('request_events')
    .insert(eventPayload)
    .select('*')
    .single();

  if (eventError) {
    throw new Error(
      `Failed to log request event: ${eventError.message ?? 'unknown error'}`
    );
  }

  return {
    request: {
      ...requestRecord,
      status: toStatus,
    },
    event: eventRecord,
  };
}
