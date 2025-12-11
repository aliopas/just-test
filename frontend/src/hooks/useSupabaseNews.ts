/**
 * Hooks محدثة للأخبار باستخدام Supabase مباشرة
 * 
 * هذه الـ hooks تحل محل useInvestorNews و useInvestorInternalNews
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useNews, useNewsById, useNewsBySlug, useNewsCount, type NewsItem } from './useSupabaseTables';
import { getStoragePublicUrl, getStorageSignedUrl, NEWS_IMAGES_BUCKET } from '../utils/supabase-storage';
import type { InvestorInternalNewsAttachment, InvestorInternalNewsListResponse, InvestorInternalNewsDetail } from '../types/news';

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
// For internal news, attachments are stored in 'internal-news-assets' bucket
async function parseAttachments(attachments: unknown, isInternal: boolean = false): Promise<InvestorInternalNewsAttachment[]> {
  if (!Array.isArray(attachments)) {
    return [];
  }

  const INTERNAL_NEWS_BUCKET = 'internal-news-assets';
  const bucket = isInternal ? INTERNAL_NEWS_BUCKET : NEWS_IMAGES_BUCKET;

  const parsed = await Promise.all(
    attachments.map(async (item) => {
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

      // For internal news, use signed URLs (private bucket)
      // For public news, use public URLs
      let downloadUrl: string | null = null;
      try {
        if (isInternal) {
          // Internal news uses private bucket, need signed URL
          // storageKey might already include bucket name (e.g., "internal-news-assets/file.pdf")
          // or just be the path (e.g., "file.pdf")
          downloadUrl = await getStorageSignedUrl(bucket, storageKey, 3600);
        } else {
          // Public news uses public bucket
          downloadUrl = getStoragePublicUrl(bucket, storageKey);
        }
      } catch (error) {
        console.error('Error getting download URL for attachment:', error);
        downloadUrl = null;
      }

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
  );

  return parsed.filter((item): item is InvestorInternalNewsAttachment => item !== null);
}

// Transform NewsItem to match NewsListResponse format (for public news)
async function transformPublicNewsItem(item: NewsItem) {
  try {
    const attachments = await parseAttachments(item.attachments, false);
    const excerpt = createExcerpt(item.body_md);
    
    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt,
      coverKey: item.cover_key,
      coverUrl: item.cover_key ? getStoragePublicUrl(NEWS_IMAGES_BUCKET, item.cover_key) : null,
      publishedAt: item.published_at || item.created_at,
      createdAt: item.created_at,
      attachments,
    };
  } catch (error) {
    console.error('Error transforming public news item:', error);
    // Return item with empty attachments on error
    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: createExcerpt(item.body_md),
      coverKey: item.cover_key,
      coverUrl: item.cover_key ? getStoragePublicUrl(NEWS_IMAGES_BUCKET, item.cover_key) : null,
      publishedAt: item.published_at || item.created_at,
      createdAt: item.created_at,
      attachments: [],
    };
  }
}

// Transform NewsItem to match InvestorInternalNewsItem format (for internal news)
async function transformInternalNewsItem(item: NewsItem) {
  try {
    const attachments = await parseAttachments(item.attachments, true);
    const excerpt = createExcerpt(item.body_md);
    
    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: excerpt || null,
      coverKey: item.cover_key,
      publishedAt: item.published_at || item.created_at,
      attachments,
    };
  } catch (error) {
    console.error('Error transforming internal news item:', error);
    // Return item with empty attachments on error
    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: createExcerpt(item.body_md) || null,
      coverKey: item.cover_key,
      publishedAt: item.published_at || item.created_at,
      attachments: [],
    };
  }
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
    queryFn: async () => {
      if (!news || news.length === 0) {
        const total = totalCount || 0;
        const pageCount = Math.ceil(total / limit) || 0;
        return {
          news: [],
          meta: {
            page,
            limit,
            total,
            pageCount,
            hasNext: page < pageCount,
          },
        };
      }

      const transformedNews = await Promise.all(
        news.map(item => transformPublicNewsItem(item))
      );
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
    enabled: typeof window !== 'undefined' && news !== undefined,
    placeholderData: keepPreviousData,
    // Removed refetchInterval to prevent automatic page refreshes
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
  showAll?: boolean; // New option to show all news regardless of audience
}) {
  const page = options?.page ?? DEFAULT_PAGE;
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const showAll = options?.showAll ?? false;

  // If showAll is true, don't filter by audience
  const { data: news, isLoading: isLoadingNews, isError: isErrorNews, error: errorNews, refetch: refetchNews } = useNews({
    page,
    limit,
    audience: showAll ? undefined : 'investor_internal',
  });

  // If showAll is true, count all published news
  const { data: totalCount, isLoading: isLoadingCount } = useNewsCount(showAll ? undefined : 'investor_internal');

  const queryResult = useQuery<InvestorInternalNewsListResponse>({
    queryKey: ['investorInternalNews', 'list', { page, limit, showAll }],
    queryFn: async () => {
      // Handle case when data is still loading or not available
      if (news === undefined || totalCount === undefined) {
        // Return empty result while loading
        return {
          news: [],
          meta: {
            page,
            limit,
            total: 0,
            pageCount: 0,
            hasNext: false,
          },
        };
      }

      if (!news || news.length === 0) {
        const total = totalCount || 0;
        const pageCount = Math.ceil(total / limit) || 0;
        return {
          news: [],
          meta: {
            page,
            limit,
            total,
            pageCount,
            hasNext: page < pageCount,
          },
        };
      }

      const transformedNews = await Promise.all(
        news.map(item => transformInternalNewsItem(item))
      );
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
    // Removed refetchInterval to prevent automatic page refreshes
  });

  // Combine loading and error states from both hooks
  return {
    ...queryResult,
    isLoading: queryResult.isLoading || isLoadingNews || isLoadingCount,
    isError: queryResult.isError || isErrorNews,
    error: queryResult.error || errorNews,
    refetch: () => {
      refetchNews();
      return queryResult.refetch();
    },
  };
}

/**
 * Hook لجلب تفاصيل خبر داخلي واحد
 */
export function useInvestorInternalNewsDetail(newsId?: string | null) {
  const { data: newsItem, isLoading, isError, error } = useNewsById(newsId || '');

  return useQuery<InvestorInternalNewsDetail>({
    queryKey: ['investorInternalNews', 'detail', newsId],
    queryFn: async () => {
      if (!newsItem) {
        throw new Error('News not found');
      }

      // Parse attachments for internal news
      const attachments = await parseAttachments(newsItem.attachments, true);

      // Get cover URL if cover_key exists
      let coverUrl: string | null = null;
      if (newsItem.cover_key) {
        try {
          // For internal news, cover images might be in news-covers bucket (public) or internal-news-assets (private)
          // Try public first, then signed URL if needed
          coverUrl = getStoragePublicUrl(NEWS_IMAGES_BUCKET, newsItem.cover_key);
        } catch (error) {
          console.warn('Failed to get cover URL:', error);
        }
      }

      return {
        id: newsItem.id,
        title: newsItem.title,
        slug: newsItem.slug,
        bodyMd: newsItem.body_md,
        coverKey: newsItem.cover_key,
        publishedAt: newsItem.published_at || newsItem.created_at,
        createdAt: newsItem.created_at,
        updatedAt: newsItem.updated_at,
        attachments,
      };
    },
    enabled: Boolean(newsId) && typeof window !== 'undefined',
  });
}

