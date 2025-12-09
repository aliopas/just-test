/**
 * Hook لجلب المشاريع النشطة للمستثمرين مباشرة من Supabase
 * يعرض فقط المشاريع النشطة (active) للمستثمرين للقراءة فقط
 */

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type { Project } from './useAdminProjects';

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

async function fetchInvestorProjectsDirect(): Promise<Project[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // جلب فقط المشاريع النشطة
  const { data: projectRows, error: projectError } = await supabase
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
    `
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (projectError) {
    console.error('[useInvestorProjectsDirect] Supabase error:', {
      message: projectError.message,
      details: projectError.details,
      hint: projectError.hint,
      code: projectError.code,
    });
    throw new Error(`خطأ في جلب المشاريع: ${projectError.message}${projectError.hint ? ` - ${projectError.hint}` : ''}`);
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

  return projects;
}

export function useInvestorProjectsDirect() {
  return useQuery<Project[]>({
    queryKey: ['investorProjectsDirect'],
    queryFn: () => fetchInvestorProjectsDirect(),
    // Removed refetchInterval to prevent automatic page refreshes
    enabled: typeof window !== 'undefined', // Only on client
  });
}

// Hook لجلب مورد واحد من المشروع
async function fetchInvestorProjectDetailDirect(projectId: string): Promise<Project> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('status', 'active') // فقط المشاريع النشطة
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

export function useInvestorProjectDetailDirect(projectId?: string | null) {
  return useQuery({
    queryKey: projectId ? ['investorProjectsDirect', 'detail', projectId] : ['investorProjectsDirect', 'detail', 'empty'],
    queryFn: () => {
      if (!projectId) {
        throw new Error('projectId is required');
      }
      return fetchInvestorProjectDetailDirect(projectId);
    },
    enabled: Boolean(projectId) && typeof window !== 'undefined',
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

export function useCompanyResourcesForInvestor() {
  return useQuery<CompanyResource[]>({
    queryKey: ['companyResourcesForInvestor'],
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

