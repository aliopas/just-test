/**
 * Hooks محدثة للأخبار باستخدام Supabase مباشرة
 * 
 * هذه الـ hooks تحل محل useInvestorNews و useInvestorInternalNews
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useNews, useNewsById, useNewsBySlug, useNewsCount, type NewsItem } from './useSupabaseTables';
import { getStoragePublicUrl, NEWS_IMAGES_BUCKET } from '../utils/supabase-storage';
import type { InvestorInternalNewsAttachment } from '../types/news';

// Helper function to create excerpt from markdown
function createExcerpt(bodyMd: string, maxLength: number = 150): string {
  // Remove markdown syntax
  const plainText = bodyMd
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links
    .replace(/`([^`]+)`/g, '$1') // Remove code
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + '...';
}

// Helper function to parse attachments from unknown type
function parseAttachments(attachments: unknown): InvestorInternalNewsAttachment[] {
  if (!Array.isArray(attachments)) {
    return [];
  }

  return attachments
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const record = item as Record<string, unknown>;
      const id = typeof record.id === 'string' ? record.id : null;
      const name = typeof record.name === 'string' ? record.name : null;
      const storageKey = typeof record.storageKey === 'string' ? record.storageKey : null;

      if (!id || !name || !storageKey) {
        return null;
      }

      const mimeType =
        typeof record.mimeType === 'string' && record.mimeType.length > 0
          ? record.mimeType
          : null;
      const sizeRaw = record.size;
      const size =
        typeof sizeRaw === 'number' && Number.isFinite(sizeRaw) && sizeRaw >= 0
          ? Math.round(sizeRaw)
          : null;
      const type = record.type === 'image' ? 'image' : 'document';

      const downloadUrl = getStoragePublicUrl(NEWS_IMAGES_BUCKET, storageKey);

      return {
        id,
        name,
        storageKey,
        mimeType,
        size,
        type,
        downloadUrl,
      } satisfies InvestorInternalNewsAttachment;
    })
    .filter((item): item is InvestorInternalNewsAttachment => item !== null);
}

// Transform NewsItem to match InvestorNewsListResponse format
function transformNewsItem(item: NewsItem, language: 'ar' | 'en' = 'ar') {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: createExcerpt(item.body_md),
    coverKey: item.cover_key,
    coverUrl: item.cover_key ? getStoragePublicUrl(NEWS_IMAGES_BUCKET, item.cover_key) : null,
    publishedAt: item.published_at || item.created_at,
    createdAt: item.created_at,
    attachments: parseAttachments(item.attachments),
  };
}

export interface NewsListResponse {
  news: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverKey: string | null;
    coverUrl: string | null;
    publishedAt: string;
    createdAt: string;
    attachments: InvestorInternalNewsAttachment[];
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
    hasNext: boolean;
  };
}

export interface NewsDetailResponse {
  id: string;
  title: string;
  slug: string;
  bodyMd: string;
  coverKey: string | null;
  coverUrl: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

/**
 * Hook لجلب قائمة الأخبار العامة (للـ investors)
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useInvestorNewsList({ page: 1, limit: 12 });
 * ```
 */
export function useInvestorNewsList(options?: {
  page?: number;
  limit?: number;
}) {
  const page = options?.page ?? DEFAULT_PAGE;
  const limit = options?.limit ?? DEFAULT_LIMIT;

  const { data: news, isLoading, isError, error, refetch } = useNews({
    page,
    limit,
    audience: 'public',
  });

  const { data: totalCount } = useNewsCount('public');

  return useQuery<NewsListResponse>({
    queryKey: ['investorNews', 'list', { page, limit }],
    queryFn: () => {
      const transformedNews = (news || []).map(item => transformNewsItem(item));
      const total = totalCount || 0;
      const pageCount = Math.ceil(total / limit) || 0;

      return {
        news: transformedNews,
        meta: {
          page,
          limit,
          total,
          pageCount,
          hasNext: page < pageCount,
        },
      };
    },
    enabled: typeof window !== 'undefined',
    placeholderData: keepPreviousData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook لجلب تفاصيل خبر واحد
 * 
 * @example
 * ```tsx
 * const { data: news } = useInvestorNewsDetail(newsId);
 * ```
 */
export function useInvestorNewsDetail(newsId?: string | null) {
  const { data: newsItem, isLoading, isError, error } = useNewsById(newsId || '');

  return useQuery<NewsDetailResponse>({
    queryKey: ['investorNews', 'detail', newsId],
    queryFn: () => {
      if (!newsItem) {
        throw new Error('News not found');
      }

      return {
        id: newsItem.id,
        title: newsItem.title,
        slug: newsItem.slug,
        bodyMd: newsItem.body_md,
        coverKey: newsItem.cover_key,
        coverUrl: newsItem.cover_key ? getStoragePublicUrl(NEWS_IMAGES_BUCKET, newsItem.cover_key) : null,
        publishedAt: newsItem.published_at || newsItem.created_at,
        createdAt: newsItem.created_at,
        updatedAt: newsItem.updated_at,
      };
    },
    enabled: Boolean(newsId) && typeof window !== 'undefined',
  });
}

/**
 * Hook لجلب قائمة الأخبار الداخلية (للـ investors)
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useInvestorInternalNewsList({ page: 1, limit: 12 });
 * ```
 */
export function useInvestorInternalNewsList(options?: {
  page?: number;
  limit?: number;
}) {
  const page = options?.page ?? DEFAULT_PAGE;
  const limit = options?.limit ?? DEFAULT_LIMIT;

  const { data: news, isLoading, isError, error, refetch } = useNews({
    page,
    limit,
    audience: 'investor_internal',
  });

  const { data: totalCount } = useNewsCount('investor_internal');

  return useQuery<NewsListResponse>({
    queryKey: ['investorInternalNews', 'list', { page, limit }],
    queryFn: () => {
      const transformedNews = (news || []).map(item => transformNewsItem(item));
      const total = totalCount || 0;
      const pageCount = Math.ceil(total / limit) || 0;

      return {
        news: transformedNews,
        meta: {
          page,
          limit,
          total,
          pageCount,
          hasNext: page < pageCount,
        },
      };
    },
    enabled: typeof window !== 'undefined',
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
  });
}

/**
 * Hook لجلب تفاصيل خبر داخلي واحد
 */
export function useInvestorInternalNewsDetail(newsId?: string | null) {
  return useInvestorNewsDetail(newsId); // نفس الـ hook، فقط audience مختلف
}

