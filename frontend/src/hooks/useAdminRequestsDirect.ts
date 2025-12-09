/**
 * Hook لجلب طلبات الإدارة مباشرة من Supabase
 * بديل لـ useAdminRequests الذي يستخدم API backend
 * 
 * هذا الـ hook يستخدم Supabase مباشرة مثل الصفحة الرئيسية
 */

import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type {
  AdminRequestFilters,
  AdminRequest,
  AdminRequestListMeta,
} from '../types/admin';

type AdminRequestRow = {
  id: string;
  request_number: string;
  status: string;
  type: string;
  amount: number | string | null;
  currency: string | null;
  target_price: number | string | null;
  expiry_at: string | null;
  metadata: unknown;
  created_at: string;
  updated_at: string;
  user_id: string | null;
};

type UserRow = {
  id: string;
  email: string | null;
  phone: string | null;
  phone_cc: string | null;
  status: string | null;
  created_at: string | null;
};

type ProfileRow = {
  user_id: string;
  full_name: string | null;
  preferred_name: string | null;
  language: string | null;
};

type AdminRequestViewRow = {
  request_id: string;
  admin_id: string;
  viewed_at: string;
};

async function fetchAdminRequestsDirect(filters: AdminRequestFilters) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const page = filters.page ?? 1;
  const limit = 25;
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from('requests')
    .select(
      `
      id,
      request_number,
      status,
      type,
      amount,
      currency,
      target_price,
      expiry_at,
      metadata,
      created_at,
      updated_at,
      user_id
    `,
      { count: 'exact' }
    );

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.type && filters.type !== 'all') {
    if (Array.isArray(filters.type)) {
      query = query.in('type', filters.type);
    } else {
      query = query.eq('type', filters.type);
    }
  }

  if (filters.createdFrom) {
    query = query.gte('created_at', filters.createdFrom);
  }

  if (filters.createdTo) {
    query = query.lte('created_at', filters.createdTo);
  }

  if (filters.search && filters.search.trim().length > 0) {
    query = query.ilike('request_number', `%${filters.search.trim()}%`);
  }

  // Apply ordering
  const sortBy = filters.sortBy ?? 'created_at';
  const order = filters.order === 'asc' ? true : false;
  query = query.order(sortBy, { ascending: order });

  // Apply pagination
  const { data: requests, error: requestsError, count } = await query
    .range(offset, offset + limit - 1);

  if (requestsError) {
    throw new Error(`خطأ في جلب الطلبات: ${requestsError.message}`);
  }

  const requestRows = (requests as AdminRequestRow[] | null) ?? [];

  // Get user IDs
  const userIds = requestRows
    .map(r => r.user_id)
    .filter((id): id is string => id !== null && id !== undefined && id !== '')
    .filter((id, index, self) => self.indexOf(id) === index); // unique

  // Fetch users and profiles in parallel
  const [usersResult, profilesResult, viewsResult] = await Promise.all([
    userIds.length > 0
      ? supabase
          .from('users')
          .select('id, email, phone, phone_cc, status, created_at')
          .in('id', userIds)
      : Promise.resolve({ data: [], error: null }),
    userIds.length > 0
      ? supabase
          .from('investor_profiles')
          .select('user_id, full_name, preferred_name, language')
          .in('user_id', userIds)
      : Promise.resolve({ data: [], error: null }),
    // Get read status for current admin (if authenticated)
    supabase.auth.getUser().then(async (authResult) => {
      if (authResult.data.user) {
        const requestIds = requestRows.map(r => r.id);
        if (requestIds.length > 0) {
          return supabase
            .from('admin_request_views')
            .select('request_id')
            .eq('admin_id', authResult.data.user.id)
            .in('request_id', requestIds);
        }
      }
      return { data: [], error: null };
    }),
  ]);

  const users = (usersResult.data as UserRow[] | null) ?? [];
  const profiles = (profilesResult.data as ProfileRow[] | null) ?? [];
  const views = (viewsResult.data as AdminRequestViewRow[] | null) ?? [];

  // Create maps
  const usersMap = new Map(users.map(u => [u.id, u]));
  const profilesMap = new Map(profiles.map(p => [p.user_id, p]));
  const readStatusMap = new Set(views.map(v => v.request_id));

  // Transform to AdminRequest format
  const adminRequests = requestRows.map(row => {
    const userId = row.user_id;
    const user = userId ? usersMap.get(userId) : null;
    const profile = userId ? profilesMap.get(userId) : null;

    return {
      id: row.id,
      requestNumber: row.request_number,
      status: row.status as any,
      type: row.type as any,
      amount:
        row.amount == null
          ? null
          : typeof row.amount === 'string'
            ? Number.parseFloat(row.amount)
            : row.amount,
      currency: (row.currency as any) ?? null,
      targetPrice:
        typeof row.target_price === 'string'
          ? Number.parseFloat(row.target_price)
          : row.target_price,
      expiryAt: row.expiry_at,
      metadata: (row.metadata as Record<string, unknown> | null) ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isRead: readStatusMap.has(row.id),
      investor: {
        id: userId ?? null,
        email: user?.email ?? null,
        phone: user?.phone ?? null,
        phoneCc: user?.phone_cc ?? null,
        fullName: profile?.full_name ?? null,
        preferredName: profile?.preferred_name ?? null,
        language: (profile?.language as 'ar' | 'en' | null) ?? null,
        idType: null,
        idNumber: null,
        idExpiry: null,
        nationality: null,
        residencyCountry: null,
        city: null,
        kycStatus: null,
        kycUpdatedAt: null,
        riskProfile: null,
        communicationPreferences: null,
        kycDocuments: null,
        profileCreatedAt: null,
        profileUpdatedAt: null,
        userStatus: user?.status ?? null,
        userCreatedAt: user?.created_at ?? null,
      },
    };
  });

  // Apply category filter if needed
  let filteredRequests = adminRequests;
  if (filters.category && filters.category !== 'all') {
    filteredRequests = adminRequests.filter(req => {
      if (filters.category === 'financial') {
        return req.type === 'buy' || req.type === 'sell';
      }
      if (filters.category === 'non-financial') {
        return req.type === 'partnership' || req.type === 'board_nomination' || req.type === 'feedback';
      }
      return true;
    });
  }

  // Apply isNew filter if needed
  if (filters.isNew !== undefined) {
    // For isNew, we need to check if request has been viewed by ANY admin
    // This requires an additional query, but for now we'll use isRead as approximation
    // TODO: Implement proper isNew check
    filteredRequests = filteredRequests.filter(req => {
      if (filters.isNew === true) {
        return !req.isRead;
      }
      return req.isRead;
    });
  }

  // Apply amount filters
  const minAmount = filters.minAmount;
  const maxAmount = filters.maxAmount;
  if (minAmount != null || maxAmount != null) {
    filteredRequests = filteredRequests.filter(req => {
      if (req.amount == null) return true; // Include NULL amounts
      if (minAmount != null && req.amount < minAmount) return false;
      if (maxAmount != null && req.amount > maxAmount) return false;
      return true;
    });
  }

  const total = count ?? 0;
  const pageCount = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    requests: filteredRequests,
    meta: {
      page,
      limit,
      total,
      pageCount,
      hasNext: page < pageCount,
    },
  };
}

