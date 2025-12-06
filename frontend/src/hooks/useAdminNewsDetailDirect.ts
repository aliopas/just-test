/**
 * Hook لجلب تفاصيل خبر للإدارة مباشرة من Supabase
 * بديل لـ useAdminNewsDetail الذي يستخدم API backend
 */

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type { AdminNewsItem } from '../types/news';
import type { NewsStatus } from '../types/news';

type NewsRow = {
  id: string;
  title: string;
  slug: string;
  body_md: string;
  status: string;
  cover_key: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  author_id: string | null;
  category_id: string | null;
  created_at: string;
  updated_at: string;
};

type ReviewRow = {
  id: string;
  news_id: string;
  reviewer_id: string;
  action: string;
  comment: string | null;
  created_at: string;
};

function toNewsStatus(value: string): NewsStatus {
  const validStatuses: NewsStatus[] = [
    'draft',
    'pending_review',
    'scheduled',
    'published',
    'rejected',
  ];
  return validStatuses.includes(value as NewsStatus) ? (value as NewsStatus) : 'draft';
}

async function fetchAdminNewsDetailDirect(newsId: string): Promise<AdminNewsItem> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // Fetch news
  const { data: news, error: newsError } = await supabase
    .from('news')
    .select('*')
    .eq('id', newsId)
    .single<NewsRow>();

  if (newsError) {
    throw new Error(`خطأ في جلب الخبر: ${newsError.message}`);
  }

  if (!news) {
    throw new Error('الخبر غير موجود');
  }

  // Fetch related data in parallel
  const [authorResult, categoryResult, reviewsResult] = await Promise.all([
    news.author_id
      ? supabase
          .from('users')
          .select('id, email')
          .eq('id', news.author_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    news.category_id
      ? supabase
          .from('news_categories')
          .select('id, name, slug')
          .eq('id', news.category_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from('news_reviews')
      .select('*')
      .eq('news_id', newsId)
      .order('created_at', { ascending: false }),
  ]);

  const author = authorResult.data;
  const category = categoryResult.data;
  const reviews = (reviewsResult.data as ReviewRow[] | null) ?? [];

  // Fetch reviewers for reviews
  const reviewerIds = [...new Set(reviews.map((r) => r.reviewer_id))];
  let reviewers: Array<{ id: string; email: string | null }> = [];

  if (reviewerIds.length > 0) {
    const { data: reviewersData } = await supabase
      .from('users')
      .select('id, email')
      .in('id', reviewerIds);

    reviewers = (reviewersData as Array<{ id: string; email: string | null }> | null) ?? [];
  }

  const reviewersMap = reviewers.reduce(
    (acc, reviewer) => {
      acc[reviewer.id] = reviewer;
      return acc;
    },
    {} as Record<string, { id: string; email: string | null }>
  );

  // Note: audience and attachments might be stored in metadata or separate table
  // For now, we'll use defaults
  return {
    id: news.id,
    title: news.title,
    slug: news.slug,
    bodyMd: news.body_md,
    status: toNewsStatus(news.status),
    coverKey: news.cover_key,
    audience: 'public', // Default - might need to fetch from metadata
    attachments: [], // Default - might need to fetch from separate table
    scheduledAt: news.scheduled_at,
    publishedAt: news.published_at,
    createdAt: news.created_at,
    updatedAt: news.updated_at,
    author: author
      ? {
          id: author.id,
          email: author.email,
        }
      : null,
    category: category
      ? {
          id: category.id,
          name: category.name,
          slug: category.slug,
        }
      : null,
    reviews: reviews.map((r) => {
      const reviewer = reviewersMap[r.reviewer_id];
      return {
        id: r.id,
        action: r.action as 'approve' | 'reject',
        comment: r.comment,
        createdAt: r.created_at,
        reviewer: reviewer
          ? {
              id: reviewer.id,
              email: reviewer.email,
            }
          : {
              id: null,
              email: null,
            },
      };
    }),
  };
}

export function useAdminNewsDetailDirect(newsId?: string | null) {
  return useQuery({
    queryKey: ['adminNewsDetailDirect', newsId],
    queryFn: () => {
      if (!newsId) {
        throw new Error('newsId is required');
      }
      return fetchAdminNewsDetailDirect(newsId);
    },
    enabled: Boolean(newsId),
  });
}
