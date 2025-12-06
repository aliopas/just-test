/**
 * Hook لجلب إحصائيات Admin Dashboard مباشرة من Supabase
 * بديل لـ useAdminDashboardStats الذي يستخدم API backend
 * 
 * ملاحظة: هذا الـ hook مبسط وقد لا يحتوي على جميع الإحصائيات المتقدمة
 */

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type { AdminDashboardStats } from '../types/admin-dashboard';

async function fetchAdminDashboardStatsDirect(): Promise<AdminDashboardStats> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // Get current user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('يجب تسجيل الدخول كـ admin لعرض لوحة التحكم');
  }

  // Fetch status counts
  const statusResult = await supabase
    .from('requests')
    .select('status');

  if (statusResult.error) {
    throw new Error(`خطأ في جلب إحصائيات الحالة: ${statusResult.error.message}`);
  }

  // Process status summary
  const statusCounts: Record<string, number> = {};
  (statusResult.data ?? []).forEach((row: { status: string }) => {
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
  });

  const totalRequests = statusResult.data?.length ?? 0;

  // Get recent requests for trend (last 14 days)
  const trendStart = new Date();
  trendStart.setDate(trendStart.getDate() - 14);
  const trendResult = await supabase
    .from('requests')
    .select('created_at')
    .gte('created_at', trendStart.toISOString());

  // Calculate daily trend (simplified)
  const trendData: Array<{ date: string; count: number }> = [];
  const dailyCounts: Record<string, number> = {};
  
  (trendResult.data ?? []).forEach((row: { created_at: string }) => {
    const date = new Date(row.created_at).toISOString().split('T')[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });

  Object.entries(dailyCounts).forEach(([date, count]) => {
    trendData.push({ date, count });
  });

  trendData.sort((a, b) => a.date.localeCompare(b.date));

  // Get stuck requests (simplified - requests in certain statuses for more than 7 days)
  const stuckThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const stuckResult = await supabase
    .from('requests')
    .select('id, request_number, status, updated_at')
    .in('status', ['pending_info', 'screening', 'compliance_review'])
    .lt('updated_at', stuckThreshold)
    .order('updated_at', { ascending: true })
    .limit(15);

  const stuckRequests = (stuckResult.data ?? []).map((row: any) => ({
    id: row.id,
    requestNumber: row.request_number,
    status: row.status,
    lastUpdated: row.updated_at,
  }));

  // Summary
  const summary = {
    totalRequests,
    byStatus: statusCounts,
    averageProcessingHours: null as number | null,
    medianProcessingHours: null as number | null,
  };

  // Transform trend data
  const trend = trendData.map(item => ({
    day: item.date,
    count: item.count,
  }));

  // Transform stuck requests
  const stuckRequestsTransformed = stuckRequests.map((req: any) => ({
    id: req.id,
    requestNumber: req.request_number,
    status: req.status,
    investorEmail: null as string | null,
    ageHours: Math.floor(
      (Date.now() - new Date(req.lastUpdated).getTime()) / (1000 * 60 * 60)
    ),
    updatedAt: req.lastUpdated,
  }));

  // KPIs
  const pendingInfoCount = statusCounts['pending_info'] ?? 0;
  const kpis = {
    processingHours: {
      average: null as number | null,
      median: null as number | null,
      p90: null as number | null,
    },
    pendingInfoAging: {
      total: pendingInfoCount,
      overdue: 0,
      thresholdHours: 24 * 7,
      rate: 0,
      alert: pendingInfoCount > 10,
    },
    attachmentSuccess: {
      totalRequests: totalRequests,
      withAttachments: 0,
      rate: null as number | null,
      alert: false,
    },
    notificationFailures: {
      total: 0,
      failed: 0,
      rate: null as number | null,
      windowDays: 7,
      alert: false,
    },
  };

  return {
    summary,
    trend,
    stuckRequests: stuckRequestsTransformed,
    kpis,
  };
}

export function useAdminDashboardStatsDirect() {
  return useQuery({
    queryKey: ['adminDashboardStatsDirect'],
    queryFn: fetchAdminDashboardStatsDirect,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: typeof window !== 'undefined', // Only on client
  });
}
