import { randomUUID } from 'crypto';
import path from 'path';
import { requireSupabaseAdmin } from '../lib/supabase';
import {
  notifyAuthorOfNewsApproval,
  notifyAuthorOfNewsRejection,
  notifyInvestorsOfPublishedNews,
} from './notification.service';
import type {
  NewsCreateInput,
  NewsListQuery,
  NewsStatus,
  NewsUpdateInput,
  NewsImagePresignInput,
  NewsApproveInput,
  NewsRejectInput,
  NewsPublishInput,
  NewsAudience,
  NewsAttachment,
  NewsAttachmentPresignInput,
} from '../schemas/news.schema';
import type { PublicNewsListQuery } from '../schemas/public-news.schema';

type MaybeArray<T> = T | T[] | null | undefined;

type NewsReviewRow = {
  id: string;
  action: 'approve' | 'reject';
  comment: string | null;
  created_at: string;
  reviewer?: MaybeArray<{
    id: string | null;
    email: string | null;
  }>;
};

type NewsRow = {
  id: string;
  title: string;
  slug: string;
  body_md: string;
  cover_key: string | null;
  category_id: string | null;
  status: NewsStatus;
  scheduled_at: string | null;
  published_at: string | null;
  author_id: string | null;
  audience: NewsAudience;
  attachments: unknown;
  created_at: string;
  updated_at: string;
  category?: MaybeArray<{
    id: string;
    name: string;
    slug: string;
  }>;
  author?: MaybeArray<{
    id: string;
    email: string | null;
  }>;
  reviews?: MaybeArray<NewsReviewRow>;
};

export type NewsReview = {
  id: string;
  action: 'approve' | 'reject';
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: string | null;
    email: string | null;
  };
};

export type NewsItem = {
  id: string;
  title: string;
  slug: string;
  bodyMd: string;
  coverKey: string | null;
  status: NewsStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  audience: NewsAudience;
  attachments: NewsAttachment[];
  category: { id: string; name: string; slug: string } | null;
  author: { id: string; email: string | null } | null;
  createdAt: string;
  updatedAt: string;
  reviews: NewsReview[];
};

export type NewsListResult = {
  news: NewsItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
    hasNext: boolean;
  };
};

function firstOrNull<T>(value: MaybeArray<T>): T | null {
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function arrayFromMaybe<T>(value: MaybeArray<T>): T[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? (value.filter(Boolean) as T[]) : [value];
}

function sanitizeNewsAttachments(value: unknown): NewsAttachment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const record = item as Record<string, unknown>;
      const id = typeof record.id === 'string' ? record.id : null;
      const name = typeof record.name === 'string' ? record.name : null;
      const storageKey =
        typeof record.storageKey === 'string' ? record.storageKey : null;

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

      return {
        id,
        name,
        storageKey,
        mimeType,
        size,
        type,
      } satisfies NewsAttachment;
    })
    .filter(Boolean) as NewsAttachment[];
}

function mapNewsReview(row: NewsReviewRow): NewsReview {
  const reviewer = firstOrNull(row.reviewer ?? null);
  return {
    id: row.id,
    action: row.action,
    comment: row.comment,
    createdAt: row.created_at,
    reviewer: {
      id: reviewer?.id ?? null,
      email: reviewer?.email ?? null,
    },
  };
}

function mapNewsRow(row: NewsRow): NewsItem {
  const category = firstOrNull(row.category ?? null);
  const author = firstOrNull(row.author ?? null);
  const reviews = arrayFromMaybe(row.reviews ?? null).map(mapNewsReview);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    bodyMd: row.body_md,
    coverKey: row.cover_key,
    status: row.status,
    scheduledAt: row.scheduled_at,
    publishedAt: row.published_at,
    audience: row.audience,
    attachments: sanitizeNewsAttachments(row.attachments),
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
    reviews,
  };
}

function createExcerpt(markdown: string, limit = 240): string | null {
  if (!markdown) {
    return null;
  }

  const plain = markdown
    .replace(/[#!>*_`~-]+/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  if (!plain) {
    return null;
  }

  if (plain.length <= limit) {
    return plain;
  }

  return `${plain.slice(0, limit).trimEnd()}…`;
}

function mapPublicNewsRow(row: {
  id: string;
  title: string;
  slug: string;
  body_md: string;
  cover_key: string | null;
  published_at: string | null;
  created_at: string;
}): PublicNewsItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: createExcerpt(row.body_md),
    coverKey: row.cover_key,
    publishedAt: row.published_at ?? row.created_at,
  };
}

