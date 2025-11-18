import {
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type {
  InvestorNewsDetail,
  InvestorNewsListResponse,
} from '../types/news';

const NEWS_ROOT = ['investorNews'] as const;

const newsKeys = {
  list: (params: { page: number; limit: number }) =>
    [...NEWS_ROOT, 'list', params] as const,
  detail: (id: string) => [...NEWS_ROOT, 'detail', id] as const,
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

export function useInvestorNewsList(options?: {
  page?: number;
  limit?: number;
}) {
  const page = options?.page ?? DEFAULT_PAGE;
  const limit = options?.limit ?? DEFAULT_LIMIT;

  return useQuery<InvestorNewsListResponse>({
    queryKey: newsKeys.list({ page, limit }),
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      return apiClient<InvestorNewsListResponse>(`/news?${params.toString()}`, {
        auth: false,
      });
    },
    placeholderData: keepPreviousData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useInvestorNewsDetail(newsId?: string | null) {
  return useQuery<InvestorNewsDetail>({
    queryKey: newsId ? newsKeys.detail(newsId) : [...NEWS_ROOT, 'detail'],
    queryFn: () => {
      if (!newsId) {
        throw new Error('newsId is required');
      }
      return apiClient<InvestorNewsDetail>(`/news/${newsId}`, {
        auth: false,
      });
    },
    enabled: Boolean(newsId),
  });
}


