import { requireSupabaseAdmin } from '../lib/supabase';
import type {
  NewsCreateInput,
  NewsListQuery,
  NewsStatus,
  NewsUpdateInput,
} from '../schemas/news.schema';

type MaybeArray<T> = T | T[] | null | undefined;

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
  category: { id: string; name: string; slug: string } | null;
  author: { id: string; email: string | null } | null;
  createdAt: string;
  updatedAt: string;
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

function mapNewsRow(row: NewsRow): NewsItem {
  const category = firstOrNull(row.category ?? null);
  const author = firstOrNull(row.author ?? null);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    bodyMd: row.body_md,
    coverKey: row.cover_key,
    status: row.status,
    scheduledAt: row.scheduled_at,
    publishedAt: row.published_at,
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
  };
}

function escapeLikePattern(input: string): string {
  return input.replace(/[%_]/g, match => `\\${match}`);
}

function buildNewsSelect() {
  return `
    id,
    title,
    slug,
    body_md,
    cover_key,
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
}

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
    .select(buildNewsSelect())
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
    .select(buildNewsSelect())
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