const REVIEW_COMMENT_MAX_LENGTH = 2000;

function sanitizeReviewComment(comment?: string | null): string | null {
  if (!comment) {
    return null;
  }
  const trimmed = comment.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.length > REVIEW_COMMENT_MAX_LENGTH) {
    return trimmed.slice(0, REVIEW_COMMENT_MAX_LENGTH);
  }
  return trimmed;
}

async function insertNewsReview(params: {
  newsId: string;
  reviewerId: string;
  action: 'approve' | 'reject';
  comment: string | null;
  createdAt: string;
}): Promise<NewsReview> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('news_reviews')
    .insert({
      news_id: params.newsId,
      reviewer_id: params.reviewerId,
      action: params.action,
      comment: params.comment,
      created_at: params.createdAt,
    })
    .select(
      `
        id,
        action,
        comment,
        created_at,
        reviewer:users!news_reviews_reviewer_id_fkey (
          id,
          email
        )
      `
    )
    .single<NewsReviewRow>();

  if (error || !data) {
    throw new Error(
      `Failed to record news review: ${error?.message ?? 'unknown error'}`
    );
  }

  return mapNewsReview(data);
}

async function logNewsAudit(params: {
  actorId: string;
  newsId: string;
  action: string;
  diff: Record<string, { before: unknown; after: unknown }>;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const adminClient = requireSupabaseAdmin();
  const { error } = await adminClient.from('audit_logs').insert({
    actor_id: params.actorId,
    action: params.action,
    target_type: 'news',
    target_id: params.newsId,
    diff: params.diff,
    ip_address: params.ipAddress ?? null,
    user_agent: params.userAgent ?? null,
  });

  if (error) {
    console.error('Failed to write audit log for news review:', error);
  }
}

function escapeLikePattern(input: string): string {
  return input.replace(/[%_]/g, match => `\\${match}`);
}

function buildNewsSelect(options: { includeReviews?: boolean } = {}) {
  let select = `
    id,
    title,
    slug,
    body_md,
    cover_key,
    audience,
    attachments,
    status,
    scheduled_at,
    published_at,
    author_id,
    category_id,
    created_at,
    updated_at,
    category:news_categories!news_category_id_fkey (
      id,
      name,
      slug
    ),
    author:users!news_author_id_fkey (
      id,
      email
    )
  `;

  if (options.includeReviews) {
    select += `,
    reviews:news_reviews!news_reviews_news_id_fkey (
      id,
      action,
      comment,
      created_at,
      reviewer:users!news_reviews_reviewer_id_fkey (
        id,
        email
      )
    )
  `;
  }

  return select;
}

const NEWS_IMAGES_BUCKET =
  process.env.NEWS_IMAGES_BUCKET?.trim() || 'news-images';

function resolveNewsImagePath(
  input: NewsImagePresignInput,
  now: Date = new Date()
): string {
  const extension = path.extname(input.fileName).toLowerCase();
  const safeVariant = input.variant ?? 'cover';
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const uuid = randomUUID();
  return `${safeVariant}/${year}/${month}/${uuid}${extension}`;
}

const INTERNAL_NEWS_BUCKET =
  process.env.INTERNAL_NEWS_BUCKET?.trim() || 'internal-news-assets';

function resolveInternalNewsAttachmentPath(
  fileName: string,
  now: Date = new Date()
): { objectPath: string; storageKey: string } {
  const extension = path.extname(fileName).toLowerCase();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const uuid = randomUUID();
  const objectPath = `attachments/${year}/${month}/${uuid}${extension}`;
  const storageKey = `${INTERNAL_NEWS_BUCKET}/${objectPath}`;
  return { objectPath, storageKey };
}

async function createSignedAttachmentDownloadUrl(
  storageKey: string
): Promise<string | null> {
  try {
    const [bucket, ...pathParts] = storageKey.split('/');
    if (!bucket || pathParts.length === 0) {
      return null;
    }

    const path = pathParts.join('/');
    const adminClient = requireSupabaseAdmin();
    const { data, error } = await adminClient.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60);

    if (error || !data?.signedUrl) {
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    void error;
    return null;
  }
}

async function enrichAttachmentsWithSignedUrls(
  attachments: NewsAttachment[]
): Promise<InvestorInternalNewsAttachment[]> {
  if (attachments.length === 0) {
    return [];
  }

  const enriched = await Promise.all(
    attachments.map(async attachment => ({
      ...attachment,
      downloadUrl: await createSignedAttachmentDownloadUrl(
        attachment.storageKey
      ),
    }))
  );

  return enriched;
}

export type NewsImagePresignResult = {
  bucket: string;
  storageKey: string;
  uploadUrl: string;
  token: string | null;
  headers: Record<string, string>;
  path: string;
};

export type NewsAttachmentPresignResult = {
  attachmentId: string;
  bucket: string;
  storageKey: string;
  uploadUrl: string;
  token: string | null;
  headers: Record<string, string>;
  path: string;
};

export type PublicNewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverKey: string | null;
  publishedAt: string;
};

