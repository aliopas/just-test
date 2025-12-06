/**
 * Hook لجلب بيانات Investor Dashboard مباشرة من Supabase
 * بديل لـ useInvestorDashboard الذي يستخدم API backend
 */

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type { InvestorDashboardResponse } from '../types/dashboard';

async function fetchInvestorDashboardDirect(): Promise<InvestorDashboardResponse> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // Get current user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('يجب تسجيل الدخول لعرض لوحة التحكم');
  }

  const userId = authData.user.id;
  const recentLimit = 8;
  const thirtyDaysAgoIso = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Fetch all data in parallel
  const [
    statusResult,
    typeResult,
    recentResult,
    pendingResult,
    unreadResult,
    rollingVolumeResult,
  ] = await Promise.all([
    supabase
      .from('requests')
      .select('status')
      .eq('user_id', userId),
    supabase
      .from('requests')
      .select('type')
      .eq('user_id', userId),
    supabase
      .from('requests')
      .select('id, request_number, type, status, amount, currency, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(recentLimit),
    supabase
      .from('requests')
      .select('id, request_number, updated_at')
      .eq('user_id', userId)
      .eq('status', 'pending_info')
      .order('updated_at', { ascending: false })
      .limit(5),
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null),
    supabase
      .from('requests')
      .select('amount')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgoIso),
  ]);

  if (statusResult.error) {
    throw new Error(`خطأ في جلب إحصائيات الحالة: ${statusResult.error.message}`);
  }

  // Process status summary
  const statusCounts: Record<string, number> = {};
  (statusResult.data ?? []).forEach((row: { status: string }) => {
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
  });

  // Process type summary
  const typeCounts: Record<string, number> = {};
  (typeResult.data ?? []).forEach((row: { type: string }) => {
    typeCounts[row.type] = (typeCounts[row.type] || 0) + 1;
  });

  // Process recent requests
  const recentRequests = (recentResult.data ?? []).map((row: any) => ({
    id: row.id,
    requestNumber: row.request_number,
    type: row.type,
    status: row.status,
    amount: typeof row.amount === 'string' ? Number(row.amount) : row.amount,
    currency: row.currency ?? 'SAR',
    createdAt: row.created_at,
  }));

  // Calculate rolling volume
  const rollingVolume = (rollingVolumeResult.data ?? []).reduce(
    (sum: number, row: any) => {
      const amount = typeof row.amount === 'string' ? Number(row.amount) : row.amount;
      return sum + (amount || 0);
    },
    0
  );

  const unreadCount = unreadResult.count ?? 0;
  const totalRequests = (statusResult.data ?? []).length;

  // Process pending actions
  const pendingActionsList = (pendingResult.data ?? []).map((row: any) => ({
    id: row.id,
    requestNumber: row.request_number,
    updatedAt: row.updated_at,
  }));

  return {
    requestSummary: {
      byStatus: statusCounts as any,
      byType: typeCounts as any,
      total: totalRequests,
    },
    recentRequests,
    pendingActions: {
      pendingInfoCount: pendingActionsList.length,
      items: pendingActionsList,
    },
    generatedAt: new Date().toISOString(),
    insights: {
      averageAmountByType: {} as any,
      rolling30DayVolume: rollingVolume,
      lastRequest: recentRequests.length > 0 ? recentRequests[0] : null,
    },
    unreadNotifications: unreadCount,
  };
}

export function useInvestorDashboardDirect() {
  return useQuery({
    queryKey: ['investorDashboardDirect'],
    queryFn: fetchInvestorDashboardDirect,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: typeof window !== 'undefined', // Only on client
  });
}
