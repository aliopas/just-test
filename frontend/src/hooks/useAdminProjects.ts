import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';

export type Project = {
  id: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  coverKey: string | null;
  operatingCosts: number;
  annualBenefits: number;
  totalShares: number;
  sharePrice: number;
  status: 'active' | 'inactive' | 'archived';
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  operatingCostPerShare: number;
  annualBenefitPerShare: number;
};

export type ProjectListResponse = {
  projects: Project[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type ProjectListFilters = {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive' | 'archived' | 'all';
  search?: string;
  sortBy?: 'created_at' | 'name' | 'status';
  order?: 'asc' | 'desc';
};

export type CreateProjectInput = {
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  coverKey?: string | null;
  operatingCosts: number;
  annualBenefits: number;
  totalShares: number;
  sharePrice?: number;
  status?: 'active' | 'inactive' | 'archived';
};

export type ProjectImagePresignResponse = {
  bucket: string;
  storageKey: string;
  uploadUrl: string;
  token: string | null;
  headers: Record<string, string>;
  path: string;
};

const PROJECTS_ROOT = ['adminProjects'] as const;

const projectKeys = {
  list: (filters: ProjectListFilters) => [...PROJECTS_ROOT, 'list', filters] as const,
  detail: (id: string) => [...PROJECTS_ROOT, 'detail', id] as const,
};

const DEFAULT_LIMIT = 25;

function buildListQuery(filters: ProjectListFilters) {
  const params = new URLSearchParams();
  params.set('page', String(filters.page ?? 1));
  params.set('limit', String(filters.limit ?? DEFAULT_LIMIT));
  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status);
  }
  if (filters.search && filters.search.trim().length > 0) {
    params.set('search', filters.search.trim());
  }
  if (filters.sortBy) {
    params.set('sortBy', filters.sortBy);
  }
  if (filters.order) {
    params.set('order', filters.order);
  }
  return params.toString();
}

export function useAdminProjectsList(filters: ProjectListFilters) {
  return useQuery<ProjectListResponse>({
    queryKey: projectKeys.list(filters),
    queryFn: () => {
      const query = buildListQuery(filters);
      const path = query ? `/admin/projects?${query}` : '/admin/projects';
      return apiClient<ProjectListResponse>(path);
    },
    placeholderData: keepPreviousData,
  });
}

export function useAdminProjectDetail(projectId?: string | null) {
  return useQuery({
    queryKey: projectId ? projectKeys.detail(projectId) : [...PROJECTS_ROOT, 'detail', 'empty'],
    queryFn: () => {
      if (!projectId) {
        throw new Error('projectId is required');
      }
      return apiClient<Project>(`/admin/projects/${projectId}`);
    },
    enabled: Boolean(projectId),
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      apiClient<Project>('/admin/projects', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_ROOT });
    },
  });
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateProjectInput> }) =>
      apiClient<Project>(`/admin/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_ROOT });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
    },
  });
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`/admin/projects/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_ROOT });
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
    },
  });
}

export function useProjectImagePresignMutation() {
  return useMutation({
    mutationFn: (input: { fileName: string; fileType: string; fileSize: number }) =>
      apiClient<ProjectImagePresignResponse>('/admin/projects/images/presign', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  });
}