export type PublicNewsListResult = {
  news: PublicNewsItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
    hasNext: boolean;
  };
};

export type PublicNewsDetail = {
  id: string;
  title: string;
  slug: string;
  bodyMd: string;
  coverKey: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type InvestorInternalNewsAttachment = NewsAttachment & {
  downloadUrl: string | null;
};

export type InvestorInternalNewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverKey: string | null;
  publishedAt: string;
  attachments: InvestorInternalNewsAttachment[];
};

export type InvestorInternalNewsListResult = {
  news: InvestorInternalNewsItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
    hasNext: boolean;
  };
};

export type InvestorInternalNewsDetail = {
  id: string;
  title: string;
  slug: string;
  bodyMd: string;
  coverKey: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  attachments: InvestorInternalNewsAttachment[];
};

export async function createNews(params: {
  authorId: string | null;
  input: NewsCreateInput;
}): Promise<NewsItem> {
  const adminClient = requireSupabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await adminClient
    .from('news')
    .insert({
      title: params.input.title,
      slug: params.input.slug,
      body_md: params.input.bodyMd,
      cover_key: params.input.coverKey ?? null,
      audience: params.input.audience ?? 'public',
      attachments: params.input.attachments ?? [],
      category_id: params.input.categoryId ?? null,
      status: params.input.status ?? 'draft',
      scheduled_at: params.input.scheduledAt ?? null,
      published_at: params.input.publishedAt ?? null,
      author_id: params.authorId,
      created_at: now,
      updated_at: now,
    })
    .select(buildNewsSelect())
    .single<NewsRow>();

  if (error) {
    if (error.code === '23505') {
      throw new Error('NEWS_SLUG_EXISTS');
    }
    throw new Error(`Failed to create news: ${error.message}`);
  }

  if (!data) {
    throw new Error('NEWS_CREATE_FAILED');
  }

  return mapNewsRow(data);
}

