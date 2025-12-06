/**
 * Hooks لعمليات إدارة الطلبات (Approve, Reject, Move to Status) مباشرة من Supabase
 * بديل لـ useAdminRequest mutations التي تستخدم API backend
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type { RequestStatus } from '../types/request';

// Helper function to check if transition is allowed
function canTransition(fromStatus: RequestStatus, toStatus: RequestStatus): boolean {
  const stateMachine: Record<RequestStatus, RequestStatus[]> = {
    draft: ['submitted', 'screening', 'pending_info', 'compliance_review', 'approved', 'rejected'],
    submitted: ['screening', 'pending_info', 'compliance_review', 'approved', 'rejected'],
    screening: ['pending_info', 'compliance_review', 'approved', 'rejected'],
    pending_info: ['screening', 'compliance_review', 'approved', 'rejected'],
    compliance_review: ['approved', 'pending_info', 'rejected'],
    approved: ['settling', 'rejected'],
    settling: ['completed', 'rejected'],
    completed: [],
    rejected: [],
  };

  return stateMachine[fromStatus]?.includes(toStatus) ?? false;
}

// Helper function to transition request status
async function transitionRequestStatus({
  requestId,
  actorId,
  fromStatus,
  toStatus,
  note,
}: {
  requestId: string;
  actorId: string;
  fromStatus: RequestStatus;
  toStatus: RequestStatus;
  note: string | null;
}): Promise<{ status: RequestStatus }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // Check if transition is allowed
  if (!canTransition(fromStatus, toStatus)) {
    throw new Error(`لا يمكن الانتقال من "${fromStatus}" إلى "${toStatus}"`);
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('requests')
    .update({
      status: toStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (updateError) {
    throw new Error(`فشل تحديث حالة الطلب: ${updateError.message}`);
  }

  // Create event record
  const { error: eventError } = await supabase
    .from('request_events')
    .insert({
      request_id: requestId,
      from_status: fromStatus,
      to_status: toStatus,
      actor_id: actorId,
      note: note,
    });

  if (eventError) {
    throw new Error(`فشل تسجيل حدث الطلب: ${eventError.message}`);
  }

  return { status: toStatus };
}

// Approve Request
async function approveRequestDirect({
  requestId,
  note,
}: {
  requestId: string;
  note?: string;
}): Promise<{ status: RequestStatus }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('يجب تسجيل الدخول للموافقة على الطلب');
  }

  const actorId = authData.user.id;

  // Get current request status
  const { data: request, error: requestError } = await supabase
    .from('requests')
    .select('status')
    .eq('id', requestId)
    .single();

  if (requestError || !request) {
    throw new Error('الطلب غير موجود');
  }

  const fromStatus = request.status as RequestStatus;
  const toStatus: RequestStatus = 'approved';

  // Check if transition is allowed
  if (!canTransition(fromStatus, toStatus)) {
    throw new Error(`لا يمكن الموافقة على الطلب من الحالة "${fromStatus}"`);
  }

  // Transition to approved
  const result = await transitionRequestStatus({
    requestId,
    actorId,
    fromStatus,
    toStatus,
    note: note || null,
  });

  return { status: result.status };
}

// Reject Request
async function rejectRequestDirect({
  requestId,
  note,
}: {
  requestId: string;
  note: string;
}): Promise<{ status: RequestStatus }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('يجب تسجيل الدخول لرفض الطلب');
  }

  const actorId = authData.user.id;

  // Get current request status
  const { data: request, error: requestError } = await supabase
    .from('requests')
    .select('status')
    .eq('id', requestId)
    .single();

  if (requestError || !request) {
    throw new Error('الطلب غير موجود');
  }

  const fromStatus = request.status as RequestStatus;
  const toStatus: RequestStatus = 'rejected';

  // Check if transition is allowed
  if (!canTransition(fromStatus, toStatus)) {
    throw new Error(`لا يمكن رفض الطلب من الحالة "${fromStatus}"`);
  }

  // Transition to rejected
  const result = await transitionRequestStatus({
    requestId,
    actorId,
    fromStatus,
    toStatus,
    note: note || null,
  });

  return { status: result.status };
}

// Move to Screening
async function moveToScreeningDirect({
  requestId,
  note,
}: {
  requestId: string;
  note?: string;
}): Promise<{ status: RequestStatus }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('يجب تسجيل الدخول لنقل الطلب إلى المراجعة');
  }

  const actorId = authData.user.id;

  // Get current request status
  const { data: request, error: requestError } = await supabase
    .from('requests')
    .select('status')
    .eq('id', requestId)
    .single();

  if (requestError || !request) {
    throw new Error('الطلب غير موجود');
  }

  const fromStatus = request.status as RequestStatus;
  const toStatus: RequestStatus = 'screening';

  // Check if transition is allowed
  if (!canTransition(fromStatus, toStatus)) {
    throw new Error(`لا يمكن نقل الطلب إلى المراجعة من الحالة "${fromStatus}"`);
  }

  // Transition to screening
  const result = await transitionRequestStatus({
    requestId,
    actorId,
    fromStatus,
    toStatus,
    note: note || null,
  });

  return { status: result.status };
}

// Move to Compliance Review
async function moveToComplianceReviewDirect({
  requestId,
  note,
}: {
  requestId: string;
  note?: string;
}): Promise<{ status: RequestStatus }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('يجب تسجيل الدخول لنقل الطلب إلى مراجعة الامتثال');
  }

  const actorId = authData.user.id;

  // Get current request status
  const { data: request, error: requestError } = await supabase
    .from('requests')
    .select('status')
    .eq('id', requestId)
    .single();

  if (requestError || !request) {
    throw new Error('الطلب غير موجود');
  }

  const fromStatus = request.status as RequestStatus;
  const toStatus: RequestStatus = 'compliance_review';

  // Check if transition is allowed
  if (!canTransition(fromStatus, toStatus)) {
    throw new Error(`لا يمكن نقل الطلب إلى مراجعة الامتثال من الحالة "${fromStatus}"`);
  }

  // Transition to compliance_review
  const result = await transitionRequestStatus({
    requestId,
    actorId,
    fromStatus,
    toStatus,
    note: note || null,
  });

  return { status: result.status };
}

// Move to Pending Info
async function moveToPendingInfoDirect({
  requestId,
  note,
}: {
  requestId: string;
  note: string;
}): Promise<{ status: RequestStatus }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('يجب تسجيل الدخول لطلب معلومات إضافية');
  }

  const actorId = authData.user.id;

  // Get current request status
  const { data: request, error: requestError } = await supabase
    .from('requests')
    .select('status')
    .eq('id', requestId)
    .single();

  if (requestError || !request) {
    throw new Error('الطلب غير موجود');
  }

  const fromStatus = request.status as RequestStatus;
  const toStatus: RequestStatus = 'pending_info';

  // Check if transition is allowed
  if (!canTransition(fromStatus, toStatus)) {
    throw new Error(`لا يمكن نقل الطلب إلى انتظار المعلومات من الحالة "${fromStatus}"`);
  }

  // Transition to pending_info
  const result = await transitionRequestStatus({
    requestId,
    actorId,
    fromStatus,
    toStatus,
    note: note || null,
  });

  return { status: result.status };
}

// Hooks
export function useApproveRequestMutationDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveRequestDirect,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminRequestsDirect'] });
      queryClient.invalidateQueries({ queryKey: ['adminRequestDetailDirect', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['adminRequestReportDirect'] });
    },
  });
}

export function useRejectRequestMutationDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectRequestDirect,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminRequestsDirect'] });
      queryClient.invalidateQueries({ queryKey: ['adminRequestDetailDirect', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['adminRequestReportDirect'] });
    },
  });
}

export function useMoveToScreeningMutationDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moveToScreeningDirect,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminRequestsDirect'] });
      queryClient.invalidateQueries({ queryKey: ['adminRequestDetailDirect', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['adminRequestReportDirect'] });
    },
  });
}

export function useMoveToComplianceReviewMutationDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moveToComplianceReviewDirect,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminRequestsDirect'] });
      queryClient.invalidateQueries({ queryKey: ['adminRequestDetailDirect', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['adminRequestReportDirect'] });
    },
  });
}

export function useMoveToPendingInfoMutationDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moveToPendingInfoDirect,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminRequestsDirect'] });
      queryClient.invalidateQueries({ queryKey: ['adminRequestDetailDirect', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['adminRequestReportDirect'] });
    },
  });
}