export function useAdminRequestsDirect(filters: AdminRequestFilters) {
  const queryKey = useMemo(
    () => [
      'adminRequestsDirect',
      filters.page ?? 1,
      filters.status ?? 'all',
      filters.type ?? 'all',
      filters.category ?? 'all',
      filters.isNew ?? null,
      filters.minAmount ?? null,
      filters.maxAmount ?? null,
      filters.createdFrom ?? null,
      filters.createdTo ?? null,
      filters.search ?? '',
      filters.sortBy ?? 'created_at',
      filters.order ?? 'desc',
    ],
    [
      filters.page,
      filters.status,
      filters.type,
      filters.category,
      filters.isNew,
      filters.minAmount,
      filters.maxAmount,
      filters.createdFrom,
      filters.createdTo,
      filters.search,
      filters.sortBy,
      filters.order,
    ]
  );

  const query = useQuery({
    queryKey,
    queryFn: () => fetchAdminRequestsDirect(filters),
    placeholderData: keepPreviousData,
    // Removed refetchInterval to prevent automatic page refreshes
    enabled: typeof window !== 'undefined', // Only on client
  });

  return {
    requests: query.data?.requests ?? [],
    meta:
      query.data?.meta ??
      ({
        page: filters.page ?? 1,
        limit: 25,
        total: 0,
        pageCount: 0,
        hasNext: false,
      } satisfies AdminRequestListMeta),
    ...query,
  };
}
