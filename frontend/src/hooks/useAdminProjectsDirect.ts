/**
 * Hook لجلب قائمة المشاريع للإدارة مباشرة من Supabase
 * بديل لـ useAdminProjectsList الذي يستخدم API backend
 */

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type {
  Project,
  ProjectListFilters,
  ProjectListResponse,
  CreateProjectInput,
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
  contract_date: string | null;
  completion_percentage: number | null;
  project_value: number | string | null;
  company_resource_id: string | null;
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
      contract_date,
      completion_percentage,
      project_value,
      company_resource_id,
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

    const projectValue = row.project_value !== null && row.project_value !== undefined
      ? (typeof row.project_value === 'string' ? Number(row.project_value) : row.project_value)
      : null;
    const completionPercentage = row.completion_percentage !== null && row.completion_percentage !== undefined
      ? Number(row.completion_percentage)
      : 0;

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
      contractDate: row.contract_date || null,
      completionPercentage,
      projectValue,
      companyResourceId: row.company_resource_id || null,
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

// Hook لجلب مورد واحد من المشروع
async function fetchAdminProjectDetailDirect(projectId: string): Promise<Project> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    throw new Error(`خطأ في جلب المشروع: ${error.message}`);
  }

  const row = data as ProjectRow;
  const operatingCosts = typeof row.operating_costs === 'string' ? Number(row.operating_costs) : row.operating_costs;
  const annualBenefits = typeof row.annual_benefits === 'string' ? Number(row.annual_benefits) : row.annual_benefits;
  const totalShares = typeof row.total_shares === 'string' ? Number(row.total_shares) : row.total_shares;
  const sharePrice = typeof row.share_price === 'string' ? Number(row.share_price) : row.share_price;
  const projectValue = row.project_value !== null && row.project_value !== undefined
    ? (typeof row.project_value === 'string' ? Number(row.project_value) : row.project_value)
    : null;
  const completionPercentage = row.completion_percentage !== null && row.completion_percentage !== undefined
    ? Number(row.completion_percentage)
    : 0;

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
    contractDate: row.contract_date || null,
    completionPercentage,
    projectValue,
    companyResourceId: row.company_resource_id || null,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    operatingCostPerShare: totalShares > 0 ? operatingCosts / totalShares : 0,
    annualBenefitPerShare: totalShares > 0 ? annualBenefits / totalShares : 0,
  };
}

export function useAdminProjectDetailDirect(projectId?: string | null) {
  return useQuery({
    queryKey: projectId ? ['adminProjectsDirect', 'detail', projectId] : ['adminProjectsDirect', 'detail', 'empty'],
    queryFn: () => {
      if (!projectId) {
        throw new Error('projectId is required');
      }
      return fetchAdminProjectDetailDirect(projectId);
    },
    enabled: Boolean(projectId) && typeof window !== 'undefined',
  });
}

// Mutations مباشرة مع Supabase
export function useCreateProjectMutationDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: input.name,
          name_ar: input.nameAr || null,
          description: input.description || null,
          description_ar: input.descriptionAr || null,
          cover_key: input.coverKey || null,
          operating_costs: input.operatingCosts,
          annual_benefits: input.annualBenefits,
          total_shares: input.totalShares,
          share_price: input.sharePrice || 50000,
          status: input.status || 'active',
          contract_date: input.contractDate || null,
          completion_percentage: input.completionPercentage ?? 0,
          project_value: input.projectValue || null,
          company_resource_id: input.companyResourceId || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`خطأ في إنشاء المشروع: ${error.message}`);
      }

      return fetchAdminProjectDetailDirect(data.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjectsDirect'] });
    },
  });
}

export function useUpdateProjectMutationDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<CreateProjectInput> }) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.nameAr !== undefined) updateData.name_ar = input.nameAr || null;
      if (input.description !== undefined) updateData.description = input.description || null;
      if (input.descriptionAr !== undefined) updateData.description_ar = input.descriptionAr || null;
      if (input.coverKey !== undefined) updateData.cover_key = input.coverKey || null;
      if (input.operatingCosts !== undefined) updateData.operating_costs = input.operatingCosts;
      if (input.annualBenefits !== undefined) updateData.annual_benefits = input.annualBenefits;
      if (input.totalShares !== undefined) updateData.total_shares = input.totalShares;
      if (input.sharePrice !== undefined) updateData.share_price = input.sharePrice;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.contractDate !== undefined) updateData.contract_date = input.contractDate || null;
      if (input.completionPercentage !== undefined) updateData.completion_percentage = input.completionPercentage;
      if (input.projectValue !== undefined) updateData.project_value = input.projectValue || null;
      if (input.companyResourceId !== undefined) updateData.company_resource_id = input.companyResourceId || null;

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw new Error(`خطأ في تحديث المشروع: ${error.message}`);
      }

      return fetchAdminProjectDetailDirect(id);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminProjectsDirect'] });
      queryClient.invalidateQueries({ queryKey: ['adminProjectsDirect', 'detail', variables.id] });
    },
  });
}

export function useDeleteProjectMutationDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`خطأ في حذف المشروع: ${error.message}`);
      }
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['adminProjectsDirect'] });
      queryClient.removeQueries({ queryKey: ['adminProjectsDirect', 'detail', id] });
    },
  });
}

// Hook لجلب موارد الشركة
export type CompanyResource = {
  id: string;
  titleAr: string;
  titleEn: string;
  value: number | null;
  currency: string;
};

export function useCompanyResources() {
  return useQuery<CompanyResource[]>({
    queryKey: ['companyResources'],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }

      const { data, error } = await supabase
        .from('company_resources')
        .select('id, title_ar, title_en, value, currency')
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(`خطأ في جلب موارد الشركة: ${error.message}`);
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        titleAr: row.title_ar,
        titleEn: row.title_en,
        value: row.value,
        currency: row.currency || 'SAR',
      }));
    },
    enabled: typeof window !== 'undefined',
  });
}
