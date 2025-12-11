import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type {
  AdminCreateUserPayload,
  AdminUpdateUserPayload,
  AdminUser,
  AdminUserFilters,
  AdminUserListResponse,
} from '../types/admin-users';

const USERS_ROOT = ['adminUsers'] as const;

const userKeys = {
  list: (filters: AdminUserFilters) => [...USERS_ROOT, 'list', filters] as const,
};

const DEFAULT_LIMIT = 25;

function serializeFilters(filters: AdminUserFilters) {
  const params = new URLSearchParams();
  params.set('page', String(filters.page ?? 1));
  params.set('limit', String(DEFAULT_LIMIT));

  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status);
  }

  if (filters.kycStatus && filters.kycStatus !== 'all') {
    params.set('kycStatus', filters.kycStatus);
  }

  if (filters.search && filters.search.trim().length > 0) {
    params.set('search', filters.search.trim());
  }

  return params.toString();
}

export function useAdminUsers(filters: AdminUserFilters) {
  return useQuery<AdminUserListResponse>({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }

      const page = filters.page ?? 1;
      const limit = DEFAULT_LIMIT;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('v_admin_users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.kycStatus && filters.kycStatus !== 'all') {
        query = query.eq('kyc_status', filters.kycStatus);
      }

      if (filters.search && filters.search.trim().length > 0) {
        const pattern = `%${filters.search.trim()}%`;
        query = query.or(`email.ilike.${pattern},phone.ilike.${pattern},full_name.ilike.${pattern}`);
      }

      const { data, count, error } = await query;

      if (error) {
        throw new Error(`Failed to list users: ${error.message}`);
      }

      const users = (data ?? []).map((row: any) => ({
        id: row.id,
        email: row.email,
        phone: row.phone,
        phoneCountryCode: row.phone_cc,
        role: row.role,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        roles: row.role_slugs ?? [],
        roleNames: row.role_names ?? [],
        fullName: row.full_name,
        kycStatus: row.kyc_status,
        profileLanguage: row.language,
        riskProfile: row.risk_profile,
        city: row.city,
        kycUpdatedAt: row.kyc_updated_at,
        profileUpdatedAt: row.profile_updated_at,
        idType: row.id_type,
        nationality: row.nationality,
        residencyCountry: row.residency_country,
        communicationPreferences: row.communication_preferences ?? {},
      }));

      const total = count ?? 0;
      const pageCount = total === 0 ? 0 : Math.ceil(total / limit);

      return {
        users,
        meta: {
          page,
          limit,
          total,
          pageCount,
          hasNext: pageCount > 0 && page < pageCount,
        },
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AdminCreateUserPayload) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }

      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: payload,
      });

      if (error) {
        throw new Error(error.message || 'Failed to create user');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.user as AdminUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_ROOT });
      queryClient.invalidateQueries({ queryKey: ['adminInvestorsDirect'] });
    },
  });
}

export function useUpdateAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, payload }: { userId: string; payload: AdminUpdateUserPayload }) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }

      const { data, error } = await supabase.functions.invoke(`admin-update-user/${userId}`, {
        method: 'PATCH',
        body: payload,
      });

      if (error) {
        throw new Error(error.message || 'Failed to update user');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.user as AdminUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_ROOT });
      queryClient.invalidateQueries({ queryKey: ['adminInvestorsDirect'] });
    },
  });
}

export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }

      const { data, error } = await supabase.functions.invoke(`admin-delete-user/${userId}`, {
        method: 'DELETE',
      });

      if (error) {
        throw new Error(error.message || 'Failed to delete user');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return { success: true, deletedUserId: userId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_ROOT });
      queryClient.invalidateQueries({ queryKey: ['adminInvestorsDirect'] });
    },
  });
}