export async function listNews(query: NewsListQuery): Promise<NewsListResult> {
  const adminClient = requireSupabaseAdmin();
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let builder = adminClient
    .from('news')
    .select(buildNewsSelect(), { count: 'exact' });

  if (query.status) {
    builder = builder.eq('status', query.status);
  }

  if (query.audience) {
    builder = builder.eq('audience', query.audience);
  }

  if (query.categoryId) {
    builder = builder.eq('category_id', query.categoryId);
  }

  if (query.search && query.search.trim().length > 0) {
    const pattern = escapeLikePattern(query.search.trim());
    builder = builder.or(`title.ilike.%${pattern}%,slug.ilike.%${pattern}%`);
  }

  const sortBy = query.sortBy ?? 'created_at';
  const order = query.order ?? 'desc';

  const { data, error, count } = await builder
    .order(sortBy, { ascending: order === 'asc' })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to list news: ${error.message}`);
  }

  const total = count ?? 0;
  const pageCount = Math.ceil(total / limit) || 0;
  const hasNext = page < pageCount;

  const rows = (data ?? []) as unknown as NewsRow[];
  const news = rows.map(row => mapNewsRow(row));

  return {
    news,
    meta: {
      page,
      limit,
      total,
      pageCount,
      hasNext,
    },
  };
}

export async function getNewsById(id: string): Promise<NewsItem> {
  const adminClient = requireSupabaseAdmin();

  const { data, error } = await adminClient
    .from('news')
    .select(buildNewsSelect({ includeReviews: true }))
    .eq('id', id)
    .single<NewsRow>();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('NEWS_NOT_FOUND');
    }
    throw new Error(`Failed to load news: ${error.message}`);
  }

  if (!data) {
    throw new Error('NEWS_NOT_FOUND');
  }

  return mapNewsRow(data);
}

export async function updateNews(params: {
  id: string;
  input: NewsUpdateInput;
}): Promise<NewsItem> {
  const adminClient = requireSupabaseAdmin();
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (params.input.title !== undefined) {
    updatePayload.title = params.input.title;
  }
  if (params.input.slug !== undefined) {
    updatePayload.slug = params.input.slug;
  }
  if (params.input.bodyMd !== undefined) {
    updatePayload.body_md = params.input.bodyMd;
  }
  if (params.input.coverKey !== undefined) {
    updatePayload.cover_key = params.input.coverKey ?? null;
  }
  if (params.input.categoryId !== undefined) {
    updatePayload.category_id = params.input.categoryId ?? null;
  }
  if (params.input.status !== undefined) {
    updatePayload.status = params.input.status;
  }
  if (params.input.audience !== undefined) {
    updatePayload.audience = params.input.audience;
  }
  if (params.input.attachments !== undefined) {
    updatePayload.attachments = params.input.attachments;
  }
  if (params.input.scheduledAt !== undefined) {
    updatePayload.scheduled_at = params.input.scheduledAt ?? null;
  }
  if (params.input.publishedAt !== undefined) {
    updatePayload.published_at = params.input.publishedAt ?? null;
  }

  const { data, error } = await adminClient
    .from('news')
    .update(updatePayload)
    .eq('id', params.id)
    .select(buildNewsSelect({ includeReviews: true }))
    .single<NewsRow>();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('NEWS_NOT_FOUND');
    }
    if (error.code === '23505') {
      throw new Error('NEWS_SLUG_EXISTS');
    }
    throw new Error(`Failed to update news: ${error.message}`);
  }

  if (!data) {
    throw new Error('NEWS_NOT_FOUND');
  }

  return mapNewsRow(data);
}

export async function deleteNews(id: string): Promise<void> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('news')
    .delete()
    .eq('id', id)
    .select('id')
    .single<{ id: string }>();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('NEWS_NOT_FOUND');
    }
    throw new Error(`Failed to delete news: ${error.message}`);
  }

  if (!data) {
    throw new Error('NEWS_NOT_FOUND');
  }
}

export async function createNewsImageUploadUrl(
  input: NewsImagePresignInput
): Promise<NewsImagePresignResult> {
  const adminClient = requireSupabaseAdmin();

  const objectPath = resolveNewsImagePath(input);

  const { data, error } = await adminClient.storage
    .from(NEWS_IMAGES_BUCKET)
    .createSignedUploadUrl(objectPath);

  if (error || !data) {
    throw new Error(
      `Failed to create signed upload url: ${error?.message ?? 'unknown error'}`
    );
  }

  return {
    bucket: NEWS_IMAGES_BUCKET,
    storageKey: objectPath,
    uploadUrl: data.signedUrl,
    token: data.token ?? null,
    path: data.path ?? objectPath,
    headers: {
      'Content-Type': input.fileType,
      'x-upsert': 'false',
    },
  };
}

export async function createNewsAttachmentUploadUrl(
  input: NewsAttachmentPresignInput
): Promise<NewsAttachmentPresignResult> {
  const adminClient = requireSupabaseAdmin();
  const { objectPath, storageKey } = resolveInternalNewsAttachmentPath(
    input.fileName
  );

  const { data, error } = await adminClient.storage
    .from(INTERNAL_NEWS_BUCKET)
    .createSignedUploadUrl(objectPath);

  if (error || !data) {
    throw new Error(
      `Failed to create attachment upload url: ${
        error?.message ?? 'unknown error'
      }`
    );
  }

  return {
    attachmentId: randomUUID(),
    bucket: INTERNAL_NEWS_BUCKET,
    storageKey,
    uploadUrl: data.signedUrl,
    token: data.token ?? null,
    path: data.path ?? objectPath,
    headers: {
      'Content-Type': input.fileType,
      'x-upsert': 'false',
    },
  };
}

export async function approveNews(params: {
  newsId: string;
  reviewerId: string;
  input: NewsApproveInput;
  ipAddress?: string | null;
  userAgent?: string | null;
  now?: Date;
}): Promise<{ news: NewsItem; review: NewsReview }> {
  const now = params.now ?? new Date();
  const nowIso = now.toISOString();
  const comment = sanitizeReviewComment(params.input.comment ?? null);

  const existing = await getNewsById(params.newsId);

  if (existing.status !== 'pending_review') {
    throw new Error('NEWS_INVALID_STATE');
  }

  const adminClient = requireSupabaseAdmin();

  const scheduledAtMs = existing.scheduledAt
    ? Date.parse(existing.scheduledAt)
    : null;
  const nextStatus: NewsStatus =
    scheduledAtMs !== null && scheduledAtMs > now.getTime()
      ? 'scheduled'
      : 'published';

  const updatePayload: Record<string, unknown> = {
    status: nextStatus,
    updated_at: nowIso,
  };

  let nextPublishedAt = existing.publishedAt ?? null;

  if (nextStatus === 'published') {
    nextPublishedAt = existing.publishedAt ?? nowIso;
    updatePayload.published_at = nextPublishedAt;
    updatePayload.scheduled_at = null;
  }

  const { error: updateError } = await adminClient
    .from('news')
    .update(updatePayload)
    .eq('id', params.newsId);

  if (updateError) {
    throw new Error(`Failed to approve news: ${updateError.message}`);
  }

  const review = await insertNewsReview({
    newsId: params.newsId,
    reviewerId: params.reviewerId,
    action: 'approve',
    comment,
    createdAt: nowIso,
  });

  await logNewsAudit({
    actorId: params.reviewerId,
    action: 'news.approved',
    newsId: params.newsId,
    diff: {
      status: { before: existing.status, after: nextStatus },
      publishedAt: { before: existing.publishedAt, after: nextPublishedAt },
      reviewComment: { before: null, after: comment },
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  const updated = await getNewsById(params.newsId);

  if (nextStatus === 'published') {
    await notifyInvestorsOfPublishedNews({
      newsId: updated.id,
      title: updated.title,
      slug: updated.slug,
      publishedAt: updated.publishedAt ?? nextPublishedAt ?? nowIso,
    });
  }

  if (updated.author?.id) {
    await notifyAuthorOfNewsApproval({
      newsId: updated.id,
      authorId: updated.author.id,
      reviewerId: params.reviewerId,
      title: updated.title,
      comment,
      status: nextStatus,
    });
  }

  return { news: updated, review };
}

export async function rejectNews(params: {
  newsId: string;
  reviewerId: string;
  input: NewsRejectInput;
  ipAddress?: string | null;
  userAgent?: string | null;
  now?: Date;
}): Promise<{ news: NewsItem; review: NewsReview }> {
  const now = params.now ?? new Date();
  const nowIso = now.toISOString();
  const comment = sanitizeReviewComment(params.input.comment);

  if (!comment) {
    throw new Error('NEWS_REVIEW_COMMENT_REQUIRED');
  }

  const existing = await getNewsById(params.newsId);

  if (existing.status !== 'pending_review') {
    throw new Error('NEWS_INVALID_STATE');
  }

  const adminClient = requireSupabaseAdmin();

  const updatePayload: Record<string, unknown> = {
    status: 'rejected',
    updated_at: nowIso,
    scheduled_at: null,
    published_at: null,
  };

  const { error: updateError } = await adminClient
    .from('news')
    .update(updatePayload)
    .eq('id', params.newsId);

  if (updateError) {
    throw new Error(`Failed to reject news: ${updateError.message}`);
  }

  const review = await insertNewsReview({
    newsId: params.newsId,
    reviewerId: params.reviewerId,
    action: 'reject',
    comment,
    createdAt: nowIso,
  });

  await logNewsAudit({
    actorId: params.reviewerId,
    action: 'news.rejected',
    newsId: params.newsId,
    diff: {
      status: { before: existing.status, after: 'rejected' },
      scheduledAt: { before: existing.scheduledAt, after: null },
      publishedAt: { before: existing.publishedAt, after: null },
      reviewComment: { before: null, after: comment },
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  const updated = await getNewsById(params.newsId);

  if (updated.author?.id) {
    await notifyAuthorOfNewsRejection({
      newsId: updated.id,
      authorId: updated.author.id,
      reviewerId: params.reviewerId,
      title: updated.title,
      comment,
    });
  }

  return { news: updated, review };
}

export async function publishNews(params: {
  newsId: string;
  actorId: string;
  input: NewsPublishInput;
  ipAddress?: string | null;
  userAgent?: string | null;
  now?: Date;
}): Promise<NewsItem> {
  const now = params.now ?? new Date();
  const nowIso = now.toISOString();
  const publishAtIso = params.input.publishedAt ?? nowIso;

  const existing = await getNewsById(params.newsId);

  if (existing.status === 'published') {
    throw new Error('NEWS_ALREADY_PUBLISHED');
  }

  const allowedStatuses: NewsStatus[] = [
    'draft',
    'pending_review',
    'scheduled',
  ];
  if (!allowedStatuses.includes(existing.status)) {
    throw new Error('NEWS_INVALID_STATE');
  }

  const adminClient = requireSupabaseAdmin();

  const { error: updateError } = await adminClient
    .from('news')
    .update({
      status: 'published',
      published_at: publishAtIso,
      scheduled_at: null,
      updated_at: nowIso,
    })
    .eq('id', params.newsId);

  if (updateError) {
    throw new Error(`Failed to publish news: ${updateError.message}`);
  }

  await logNewsAudit({
    actorId: params.actorId,
    action: 'news.published',
    newsId: params.newsId,
    diff: {
      status: { before: existing.status, after: 'published' },
      publishedAt: { before: existing.publishedAt, after: publishAtIso },
      scheduledAt: { before: existing.scheduledAt, after: null },
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  const updated = await getNewsById(params.newsId);

  if (updated.author?.id) {
    await notifyAuthorOfNewsApproval({
      newsId: updated.id,
      authorId: updated.author.id,
      reviewerId: params.actorId,
      title: updated.title,
      status: updated.status,
      comment: null,
    });
  }

  await notifyInvestorsOfPublishedNews({
    newsId: updated.id,
    title: updated.title,
    slug: updated.slug,
    publishedAt: updated.publishedAt ?? publishAtIso,
  });

  return updated;
}

export async function listPublishedNews(
  query: PublicNewsListQuery
): Promise<PublicNewsListResult> {
  const adminClient = requireSupabaseAdmin();
  const page = query.page ?? 1;
  const limit = query.limit ?? 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await adminClient
    .from('news')
    .select('id,title,slug,body_md,cover_key,published_at,created_at')
    .eq('status', 'published')
    .eq('audience', 'public')
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to list published news: ${error.message}`);
  }

  const rows = (data ?? []) as Array<{
    id: string;
    title: string;
    slug: string;
    body_md: string;
    cover_key: string | null;
    published_at: string | null;
    created_at: string;
  }>;

  const news = rows.map(row => mapPublicNewsRow(row));
  const total = count ?? 0;
  const pageCount = Math.ceil(total / limit) || 0;

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

