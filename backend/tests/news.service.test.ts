jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

jest.mock('../src/services/notification.service', () => ({
  notifyInvestorsOfPublishedNews: jest.fn(),
}));

jest.mock('crypto', () => ({
  randomUUID: jest.fn(
    () => 'abc12345-6789-4abc-8def-1234567890ab'
  ),
}));

import {
  createNews,
  deleteNews,
  getNewsById,
  createNewsImageUploadUrl,
  listNews,
  publishScheduledNews,
  updateNews,
} from '../src/services/news.service';
import type { NewsCreateInput, NewsUpdateInput } from '../src/schemas/news.schema';
import { requireSupabaseAdmin } from '../src/lib/supabase';
import * as crypto from 'crypto';
import { notifyInvestorsOfPublishedNews } from '../src/services/notification.service';

const mockRequireSupabaseAdmin = requireSupabaseAdmin as jest.Mock;
const mockNotifyPublished = notifyInvestorsOfPublishedNews as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockNotifyPublished.mockReset();
});

describe('news.service', () => {
  describe('createNewsImageUploadUrl', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-15T10:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('creates signed upload url for news images', async () => {
      const createSignedUploadUrlMock = jest.fn().mockResolvedValue({
        data: {
          signedUrl: 'https://supabase.storage/upload',
          token: 'token-123',
          path: 'cover/2025/01/abc123.png',
        },
        error: null,
      });

      mockRequireSupabaseAdmin.mockReturnValue({
        storage: {
          from: jest.fn().mockReturnValue({
            createSignedUploadUrl: createSignedUploadUrlMock,
          }),
        },
      });

      const result = await createNewsImageUploadUrl({
        fileName: 'Cover.PNG',
        fileType: 'image/png',
        fileSize: 512_000,
        variant: 'cover',
      });

      expect((crypto.randomUUID as jest.Mock)).toHaveBeenCalled();
      expect(createSignedUploadUrlMock).toHaveBeenCalledWith(
        'cover/2025/01/abc12345-6789-4abc-8def-1234567890ab.png'
      );
      expect(result).toEqual(
        expect.objectContaining({
          bucket: 'news-images',
          storageKey:
            'cover/2025/01/abc12345-6789-4abc-8def-1234567890ab.png',
          uploadUrl: 'https://supabase.storage/upload',
          headers: expect.objectContaining({ 'Content-Type': 'image/png' }),
        })
      );

    });

    it('throws when storage operation fails', async () => {
      mockRequireSupabaseAdmin.mockReturnValue({
        storage: {
          from: jest.fn().mockReturnValue({
            createSignedUploadUrl: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'failed' },
            }),
          }),
        },
      });

      await expect(
        createNewsImageUploadUrl({
          fileName: 'cover.png',
          fileType: 'image/png',
          fileSize: 1024,
          variant: 'cover',
        })
      ).rejects.toThrow('Failed to create signed upload url: failed');
    });
  });

  describe('publishScheduledNews', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-02-01T08:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns empty array when no scheduled news', async () => {
      const fromMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            lte: jest.fn().mockReturnValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      mockRequireSupabaseAdmin.mockReturnValue({
        from: fromMock,
      });

      const result = await publishScheduledNews();

      expect(result).toEqual([]);
      expect(mockNotifyPublished).not.toHaveBeenCalled();
    });

    it('publishes due news and notifies investors', async () => {
      const selectBuilder = {
        eq: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnValue({
          data: [
            {
              id: 'news-1',
              title: 'Scheduled article',
              slug: 'scheduled-article',
              body_md: '# content',
              cover_key: null,
              status: 'scheduled',
              scheduled_at: '2025-02-01T07:00:00Z',
              published_at: null,
              author_id: 'admin-1',
              category_id: null,
              created_at: '2025-01-30T00:00:00Z',
              updated_at: '2025-01-30T00:00:00Z',
              category: null,
              author: [{ id: 'admin-1', email: 'admin@example.com' }],
            },
          ],
          error: null,
        }),
      };

      const updateBuilder = {
        select: jest.fn().mockReturnValue({
          data: [
            {
              id: 'news-1',
              title: 'Scheduled article',
              slug: 'scheduled-article',
              body_md: '# content',
              cover_key: null,
              status: 'published',
              scheduled_at: '2025-02-01T07:00:00Z',
              published_at: '2025-02-01T08:00:00Z',
              author_id: 'admin-1',
              category_id: null,
              created_at: '2025-01-30T00:00:00Z',
              updated_at: '2025-02-01T08:00:00Z',
              category: null,
              author: [{ id: 'admin-1', email: 'admin@example.com' }],
            },
          ],
          error: null,
        }),
      };

      const fromMock = jest.fn().mockImplementation((table: string) => {
        if (table === 'news') {
          return {
            select: () => selectBuilder,
            update: () => ({
              in: () => updateBuilder,
            }),
          };
        }
        throw new Error(`Unexpected table ${table}`);
      });

      mockRequireSupabaseAdmin.mockReturnValue({
        from: fromMock,
      });

      const result = await publishScheduledNews(new Date('2025-02-01T08:00:00Z'));

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'news-1',
          status: 'published',
          publishedAt: '2025-02-01T08:00:00Z',
        })
      );
      expect(mockNotifyPublished).toHaveBeenCalledWith(
        expect.objectContaining({
          newsId: 'news-1',
          slug: 'scheduled-article',
        })
      );
    });

    it('throws when select fails', async () => {
      mockRequireSupabaseAdmin.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: () => ({
            eq: () => ({
              lte: () => ({
                data: null,
                error: { message: 'boom' },
              }),
            }),
          }),
        }),
      });

      await expect(publishScheduledNews()).rejects.toThrow(
        'Failed to load scheduled news: boom'
      );
    });
  });
  describe('createNews', () => {
    it('creates a news item successfully', async () => {
      const singleMock = jest.fn().mockResolvedValue({
        data: {
          id: 'news-1',
          title: 'Hello world',
          slug: 'hello-world',
          body_md: '# Hello',
          cover_key: null,
          status: 'draft',
          scheduled_at: null,
          published_at: null,
          author_id: 'admin-1',
          category_id: null,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          category: null,
          author: [{ id: 'admin-1', email: 'admin@example.com' }],
        },
        error: null,
      });
      const selectMock = jest.fn().mockReturnValue({ single: singleMock });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });
      const fromMock = jest.fn().mockReturnValue({ insert: insertMock });

      mockRequireSupabaseAdmin.mockReturnValue({
        from: fromMock,
      });

      const input: NewsCreateInput = {
        title: 'Hello world',
        slug: 'hello-world',
        bodyMd: '# Hello',
        coverKey: null,
        categoryId: null,
        status: 'draft',
        scheduledAt: null,
        publishedAt: null,
      };

      const result = await createNews({ authorId: 'admin-1', input });

      expect(fromMock).toHaveBeenCalledWith('news');
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Hello world',
          slug: 'hello-world',
          author_id: 'admin-1',
        })
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: 'news-1',
          title: 'Hello world',
          slug: 'hello-world',
          author: { id: 'admin-1', email: 'admin@example.com' },
        })
      );
    });

    it('throws when slug already exists', async () => {
      const singleMock = jest.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint' },
      });
      const selectMock = jest.fn().mockReturnValue({ single: singleMock });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });
      const fromMock = jest.fn().mockReturnValue({ insert: insertMock });

      mockRequireSupabaseAdmin.mockReturnValue({ from: fromMock });

      await expect(
        createNews({
          authorId: 'admin-1',
          input: {
            title: 'Hello world',
            slug: 'hello-world',
            bodyMd: '# Hello',
            coverKey: null,
            categoryId: null,
            status: 'draft',
            scheduledAt: null,
            publishedAt: null,
          },
        })
      ).rejects.toThrow('NEWS_SLUG_EXISTS');
    });
  });

  describe('listNews', () => {
    it('lists news with pagination and filters', async () => {
      const rangeMock = jest.fn().mockResolvedValue({
        data: [
          {
            id: 'news-1',
            title: 'Hello world',
            slug: 'hello-world',
            body_md: '# Hello',
            cover_key: null,
            status: 'draft',
            scheduled_at: null,
            published_at: null,
            author_id: 'admin-1',
            category_id: 'cat-1',
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z',
            category: [{ id: 'cat-1', name: 'Deals', slug: 'deals' }],
            author: [{ id: 'admin-1', email: 'admin@example.com' }],
          },
        ],
        error: null,
        count: 1,
      });

      const builder: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: rangeMock,
      };
      builder.order.mockReturnValue(builder);

      const fromMock = jest.fn().mockReturnValue(builder);
      mockRequireSupabaseAdmin.mockReturnValue({
        from: fromMock,
      });

      const result = await listNews({
        page: 1,
        limit: 10,
        status: 'draft',
        search: 'hello',
        categoryId: 'cat-1',
        sortBy: 'created_at',
        order: 'desc',
      });

      expect(builder.eq).toHaveBeenCalledWith('status', 'draft');
      expect(builder.eq).toHaveBeenCalledWith('category_id', 'cat-1');
      expect(builder.or).toHaveBeenCalledWith(
        expect.stringContaining('title.ilike.%hello%')
      );
      expect(rangeMock).toHaveBeenCalledWith(0, 9);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        pageCount: 1,
        hasNext: false,
      });
      expect(result.news[0].category).toEqual({
        id: 'cat-1',
        name: 'Deals',
        slug: 'deals',
      });
    });

    it('throws when supabase fails', async () => {
      const rangeMock = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'boom' },
        count: null,
      });
      const builder: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: rangeMock,
      };
      builder.order.mockReturnValue(builder);

      mockRequireSupabaseAdmin.mockReturnValue({
        from: jest.fn().mockReturnValue(builder),
      });

      await expect(listNews({ page: 1, limit: 10 })).rejects.toThrow(
        'Failed to list news: boom'
      );
    });
  });

  describe('getNewsById', () => {
    it('returns news detail', async () => {
      const singleMock = jest.fn().mockResolvedValue({
        data: {
          id: 'news-1',
          title: 'Hello world',
          slug: 'hello-world',
          body_md: '# Hello',
          cover_key: null,
          status: 'draft',
          scheduled_at: null,
          published_at: null,
          author_id: 'admin-1',
          category_id: null,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          category: null,
          author: [{ id: 'admin-1', email: 'admin@example.com' }],
        },
        error: null,
      });

      mockRequireSupabaseAdmin.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: singleMock,
            }),
          }),
        }),
      });

      const result = await getNewsById('news-1');
      expect(result.slug).toBe('hello-world');
      expect(result.author?.email).toBe('admin@example.com');
    });

    it('throws when not found', async () => {
      const singleMock = jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      });

      mockRequireSupabaseAdmin.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: singleMock,
            }),
          }),
        }),
      });

      await expect(getNewsById('missing')).rejects.toThrow('NEWS_NOT_FOUND');
    });
  });

  describe('updateNews', () => {
    it('updates news item', async () => {
      const adminClient = {
        from: jest.fn().mockReturnValue({
          update: (payload: Record<string, unknown>) => ({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'news-1',
                    title: payload.title ?? 'Updated',
                    slug: 'hello-world',
                    body_md: payload.body_md ?? '# Updated',
                    cover_key: null,
                    status: payload.status ?? 'published',
                    scheduled_at: payload.scheduled_at ?? null,
                    published_at: payload.published_at ?? '2025-01-02T00:00:00Z',
                    author_id: 'admin-1',
                    category_id: null,
                    created_at: '2025-01-01T00:00:00Z',
                    updated_at: payload.updated_at as string,
                    category: null,
                    author: [{ id: 'admin-1', email: 'admin@example.com' }],
                  },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };

      mockRequireSupabaseAdmin.mockReturnValue(adminClient);

      const result = await updateNews({
        id: 'news-1',
        input: {
          title: 'Updated',
          bodyMd: '# Updated',
          status: 'published',
          publishedAt: '2025-01-02T00:00:00Z',
        } satisfies NewsUpdateInput,
      });

      expect(result.title).toBe('Updated');
      expect(result.status).toBe('published');
      expect(result.publishedAt).toBe('2025-01-02T00:00:00Z');
    });

    it('throws when slug exists on update', async () => {
      const singleMock = jest.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key' },
      });

      mockRequireSupabaseAdmin.mockReturnValue({
        from: jest.fn().mockReturnValue({
          update: () => ({
            eq: () => ({
              select: () => ({ single: singleMock }),
            }),
          }),
        }),
      });

      await expect(
        updateNews({
          id: 'news-1',
          input: { slug: 'existing-slug' },
        })
      ).rejects.toThrow('NEWS_SLUG_EXISTS');
    });
  });

  describe('deleteNews', () => {
    it('deletes news item', async () => {
      const singleMock = jest.fn().mockResolvedValue({
        data: { id: 'news-1' },
        error: null,
      });

      mockRequireSupabaseAdmin.mockReturnValue({
        from: jest.fn().mockReturnValue({
          delete: () => ({
            eq: () => ({
              select: () => ({
                single: singleMock,
              }),
            }),
          }),
        }),
      });

      await deleteNews('news-1');
      expect(singleMock).toHaveBeenCalled();
    });

    it('throws when news not found', async () => {
      const singleMock = jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      });

      mockRequireSupabaseAdmin.mockReturnValue({
        from: jest.fn().mockReturnValue({
          delete: () => ({
            eq: () => ({
              select: () => ({
                single: singleMock,
              }),
            }),
          }),
        }),
      });

      await expect(deleteNews('missing')).rejects.toThrow('NEWS_NOT_FOUND');
    });
  });
});

