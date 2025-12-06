/**
 * Hook لجلب عدد طلبات التسجيل غير المقروءة مباشرة من Supabase
 * بديل لـ useUnreadSignupRequestCount الذي يستخدم API backend
 */

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';

async function fetchUnreadSignupRequestCountDirect(): Promise<{ unreadCount: number }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // Get current admin user
  const { data: authData } = await supabase.auth.getUser();
  const adminId = authData.user?.id;

  if (!adminId) {
    return { unreadCount: 0 };
  }

  // Get all pending signup requests
  const { data: pendingRequests, error: pendingError } = await supabase
    .from('investor_signup_requests')
    .select('id')
    .eq('status', 'pending');

  if (pendingError) {
    throw new Error(`خطأ في جلب الطلبات المعلقة: ${pendingError.message}`);
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return { unreadCount: 0 };
  }

  // Get viewed request IDs for this admin
  const { data: viewedRequests, error: viewedError } = await supabase
    .from('admin_signup_request_views')
    .select('signup_request_id')
    .eq('admin_id', adminId);

  if (viewedError) {
    throw new Error(`خطأ في جلب الطلبات المقروءة: ${viewedError.message}`);
  }

  const viewedIds = new Set((viewedRequests || []).map((v) => v.signup_request_id));
  const unreadCount = pendingRequests.filter((r) => !viewedIds.has(r.id)).length;

  return { unreadCount };
}

export function useAdminAccountRequestsUnreadCountDirect() {
  return useQuery({
    queryKey: ['adminAccountRequestsUnreadCountDirect'],
    queryFn: fetchUnreadSignupRequestCountDirect,
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: typeof window !== 'undefined', // Only on client
  });
}
