/**
 * Hooks لعمليات News (Create, Update, Delete, Approve, Reject) مباشرة من Supabase
 * بديل لـ useAdminNews mutations التي تستخدم API backend
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type {
  AdminNewsItem,
  NewsStatus,
  NewsAudience,
  NewsAttachment,
  AdminNewsReview,
} from '../types/news';

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
  categoryId?: string | null;
};

// Helper functions
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

function toNewsAudience(value: string): NewsAudience {
  const validAudiences: NewsAudience[] = ['public', 'investor_internal'];
  return validAudiences.includes(value as NewsAudience) ? (value as NewsAudience) : 'public';
}

// Create News
async function createNewsDirect(input: NewsMutationInput): Promise<AdminNewsItem> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('يجب تسجيل الدخول لإنشاء خبر');
  }

  const authorId = authData.user.id;

  // Insert news
  const { data: news, error: newsError } = await supabase
    .from('news')
    .insert({
      title: input.title,
      slug: input.slug,
      body_md: input.bodyMd,
      cover_key: input.coverKey,
      status: input.status,
      scheduled_at: input.scheduledAt || null,
      published_at: input.publishedAt || null,
      author_id: authorId,
      category_id: input.categoryId || null,
    })
    .select('*')
    .single();

  if (newsError) {
    throw new Error(`خطأ في إنشاء الخبر: ${newsError.message}`);
  }

  if (!news) {
    throw new Error('فشل إنشاء الخبر');
  }

  // Handle attachments if provided
  if (input.attachments && input.attachments.length > 0) {
    // Attachments are stored in metadata or separate table
    // For now, we'll store them in the news metadata or handle separately
  }

  // Transform to AdminNewsItem format
  return {
    id: news.id,
    title: news.title,
    slug: news.slug,
    bodyMd: news.body_md,
    status: toNewsStatus(news.status),
    coverKey: news.cover_key,
    audience: input.audience, // This might need to be stored separately
    attachments: input.attachments || [],
    scheduledAt: news.scheduled_at,
    publishedAt: news.published_at,
    createdAt: news.created_at,
    updatedAt: news.updated_at,
    author: {
      id: authorId,
      email: authData.user.email || null,
    },
    category: null, // Will be fetched separately if needed
    reviews: [],
  };
}

// Update News
async function updateNewsDirect({
  id,
  input,
}: {
  id: string;
  input: Partial<NewsMutationInput>;
}): Promise<AdminNewsItem> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.bodyMd !== undefined) updateData.body_md = input.bodyMd;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.coverKey !== undefined) updateData.cover_key = input.coverKey;
  if (input.scheduledAt !== undefined) updateData.scheduled_at = input.scheduledAt;
  if (input.publishedAt !== undefined) updateData.published_at = input.publishedAt;
  if (input.categoryId !== undefined) updateData.category_id = input.categoryId;

  const { data: news, error: newsError } = await supabase
    .from('news')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (newsError) {
    throw new Error(`خطأ في تحديث الخبر: ${newsError.message}`);
  }

  if (!news) {
    throw new Error('الخبر غير موجود');
  }

  // Fetch related data
  const [authorResult, categoryResult, reviewsResult] = await Promise.all([
    supabase
      .from('users')
      .select('id, email')
      .eq('id', news.author_id)
      .maybeSingle(),
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
      .eq('news_id', id)
      .order('created_at', { ascending: false }),
  ]);

  const author = authorResult.data;
  const category = categoryResult.data;
  const reviews = (reviewsResult.data as any[]) ?? [];

  // Fetch reviewers for reviews
  const reviewerIds = [...new Set(reviews.map((r) => r.reviewer_id).filter(Boolean))];
  let reviewers: Array<{ id: string; email: string | null }> = [];
  
  if (reviewerIds.length > 0) {
    const { data: reviewersData } = await supabase
      .from('users')
      .select('id, email')
      .in('id', reviewerIds);
    
    reviewers = (reviewersData as Array<{ id: string; email: string | null }>) ?? [];
  }

  const reviewersMap = reviewers.reduce(
    (acc, reviewer) => {
      acc[reviewer.id] = reviewer;
      return acc;
    },
    {} as Record<string, { id: string; email: string | null }>
  );

  // Transform to AdminNewsItem
  return {
    id: news.id,
    title: news.title,
    slug: news.slug,
    bodyMd: news.body_md,
    status: toNewsStatus(news.status),
    coverKey: news.cover_key,
    audience: input.audience || 'public', // Default or from existing
    attachments: input.attachments || [],
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
      const reviewer = r.reviewer_id ? reviewersMap[r.reviewer_id] : null;
      return {
      id: r.id,
      action: r.action,
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

// Delete News
async function deleteNewsDirect(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const { error } = await supabase.from('news').delete().eq('id', id);

  if (error) {
    throw new Error(`خطأ في حذف الخبر: ${error.message}`);
  }
}

// Approve News
async function approveNewsDirect({
  id,
  comment,
}: {
  id: string;
  comment?: string;
}): Promise<{ news: AdminNewsItem; review: AdminNewsReview }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('يجب تسجيل الدخول للموافقة على الخبر');
  }

  const reviewerId = authData.user.id;

  // Create review record
  const { data: review, error: reviewError } = await supabase
    .from('news_reviews')
    .insert({
      news_id: id,
      reviewer_id: reviewerId,
      action: 'approve',
      comment: comment || null,
    })
    .select('*')
    .single();

  if (reviewError) {
    throw new Error(`خطأ في إنشاء سجل المراجعة: ${reviewError.message}`);
  }

  // Update news status to published
  const { data: news, error: newsError } = await supabase
    .from('news')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (newsError) {
    throw new Error(`خطأ في تحديث حالة الخبر: ${newsError.message}`);
  }

  // Fetch full news item
  const newsItem = await updateNewsDirect({ id, input: {} });

  // Fetch reviewer info
  const { data: reviewerData } = await supabase
    .from('users')
    .select('id, email')
    .eq('id', reviewerId)
    .maybeSingle();

  return {
    news: newsItem,
    review: {
      id: review.id,
      action: review.action,
      comment: review.comment,
      createdAt: review.created_at,
      reviewer: reviewerData
        ? {
            id: reviewerData.id,
            email: reviewerData.email,
          }
        : {
            id: null,
            email: null,
          },
    },
  };
}

// Reject News
async function rejectNewsDirect({
  id,
  comment,
}: {
  id: string;
  comment: string;
}): Promise<{ news: AdminNewsItem; review: AdminNewsReview }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('يجب تسجيل الدخول لرفض الخبر');
  }

  const reviewerId = authData.user.id;

  // Create review record
  const { data: review, error: reviewError } = await supabase
    .from('news_reviews')
    .insert({
      news_id: id,
      reviewer_id: reviewerId,
      action: 'reject',
      comment: comment,
    })
    .select('*')
    .single();

  if (reviewError) {
    throw new Error(`خطأ في إنشاء سجل المراجعة: ${reviewError.message}`);
  }

  // Update news status to rejected
  const { data: news, error: newsError } = await supabase
    .from('news')
    .update({
      status: 'rejected',
    })
    .eq('id', id)
    .select('*')
    .single();

  if (newsError) {
    throw new Error(`خطأ في تحديث حالة الخبر: ${newsError.message}`);
  }

  // Fetch full news item
  const newsItem = await updateNewsDirect({ id, input: {} });

  // Fetch reviewer info
  const { data: reviewerData } = await supabase
    .from('users')
    .select('id, email')
    .eq('id', reviewerId)
    .maybeSingle();

  return {
    news: newsItem,
    review: {
      id: review.id,
      action: review.action,
      comment: review.comment,
      createdAt: review.created_at,
      reviewer: reviewerData
        ? {
            id: reviewerData.id,
            email: reviewerData.email,
          }
        : {
            id: null,
            email: null,
          },
    },
  };
}

// Publish Scheduled News
async function publishScheduledNewsDirect(): Promise<{
  count: number;
  items: AdminNewsItem[];
}> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const now = new Date().toISOString();

  // Find scheduled news that should be published
  const { data: scheduledNews, error: fetchError } = await supabase
    .from('news')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_at', now);

  if (fetchError) {
    throw new Error(`خطأ في جلب الأخبار المجدولة: ${fetchError.message}`);
  }

  if (!scheduledNews || scheduledNews.length === 0) {
    return { count: 0, items: [] };
  }

  // Update all scheduled news to published
  const newsIds = scheduledNews.map((n) => n.id);
  const { error: updateError } = await supabase
    .from('news')
    .update({
      status: 'published',
      published_at: now,
    })
    .in('id', newsIds);

  if (updateError) {
    throw new Error(`خطأ في نشر الأخبار المجدولة: ${updateError.message}`);
  }

  // Transform to AdminNewsItem format
  const items: AdminNewsItem[] = scheduledNews.map((news) => ({
    id: news.id,
    title: news.title,
    slug: news.slug,
    bodyMd: news.body_md,
    status: 'published' as NewsStatus,
    coverKey: news.cover_key,
    audience: 'public' as NewsAudience,
    attachments: [],
    scheduledAt: news.scheduled_at,
    publishedAt: now,
    createdAt: news.created_at,
    updatedAt: news.updated_at,
    author: null,
    category: null,
    reviews: [],
  }));

  return {
    count: items.length,
    items,
  };
}

// Hooks
const NEWS_ROOT = ['adminNewsDirect'] as const;

export function useCreateNewsMutationDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNewsDirect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNewsListDirect'] });
      queryClient.invalidateQueries({ queryKey: NEWS_ROOT });
    },
  });
}

export function useUpdateNewsMutationDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNewsDirect,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminNewsListDirect'] });
      queryClient.invalidateQueries({ queryKey: NEWS_ROOT });
      queryClient.invalidateQueries({ queryKey: ['adminNewsDetailDirect', variables.id] });
    },
  });
}

export function useDeleteNewsMutationDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNewsDirect,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['adminNewsListDirect'] });
      queryClient.invalidateQueries({ queryKey: NEWS_ROOT });
      queryClient.removeQueries({ queryKey: ['adminNewsDetailDirect', id] });
    },
  });
}

export function useApproveNewsMutationDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveNewsDirect,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminNewsListDirect'] });
      queryClient.invalidateQueries({ queryKey: NEWS_ROOT });
      queryClient.invalidateQueries({ queryKey: ['adminNewsDetailDirect', variables.id] });
    },
  });
}

export function useRejectNewsMutationDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectNewsDirect,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminNewsListDirect'] });
      queryClient.invalidateQueries({ queryKey: NEWS_ROOT });
      queryClient.invalidateQueries({ queryKey: ['adminNewsDetailDirect', variables.id] });
    },
  });
}

export function usePublishScheduledMutationDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishScheduledNewsDirect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNewsListDirect'] });
      queryClient.invalidateQueries({ queryKey: NEWS_ROOT });
    },
  });
}
