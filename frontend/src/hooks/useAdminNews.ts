import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type {
  AdminNewsItem,
  AdminNewsListFilters,
  AdminNewsListResponse,
  NewsImagePresignResponse,
  NewsAttachmentPresignResponse,
  NewsStatus,
  AdminNewsReview,
  NewsAttachment,
  NewsAudience,
} from '../types/news';

const NEWS_ROOT = ['adminNews'] as const;

const newsKeys = {
  list: (filters: AdminNewsListFilters) => [...NEWS_ROOT, 'list', filters] as const,
  detail: (id: string) => [...NEWS_ROOT, 'detail', id] as const,
};

const DEFAULT_LIMIT = 10;

function buildListQuery(filters: AdminNewsListFilters) {
  const params = new URLSearchParams();
  params.set('page', String(filters.page ?? 1));
  params.set('limit', String(DEFAULT_LIMIT));
  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status);
  }
  if (filters.audience && filters.audience !== 'all') {
    params.set('audience', filters.audience);
  }
  if (filters.search && filters.search.trim().length > 0) {
    params.set('search', filters.search.trim());
  }
  return params.toString();
}

export function useAdminNewsList(filters: AdminNewsListFilters) {
  return useQuery<AdminNewsListResponse>({
    queryKey: newsKeys.list(filters),
    queryFn: () => {
      const query = buildListQuery(filters);
      const path = query ? `/admin/news?${query}` : '/admin/news';
      return apiClient<AdminNewsListResponse>(path);
    },
    placeholderData: keepPreviousData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useAdminNewsDetail(newsId?: string | null) {
  return useQuery({
    queryKey: newsId ? newsKeys.detail(newsId) : [...NEWS_ROOT, 'detail', 'empty'],
    queryFn: () => {
      if (!newsId) {
        throw new Error('newsId is required');
      }
      return apiClient<AdminNewsItem>(`/admin/news/${newsId}`);
    },
    enabled: Boolean(newsId),
  });
}

type NewsMutationInput = {
  title: string;
  slug: string;
  bodyMd: string;
  status: NewsStatus;
  coverKey: string | null;
  audience: NewsAudience;
  attachments: NewsAttachment[];
  scheduledAt?: string | null;
  publishedAt?: string | null;
};

export function useCreateNewsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewsMutationInput) =>
      apiClient<AdminNewsItem>('/admin/news', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NEWS_ROOT });
    },
  });
}

export function useUpdateNewsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<NewsMutationInput> }) =>
      apiClient<AdminNewsItem>(`/admin/news/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: NEWS_ROOT });
      queryClient.invalidateQueries({ queryKey: newsKeys.detail(variables.id) });
    },
  });
}

export function useDeleteNewsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`/admin/news/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: NEWS_ROOT });
      queryClient.removeQueries({ queryKey: newsKeys.detail(id) });
    },
  });
}

export function usePublishScheduledMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient<{ count: number; items: AdminNewsItem[] }>('/admin/news/publish-scheduled', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NEWS_ROOT });
    },
  });
}

export function useNewsImagePresignMutation() {
  return useMutation({
    mutationFn: (input: { fileName: string; fileType: string; fileSize: number }) =>
      apiClient<NewsImagePresignResponse>('/admin/news/images/presign', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  });
}

export function useNewsAttachmentPresignMutation() {
  return useMutation({
    mutationFn: (input: { fileName: string; fileType: string; fileSize: number }) =>
      apiClient<NewsAttachmentPresignResponse>('/admin/news/attachments/presign', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  });
}

type ApproveVariables = {
  id: string;
  comment?: string;
};

type RejectVariables = {
  id: string;
  comment: string;
};

type ReviewResponse = {
  news: AdminNewsItem;
  review: AdminNewsReview;
};

export function useApproveNewsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: ApproveVariables) => {
      const payload = comment && comment.trim().length > 0 ? { comment } : {};
      return apiClient<ReviewResponse>(`/admin/news/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: NEWS_ROOT });
      queryClient.invalidateQueries({ queryKey: newsKeys.detail(variables.id) });
    },
  });
}

export function useRejectNewsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: RejectVariables) =>
      apiClient<ReviewResponse>(`/admin/news/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ comment }),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: NEWS_ROOT });
      queryClient.invalidateQueries({ queryKey: newsKeys.detail(variables.id) });
    },
  });
}


