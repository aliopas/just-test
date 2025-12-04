/**
 * Hooks محدثة للمشاريع باستخدام Supabase مباشرة
 * 
 * هذه الـ hooks تحل محل usePublicProjects
 */

import { useQuery } from '@tanstack/react-query';
import { useProjects, useProjectById, type Project } from './useSupabaseTables';
import { getStoragePublicUrl, PROJECT_IMAGES_BUCKET } from '../utils/supabase-storage';
import { useLanguage } from '../context/LanguageContext';

export interface ProjectListResponse {
  projects: Array<{
    id: string;
    name: string;
    nameAr: string | null;
    description: string | null;
    descriptionAr: string | null;
    coverKey: string | null;
    coverUrl: string | null;
    operatingCosts: number;
    annualBenefits: number;
    totalShares: number;
    sharePrice: number;
    status: 'active' | 'inactive' | 'archived';
    createdAt: string;
    updatedAt: string;
    // Computed fields
    operatingCostPerShare: number;
    annualBenefitPerShare: number;
  }>;
}

/**
 * Hook لجلب قائمة المشاريع النشطة
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = usePublicProjects();
 * ```
 */
export function usePublicProjects() {
  const { language } = useLanguage();
  const { data: projects, isLoading, isError, error } = useProjects();

  return useQuery<ProjectListResponse>({
    queryKey: ['publicProjects', 'list'],
    queryFn: () => {
      const transformedProjects = (projects || []).map(project => ({
        id: project.id,
        name: project.name,
        nameAr: project.name_ar,
        description: project.description,
        descriptionAr: project.description_ar,
        coverKey: project.cover_key,
        coverUrl: project.cover_key ? getStoragePublicUrl(PROJECT_IMAGES_BUCKET, project.cover_key) : null,
        operatingCosts: Number(project.operating_costs),
        annualBenefits: Number(project.annual_benefits),
        totalShares: project.total_shares,
        sharePrice: Number(project.share_price),
        status: project.status as 'active' | 'inactive' | 'archived',
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        // Computed fields
        operatingCostPerShare: project.total_shares > 0 
          ? Number(project.operating_costs) / project.total_shares 
          : 0,
        annualBenefitPerShare: project.total_shares > 0 
          ? Number(project.annual_benefits) / project.total_shares 
          : 0,
      }));

      return {
        projects: transformedProjects,
      };
    },
    enabled: typeof window !== 'undefined',
  });
}

/**
 * Hook لجلب تفاصيل مشروع واحد
 * 
 * @example
 * ```tsx
 * const { data: project } = usePublicProjectDetail(projectId);
 * ```
 */
export function usePublicProjectDetail(projectId?: string | null) {
  const { language } = useLanguage();
  const { data: project, isLoading, isError, error } = useProjectById(projectId || '');

  return useQuery<{
    id: string;
    name: string;
    nameAr: string | null;
    description: string | null;
    descriptionAr: string | null;
    coverKey: string | null;
    coverUrl: string | null;
    operatingCosts: number;
    annualBenefits: number;
    totalShares: number;
    sharePrice: number;
    status: 'active' | 'inactive' | 'archived';
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
    // Computed fields
    operatingCostPerShare: number;
    annualBenefitPerShare: number;
  }>({
    queryKey: ['publicProjects', 'detail', projectId],
    queryFn: () => {
      if (!project) {
        throw new Error('Project not found');
      }

      return {
        id: project.id,
        name: project.name,
        nameAr: project.name_ar,
        description: project.description,
        descriptionAr: project.description_ar,
        coverKey: project.cover_key,
        coverUrl: project.cover_key ? getStoragePublicUrl(PROJECT_IMAGES_BUCKET, project.cover_key) : null,
        operatingCosts: Number(project.operating_costs),
        annualBenefits: Number(project.annual_benefits),
        totalShares: project.total_shares,
        sharePrice: Number(project.share_price),
        status: project.status as 'active' | 'inactive' | 'archived',
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        createdBy: project.created_by || null,
        // Computed fields
        operatingCostPerShare: project.total_shares > 0 
          ? Number(project.operating_costs) / project.total_shares 
          : 0,
        annualBenefitPerShare: project.total_shares > 0 
          ? Number(project.annual_benefits) / project.total_shares 
          : 0,
      };
    },
    enabled: Boolean(projectId) && typeof window !== 'undefined',
  });
}