export async function getPublishedNewsById(
  id: string
): Promise<PublicNewsDetail> {
  const adminClient = requireSupabaseAdmin();

  const { data, error } = await adminClient
    .from('news')
    .select(
      'id,title,slug,body_md,cover_key,published_at,created_at,updated_at,status,audience'
    )
    .eq('id', id)
    .single<{
      id: string;
      title: string;
      slug: string;
      body_md: string;
      cover_key: string | null;
      published_at: string | null;
      created_at: string;
      updated_at: string;
      status: NewsStatus;
    }>();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('NEWS_NOT_FOUND');
    }
    throw new Error(`Failed to load published news: ${error.message}`);
  }

  if (!data || data.status !== 'published' || data.audience !== 'public') {
    throw new Error('NEWS_NOT_FOUND');
  }

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    bodyMd: data.body_md,
    coverKey: data.cover_key,
    publishedAt: data.published_at ?? data.created_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function listInternalInvestorNews(
  query: PublicNewsListQuery
): Promise<InvestorInternalNewsListResult> {
  const adminClient = requireSupabaseAdmin();
  const page = query.page ?? 1;
  const limit = query.limit ?? 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await adminClient
    .from('news')
    .select(
      'id,title,slug,body_md,cover_key,published_at,created_at,attachments'
    )
    .eq('status', 'published')
    .eq('audience', 'investor_internal')
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to list internal news: ${error.message}`);
  }

  const total = count ?? 0;
  const pageCount = Math.ceil(total / limit) || 0;
  const hasNext = page < pageCount;
  const rows =
    (data ?? []) as Array<{
      id: string;
      title: string;
      slug: string;
      body_md: string;
      cover_key: string | null;
      published_at: string | null;
      created_at: string;
      attachments: unknown;
    }>;

  const news = await Promise.all(
    rows.map(async row => {
      const attachments = await enrichAttachmentsWithSignedUrls(
        sanitizeNewsAttachments(row.attachments)
      );

      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: createExcerpt(row.body_md),
        coverKey: row.cover_key,
        publishedAt: row.published_at ?? row.created_at,
        attachments,
      };
    })
  );

  return {
    news,
    meta: {
      page,
      limit,
      total,
      pageCount,
      hasNext,
    },
  };
}

export async function getInternalInvestorNewsById(
  id: string
): Promise<InvestorInternalNewsDetail> {
  const adminClient = requireSupabaseAdmin();

  const { data, error } = await adminClient
    .from('news')
    .select(
      'id,title,slug,body_md,cover_key,published_at,created_at,updated_at,status,audience,attachments'
    )
    .eq('id', id)
    .eq('audience', 'investor_internal')
    .single<{
      id: string;
      title: string;
      slug: string;
      body_md: string;
      cover_key: string | null;
      published_at: string | null;
      created_at: string;
      updated_at: string;
      status: NewsStatus;
      audience: NewsAudience;
      attachments: unknown;
    }>();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('NEWS_NOT_FOUND');
    }
    throw new Error(`Failed to load internal news detail: ${error.message}`);
  }

  if (
    !data ||
    data.status !== 'published' ||
    data.audience !== 'investor_internal'
  ) {
    throw new Error('NEWS_NOT_FOUND');
  }

  const attachments = await enrichAttachmentsWithSignedUrls(
    sanitizeNewsAttachments(data.attachments)
  );

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    bodyMd: data.body_md,
    coverKey: data.cover_key,
    publishedAt: data.published_at ?? data.created_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    attachments,
  };
}

export async function publishScheduledNews(
  now: Date = new Date()
): Promise<NewsItem[]> {
  const adminClient = requireSupabaseAdmin();
  const nowIso = now.toISOString();

  const { data: dueNews, error: dueError } = await adminClient
    .from('news')
    .select(buildNewsSelect())
    .eq('status', 'scheduled')
    .lte('scheduled_at', nowIso);

  if (dueError) {
    throw new Error(`Failed to load scheduled news: ${dueError.message}`);
  }

  const dueRows = (dueNews ?? []) as unknown as NewsRow[];

  if (dueRows.length === 0) {
    return [];
  }

  const ids = dueRows.map(row => row.id);

  const { data: updatedRows, error: updateError } = await adminClient
    .from('news')
    .update({
      status: 'published',
      published_at: nowIso,
      updated_at: nowIso,
    })
    .in('id', ids)
    .select(buildNewsSelect());

  if (updateError) {
    throw new Error(`Failed to publish scheduled news: ${updateError.message}`);
  }

  const rows = (updatedRows ?? []) as unknown as NewsRow[];
  const publishedItems = rows.map(row => mapNewsRow(row));

  await Promise.all(
    publishedItems.map(item =>
      notifyInvestorsOfPublishedNews({
        newsId: item.id,
        title: item.title,
        slug: item.slug,
        publishedAt: item.publishedAt ?? nowIso,
      })
    )
  );

  return publishedItems;
}
