import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type { Project, ProjectListResponse } from './useAdminProjects';

const PUBLIC_PROJECTS_ROOT = ['publicProjects'] as const;

export function usePublicProjects() {
  return useQuery<ProjectListResponse>({
    queryKey: [...PUBLIC_PROJECTS_ROOT, 'list'],
    queryFn: () => {
      return apiClient<ProjectListResponse>('/public/projects', {
        auth: false,
      });
    },
  });
}

