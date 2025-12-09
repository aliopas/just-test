/**
 * Hook لجلب قائمة الأخبار للإدارة مباشرة من Supabase
 * بديل لـ useAdminNewsList الذي يستخدم API backend
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type {
  AdminNewsItem,
  AdminNewsListFilters,
  AdminNewsListResponse,
  NewsStatus,
  NewsAudience,
} from '../types/news';

type NewsRow = {
  id: string;
  title: string;
  slug: string;
  body_md: string;
  cover_key: string | null;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  audience: string;
  attachments: unknown;
  category_id: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

type NewsReviewRow = {
  id: string;
  news_id: string;
  action: string;
  comment: string | null;
  reviewer_id: string | null;
  created_at: string;
};

type NewsCategoryRow = {
  id: string;
  name: string;
  slug: string;
};

type NewsAuthorRow = {
  id: string;
  email: string | null;
};

// Helper functions to convert string types to typed enums
function toNewsStatus(value: string): NewsStatus {
  const validStatuses: NewsStatus[] = [
    'draft',
    'pending_review',
    'scheduled',
    'published',
    'rejected',
    'archived',
  ];
  return validStatuses.includes(value as NewsStatus) ? (value as NewsStatus) : 'draft';
}

function toNewsAudience(value: string): NewsAudience {
  return value === 'investor_internal' ? 'investor_internal' : 'public';
}

function parseAttachments(attachments: unknown): AdminNewsItem['attachments'] {
  if (!Array.isArray(attachments)) {
    return [];
  }
  return attachments
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const record = item as Record<string, unknown>;
      return {
        id: typeof record.id === 'string' ? record.id : String(record.id || ''),
        name: typeof record.name === 'string' ? record.name : '',
        storageKey: typeof record.storageKey === 'string' ? record.storageKey : '',
        mimeType: typeof record.mimeType === 'string' ? record.mimeType : null,
        size: typeof record.size === 'number' ? record.size : null,
        type: (record.type === 'image' ? 'image' : 'document') as 'document' | 'image',
      };
    })
    .filter((item): item is AdminNewsItem['attachments'][0] => item !== null);
}

async function fetchAdminNewsListDirect(
  filters: AdminNewsListFilters
): Promise<AdminNewsListResponse> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const page = filters.page ?? 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from('news')
    .select(
      `
      id,
      title,
      slug,
      body_md,
      cover_key,
      status,
      scheduled_at,
      published_at,
      audience,
      attachments,
      category_id,
      author_id,
      created_at,
      updated_at
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.audience && filters.audience !== 'all') {
    query = query.eq('audience', filters.audience);
  }

  if (filters.search && filters.search.trim().length > 0) {
    const pattern = `%${filters.search.trim().toLowerCase()}%`;
    query = query.or(`title.ilike.${pattern},body_md.ilike.${pattern}`);
  }

  // Apply pagination
  const { data: newsRows, error: newsError, count } = await query
    .range(offset, offset + limit - 1);

  if (newsError) {
    throw new Error(`خطأ في جلب الأخبار: ${newsError.message}`);
  }

  const rows = (newsRows as NewsRow[] | null) ?? [];

  // Fetch related data in parallel
  const newsIds = rows.map((r) => r.id);
  const categoryIds = rows.map((r) => r.category_id).filter((id): id is string => id !== null);
  const authorIds = rows.map((r) => r.author_id).filter((id): id is string => id !== null);

  const [reviewsResult, categoriesResult, authorsResult] = await Promise.all([
    newsIds.length > 0
      ? supabase
          .from('news_reviews')
          .select('id, news_id, action, comment, reviewer_id, created_at')
          .in('news_id', newsIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    categoryIds.length > 0
      ? supabase
          .from('news_categories')
          .select('id, name, slug')
          .in('id', categoryIds)
      : Promise.resolve({ data: [], error: null }),
    authorIds.length > 0
      ? supabase
          .from('users')
          .select('id, email')
          .in('id', authorIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const reviews = (reviewsResult.data as NewsReviewRow[] | null) ?? [];
  const categories = (categoriesResult.data as NewsCategoryRow[] | null) ?? [];
  const authors = (authorsResult.data as NewsAuthorRow[] | null) ?? [];

  // Create lookup maps
  const reviewsByNewsId = reviews.reduce(
    (acc, review) => {
      if (!acc[review.news_id]) {
        acc[review.news_id] = [];
      }
      acc[review.news_id].push(review);
      return acc;
    },
    {} as Record<string, NewsReviewRow[]>
  );

  const categoriesById = categories.reduce(
    (acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    },
    {} as Record<string, NewsCategoryRow>
  );

  const authorsById = authors.reduce(
    (acc, author) => {
      acc[author.id] = author;
      return acc;
    },
    {} as Record<string, NewsAuthorRow>
  );

  // Transform to AdminNewsItem format
  const news: AdminNewsItem[] = rows.map((row) => {
    const category = row.category_id ? categoriesById[row.category_id] : null;
    const author = row.author_id ? authorsById[row.author_id] : null;
    const newsReviews = reviewsByNewsId[row.id] ?? [];

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      bodyMd: row.body_md,
      coverKey: row.cover_key,
      status: toNewsStatus(row.status),
      scheduledAt: row.scheduled_at,
      publishedAt: row.published_at,
      audience: toNewsAudience(row.audience),
      attachments: parseAttachments(row.attachments),
      category: category
        ? {
            id: category.id,
            name: category.name,
            slug: category.slug,
          }
        : null,
      author: author
        ? {
            id: author.id,
            email: author.email,
          }
        : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      reviews: newsReviews.map((review) => ({
        id: review.id,
        action: review.action === 'approve' ? 'approve' : 'reject',
        comment: review.comment,
        createdAt: review.created_at,
        reviewer: {
          id: review.reviewer_id,
          email: null, // Will be fetched separately if needed
        },
      })),
    };
  });

  const total = count ?? 0;
  const pageCount = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    news,
    meta: {
      page,
      limit,
      total,
      pageCount,
      hasNext: page < pageCount,
    },
  };
}

export function useAdminNewsListDirect(filters: AdminNewsListFilters) {
  const queryKey = [
    'adminNewsDirect',
    filters.page ?? 1,
    filters.status ?? 'all',
    filters.audience ?? 'all',
    filters.search ?? '',
  ] as const;

  return useQuery<AdminNewsListResponse>({
    queryKey,
    queryFn: () => fetchAdminNewsListDirect(filters),
    placeholderData: keepPreviousData,
    // Removed refetchInterval to prevent automatic page refreshes
    enabled: typeof window !== 'undefined', // Only on client
  });
}
