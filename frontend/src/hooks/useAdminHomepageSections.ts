import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type { HomepageSection, HomepageSectionType } from './useHomepageSections';

export type HomepageSectionCreateInput = {
  type: HomepageSectionType;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  iconSvg?: string | null;
  displayOrder?: number;
  isActive?: boolean;
};

export type HomepageSectionUpdateInput = Partial<HomepageSectionCreateInput>;

export type HomepageSectionsListResponse = {
  sections: HomepageSection[];
};

const ADMIN_HOMEPAGE_SECTIONS_ROOT = ['admin', 'homepageSections'] as const;

export function useAdminHomepageSections(includeInactive = false) {
  return useQuery<HomepageSectionsListResponse>({
    queryKey: [...ADMIN_HOMEPAGE_SECTIONS_ROOT, 'list', includeInactive],
    queryFn: () => {
      return apiClient<HomepageSectionsListResponse>(
        `/admin/homepage-sections${includeInactive ? '?includeInactive=true' : ''}`
      );
    },
  });
}

export function useAdminHomepageSection(id: string | null) {
  return useQuery<HomepageSection>({
    queryKey: id ? [...ADMIN_HOMEPAGE_SECTIONS_ROOT, 'detail', id] : [...ADMIN_HOMEPAGE_SECTIONS_ROOT, 'detail', 'empty'],
    queryFn: () => {
      if (!id) {
        throw new Error('id is required');
      }
      return apiClient<HomepageSection>(`/admin/homepage-sections/${id}`);
    },
    enabled: Boolean(id),
  });
}

export function useCreateHomepageSectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: HomepageSectionCreateInput) => {
      return apiClient<HomepageSection>('/admin/homepage-sections', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_HOMEPAGE_SECTIONS_ROOT });
    },
  });
}

export function useUpdateHomepageSectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: HomepageSectionUpdateInput }) => {
      return apiClient<HomepageSection>(`/admin/homepage-sections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_HOMEPAGE_SECTIONS_ROOT });
    },
  });
}

export function useDeleteHomepageSectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      return apiClient(`/admin/homepage-sections/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_HOMEPAGE_SECTIONS_ROOT });
    },
  });
}

