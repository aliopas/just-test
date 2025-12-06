/**
 * Hook لجلب تفاصيل طلب للمستثمر مباشرة من Supabase
 * بديل لـ useInvestorRequestDetail الذي يستخدم API backend
 */

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type { InvestorRequestDetail } from '../types/request';
import type { RequestStatus, RequestType, RequestCurrency } from '../types/request';

type RequestRow = {
  id: string;
  request_number: string;
  status: string;
  type: string;
  amount: number | string | null;
  currency: string | null;
  target_price: number | string | null;
  expiry_at: string | null;
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

type EventRow = {
  id: string;
  from_status: string | null;
  to_status: string | null;
  actor_id: string | null;
  note: string | null;
  created_at: string;
};

type CommentRow = {
  id: string;
  comment: string;
  created_at: string;
};

function toRequestStatus(value: string): RequestStatus {
  const validStatuses: RequestStatus[] = [
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
  return validStatuses.includes(value as RequestStatus) ? (value as RequestStatus) : 'draft';
}

function toRequestType(value: string): RequestType {
  const validTypes: RequestType[] = ['buy', 'sell', 'partnership', 'board_nomination', 'feedback'];
  return validTypes.includes(value as RequestType) ? (value as RequestType) : 'buy';
}

function toRequestCurrency(value: string | null): RequestCurrency | null {
  if (!value) return null;
  const validCurrencies: RequestCurrency[] = ['SAR', 'USD', 'EUR'];
  return validCurrencies.includes(value as RequestCurrency) ? (value as RequestCurrency) : null;
}

async function fetchInvestorRequestDetailDirect(
  requestId: string
): Promise<InvestorRequestDetail> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // Get current user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('يجب تسجيل الدخول لعرض تفاصيل الطلب');
  }

  const userId = authData.user.id;

  // Fetch request (with user_id check for security)
  const { data: request, error: requestError } = await supabase
    .from('requests')
    .select('*')
    .eq('id', requestId)
    .eq('user_id', userId)
    .single<RequestRow>();

  if (requestError) {
    throw new Error(`خطأ في جلب الطلب: ${requestError.message}`);
  }

  if (!request) {
    throw new Error('الطلب غير موجود أو ليس لديك صلاحية لعرضه');
  }

  // Fetch related data in parallel
  const [attachmentsResult, eventsResult, commentsResult] = await Promise.all([
    supabase
      .from('attachments')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false }),
    supabase
      .from('request_events')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false }),
    supabase
      .from('request_comments')
      .select('id, comment, created_at')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false }),
  ]);

  const attachments = (attachmentsResult.data as AttachmentRow[] | null) ?? [];
  const events = (eventsResult.data as EventRow[] | null) ?? [];
  const comments = (commentsResult.data as CommentRow[] | null) ?? [];

  // Transform to InvestorRequestDetail format
  return {
    request: {
      id: request.id,
      requestNumber: request.request_number,
      type: toRequestType(request.type),
      amount: typeof request.amount === 'string' ? Number(request.amount) : request.amount,
      currency: toRequestCurrency(request.currency),
      targetPrice:
        typeof request.target_price === 'string'
          ? Number.parseFloat(request.target_price)
          : request.target_price,
      expiryAt: request.expiry_at,
      status: toRequestStatus(request.status),
      createdAt: request.created_at,
      updatedAt: request.updated_at,
      lastEvent: events.length > 0
        ? {
            id: events[0].id,
            fromStatus: events[0].from_status,
            toStatus: events[0].to_status,
            actorId: events[0].actor_id,
            note: events[0].note,
            createdAt: events[0].created_at,
          }
        : null,
      notes: request.notes,
    },
    attachments: attachments.map((att) => ({
      id: att.id,
      filename: att.filename,
      mimeType: att.mime_type,
      size: att.size,
      createdAt: att.created_at,
      storageKey: att.storage_key,
      downloadUrl: null, // Will be generated on demand
    })),
    events: events.map((evt) => ({
      id: evt.id,
      fromStatus: evt.from_status,
      toStatus: evt.to_status,
      actorId: evt.actor_id,
      note: evt.note,
      createdAt: evt.created_at,
    })),
    comments: comments.map((comm) => ({
      id: comm.id,
      note: comm.comment,
      createdAt: comm.created_at,
    })),
  };
}

export function useInvestorRequestDetailDirect(requestId?: string | null) {
  return useQuery({
    queryKey: ['investorRequestDetailDirect', requestId],
    queryFn: () => {
      if (!requestId) {
        throw new Error('requestId is required');
      }
      return fetchInvestorRequestDetailDirect(requestId);
    },
    enabled: Boolean(requestId),
    staleTime: 60_000,
  });
}
