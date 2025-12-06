/**
 * Hooks لعمليات قبول/رفض طلبات إنشاء الحسابات مباشرة من Supabase
 * بديل لـ useApproveAccountRequestMutation و useRejectAccountRequestMutation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type {
  ApproveSignupRequestPayload,
  RejectSignupRequestPayload,
  AdminSignupRequest,
} from '../types/admin-account-request';

const ACCOUNT_REQUESTS_ROOT = ['adminAccountRequestsDirect'] as const;

/**
 * رفض طلب إنشاء حساب مباشرة من Supabase
 */
async function rejectSignupRequestDirect(
  payload: RejectSignupRequestPayload
): Promise<AdminSignupRequest> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // التحقق من أن المستخدم مسجل دخول
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }

  // تحديث حالة الطلب إلى rejected
  const { data: updated, error } = await supabase
    .from('investor_signup_requests')
    .update({
      status: 'rejected',
      reviewer_id: user.id,
      reviewed_at: new Date().toISOString(),
      decision_note: payload.note || null,
    })
    .eq('id', payload.id)
    .eq('status', 'pending')
    .select('*')
    .single();

  if (error) {
    throw new Error(`فشل في رفض الطلب: ${error.message}`);
  }

  if (!updated) {
    throw new Error('الطلب غير موجود أو تم مراجعته مسبقاً');
  }

  // تحويل إلى AdminSignupRequest format
  return {
    id: updated.id,
    email: updated.email,
    fullName: updated.full_name,
    phone: updated.phone,
    company: updated.company,
    message: updated.message,
    requestedRole: updated.requested_role ?? 'investor',
    status: updated.status as 'pending' | 'approved' | 'rejected',
    createdAt: updated.created_at,
    updatedAt: updated.updated_at,
    reviewerId: updated.reviewer_id,
    reviewedAt: updated.reviewed_at,
    decisionNote: updated.decision_note,
    approvedUserId: updated.approved_user_id,
    payload: updated.payload ?? {},
    isRead: false, // سيتم تحديثه من الـ query
  };
}

/**
 * قبول طلب إنشاء حساب - يستخدم Edge Function
 */
async function approveSignupRequestDirect(
  payload: ApproveSignupRequestPayload
): Promise<{ request: AdminSignupRequest; user: { id: string; email: string } }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // التحقق من أن المستخدم مسجل دخول
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }

  // استدعاء Edge Function للقبول (لأنه يحتاج إلى إنشاء مستخدم في Auth)
  try {
    const { data, error } = await supabase.functions.invoke('approve-signup-request', {
      body: {
        requestId: payload.id,
        note: payload.note,
        sendInvite: payload.sendInvite ?? true,
        locale: payload.locale ?? 'ar',
      },
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(`فشل في قبول الطلب: ${error.message || 'خطأ غير معروف'}`);
    }

    if (!data) {
      throw new Error('فشل في قبول الطلب: لا توجد بيانات مستلمة من الـ Edge Function');
    }

    if (data.error) {
      throw new Error(`فشل في قبول الطلب: ${data.error}`);
    }

    if (!data.request) {
      throw new Error('فشل في قبول الطلب: لا توجد بيانات الطلب في الاستجابة');
    }

    return data;
  } catch (invokeError) {
    console.error('Failed to invoke approve-signup-request function:', invokeError);
    if (invokeError instanceof Error) {
      throw invokeError;
    }
    throw new Error(`فشل في قبول الطلب: ${String(invokeError)}`);
  }
}

export function useRejectAccountRequestMutationDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectSignupRequestDirect,
    onSuccess: () => {
      // إعادة تحميل قائمة الطلبات
      queryClient.invalidateQueries({ queryKey: ACCOUNT_REQUESTS_ROOT });
      queryClient.invalidateQueries({ queryKey: ['adminAccountRequestsUnreadCountDirect'] });
    },
  });
}

export function useApproveAccountRequestMutationDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveSignupRequestDirect,
    onSuccess: () => {
      // إعادة تحميل قائمة الطلبات
      queryClient.invalidateQueries({ queryKey: ACCOUNT_REQUESTS_ROOT });
      queryClient.invalidateQueries({ queryKey: ['adminAccountRequestsUnreadCountDirect'] });
    },
  });
}
