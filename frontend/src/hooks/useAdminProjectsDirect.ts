/**
 * Hook لجلب قائمة المشاريع للإدارة مباشرة من Supabase
 * بديل لـ useAdminProjectsList الذي يستخدم API backend
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type {
  Project,
  ProjectListFilters,
  ProjectListResponse,
} from '../hooks/useAdminProjects';

type ProjectRow = {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  cover_key: string | null;
  operating_costs: number | string;
  annual_benefits: number | string;
  total_shares: number | string;
  share_price: number | string;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

function toProjectStatus(value: string): Project['status'] {
  const validStatuses: Project['status'][] = ['active', 'inactive', 'archived'];
  return validStatuses.includes(value as Project['status']) ? (value as Project['status']) : 'active';
}

async function fetchAdminProjectsListDirect(
  filters: ProjectListFilters
): Promise<ProjectListResponse> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 25;
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from('projects')
    .select(
      `
      id,
      name,
      name_ar,
      description,
      description_ar,
      cover_key,
      operating_costs,
      annual_benefits,
      total_shares,
      share_price,
      status,
      created_by,
      created_at,
      updated_at
    `,
      { count: 'exact' }
    );

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.search && filters.search.trim().length > 0) {
    const pattern = `%${filters.search.trim().toLowerCase()}%`;
    query = query.or(`name.ilike.${pattern},name_ar.ilike.${pattern},description.ilike.${pattern}`);
  }

  // Apply sorting
  const sortBy = filters.sortBy ?? 'created_at';
  const order = filters.order === 'asc' ? true : false;
  query = query.order(sortBy, { ascending: order });

  // Apply pagination
  const { data: projectRows, error: projectError, count } = await query
    .range(offset, offset + limit - 1);

  if (projectError) {
    throw new Error(`خطأ في جلب المشاريع: ${projectError.message}`);
  }

  const rows = (projectRows as ProjectRow[] | null) ?? [];

  // Transform to Project format
  const projects: Project[] = rows.map((row) => {
    const operatingCosts = typeof row.operating_costs === 'string' ? Number(row.operating_costs) : row.operating_costs;
    const annualBenefits = typeof row.annual_benefits === 'string' ? Number(row.annual_benefits) : row.annual_benefits;
    const totalShares = typeof row.total_shares === 'string' ? Number(row.total_shares) : row.total_shares;
    const sharePrice = typeof row.share_price === 'string' ? Number(row.share_price) : row.share_price;

    return {
      id: row.id,
      name: row.name,
      nameAr: row.name_ar,
      description: row.description,
      descriptionAr: row.description_ar,
      coverKey: row.cover_key,
      operatingCosts,
      annualBenefits,
      totalShares,
      sharePrice,
      status: toProjectStatus(row.status),
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      operatingCostPerShare: totalShares > 0 ? operatingCosts / totalShares : 0,
      annualBenefitPerShare: totalShares > 0 ? annualBenefits / totalShares : 0,
    };
  });

  const total = count ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    projects,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function useAdminProjectsListDirect(filters: ProjectListFilters) {
  const queryKey = [
    'adminProjectsDirect',
    filters.page ?? 1,
    filters.limit ?? 25,
    filters.status ?? 'all',
    filters.search ?? '',
    filters.sortBy ?? 'created_at',
    filters.order ?? 'desc',
  ] as const;

  return useQuery<ProjectListResponse>({
    queryKey,
    queryFn: () => fetchAdminProjectsListDirect(filters),
    placeholderData: keepPreviousData,
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: typeof window !== 'undefined', // Only on client
  });
}
