import {
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type {
  InvestorInternalNewsDetail,
  InvestorInternalNewsListResponse,
} from '../types/news';

const INTERNAL_NEWS_ROOT = ['investorInternalNews'] as const;

const internalNewsKeys = {
  list: (params: { page: number; limit: number }) =>
    [...INTERNAL_NEWS_ROOT, 'list', params] as const,
  detail: (id: string) => [...INTERNAL_NEWS_ROOT, 'detail', id] as const,
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export function useInvestorInternalNewsList(options?: {
  page?: number;
  limit?: number;
}) {
  const page = options?.page ?? DEFAULT_PAGE;
  const limit = options?.limit ?? DEFAULT_LIMIT;

  return useQuery<InvestorInternalNewsListResponse>({
    queryKey: internalNewsKeys.list({ page, limit }),
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      return apiClient<InvestorInternalNewsListResponse>(
        `/investor/internal-news?${params.toString()}`
      );
    },
    placeholderData: keepPreviousData,
  });
}

export function useInvestorInternalNewsDetail(newsId?: string | null) {
  return useQuery<InvestorInternalNewsDetail>({
    queryKey: newsId
      ? internalNewsKeys.detail(newsId)
      : [...INTERNAL_NEWS_ROOT, 'detail'],
    queryFn: () => {
      if (!newsId) {
        throw new Error('newsId is required');
      }
      return apiClient<InvestorInternalNewsDetail>(
        `/investor/internal-news/${newsId}`
      );
    },
    enabled: Boolean(newsId),
  });
}



