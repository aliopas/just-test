jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

jest.mock('../src/services/notification.service', () => ({
  notifyInvestorsOfPublishedNews: jest.fn(),
  notifyAuthorOfNewsApproval: jest.fn(),
  notifyAuthorOfNewsRejection: jest.fn(),
}));

jest.mock('crypto', () => ({
  randomUUID: jest.fn(
    () => 'abc12345-6789-4abc-8def-1234567890ab'
  ),
}));

import {
  approveNews,
  createNews,
  deleteNews,
  getNewsById,
  createNewsImageUploadUrl,
  listNews,
  publishScheduledNews,
  listPublishedNews,
  getPublishedNewsById,
  rejectNews,
  updateNews,
} from '../src/services/news.service';
import type { NewsCreateInput, NewsUpdateInput } from '../src/schemas/news.schema';
import { requireSupabaseAdmin } from '../src/lib/supabase';
import * as crypto from 'crypto';
import {
  notifyAuthorOfNewsApproval,
  notifyAuthorOfNewsRejection,
  notifyInvestorsOfPublishedNews,
} from '../src/services/notification.service';

const mockRequireSupabaseAdmin = requireSupabaseAdmin as jest.Mock;
const mockNotifyPublished = notifyInvestorsOfPublishedNews as jest.Mock;
const mockNotifyAuthorApproval =
  notifyAuthorOfNewsApproval as jest.Mock;
const mockNotifyAuthorRejection =
  notifyAuthorOfNewsRejection as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockNotifyPublished.mockReset();
  mockNotifyAuthorApproval.mockReset();
  mockNotifyAuthorRejection.mockReset();
  mockRequireSupabaseAdmin.mockReset();
});

function setupAdminClient(overrides: Partial<Record<string, unknown>> = {}) {
  const baseRecord: any = {
    id: 'news-1',
    title: 'Breaking update',
    slug: 'breaking-update',
    body_md: '# content',
    cover_key: null,
    status: 'pending_review',
    scheduled_at: null,
    published_at: null,
    author_id: 'author-1',
    category_id: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    category: null,
    author: [{ id: 'author-1', email: 'author@example.com' }],
  };

  const newsRecord: any = { ...baseRecord, ...overrides };
  const reviews: any[] = [];

  const newsBuilder: any = {
    select: jest.fn(() => newsBuilder),
    eq: jest.fn(() => newsBuilder),
    single: jest.fn(async () => ({
      data: {
        ...newsRecord,
        reviews: reviews.length > 0 ? reviews : null,
      },
      error: null,
    })),
    update: jest.fn((payload: Record<string, unknown>) => {
      Object.assign(newsRecord, payload);
      return {
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
    }),
    delete: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: newsRecord.id },
            error: null,
          }),
        }),
      }),
    }),
  };

  const newsReviewsBuilder = {
    insert: jest
      .fn()
      .mockImplementation(
        (payload: {
          news_id: string;
          reviewer_id: string;
          action: 'approve' | 'reject';
          comment: string | null;
          created_at: string;
        }) => {
          const reviewRow = {
            id: `review-${reviews.length + 1}`,
            action: payload.action,
            comment: payload.comment,
            created_at: payload.created_at,
            reviewer: [
              {
                id: payload.reviewer_id,
                email: 'reviewer@example.com',
              },
            ],
          };
          reviews.push(reviewRow);
          return {
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: reviewRow,
                error: null,
              }),
            }),
          };
        }
      ),
  };

  const auditLogsBuilder = {
    insert: jest.fn().mockResolvedValue({ error: null }),
  };

  const adminClient = {
    from: jest.fn((table: string) => {
      if (table === 'news') {
        return newsBuilder;
      }
      if (table === 'news_reviews') {
        return newsReviewsBuilder;
      }
      if (table === 'audit_logs') {
        return auditLogsBuilder;
      }
      throw new Error(`Unexpected table ${table}`);
    }),
  };

  mockRequireSupabaseAdmin.mockReturnValue(adminClient);

  return {
    newsRecord,
    reviews,
    newsBuilder,
    newsReviewsBuilder,
    auditLogsBuilder,
  };
}
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

  describe('approveNews', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-03-01T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('publishes immediately and notifies interested parties', async () => {
      const { newsBuilder } = setupAdminClient();

      const result = await approveNews({
        newsId: 'news-1',
        reviewerId: 'reviewer-1',
        input: { comment: 'Looks good' },
        ipAddress: '127.0.0.1',
        userAgent: 'jest',
      });

      expect(newsBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'published',
          published_at: '2025-03-01T12:00:00.000Z',
        })
      );
      expect(result.news.status).toBe('published');
      expect(result.review).toEqual(
        expect.objectContaining({
          action: 'approve',
          comment: 'Looks good',
        })
      );
      expect(result.news.reviews).toHaveLength(1);
      expect(mockNotifyPublished).toHaveBeenCalledWith(
        expect.objectContaining({
          newsId: 'news-1',
          slug: 'breaking-update',
        })
      );
      expect(mockNotifyAuthorApproval).toHaveBeenCalledWith(
        expect.objectContaining({
          newsId: 'news-1',
          authorId: 'author-1',
          status: 'published',
          comment: 'Looks good',
        })
      );
      expect(mockNotifyAuthorRejection).not.toHaveBeenCalled();
    });

    it('keeps scheduled status when scheduled in the future', async () => {
      const futureDate = '2025-04-01T10:00:00Z';
      const { newsRecord, newsBuilder } = setupAdminClient({
        scheduled_at: futureDate,
      });
      newsRecord.status = 'pending_review';

      const result = await approveNews({
        newsId: 'news-1',
        reviewerId: 'reviewer-1',
        input: {},
      });

      expect(newsBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'scheduled',
        })
      );
      expect(result.news.status).toBe('scheduled');
      expect(result.news.publishedAt).toBeNull();
      expect(mockNotifyPublished).not.toHaveBeenCalled();
      expect(mockNotifyAuthorApproval).toHaveBeenCalledWith(
        expect.objectContaining({
          newsId: 'news-1',
          status: 'scheduled',
        })
      );
    });

    it('throws when news is not pending review', async () => {
      setupAdminClient({ status: 'draft' });

      await expect(
        approveNews({
          newsId: 'news-1',
          reviewerId: 'reviewer-1',
          input: {},
        })
      ).rejects.toThrow('NEWS_INVALID_STATE');

      expect(mockNotifyPublished).not.toHaveBeenCalled();
    });
  });

  describe('rejectNews', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-03-01T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('rejects news and records review', async () => {
      const { newsBuilder } = setupAdminClient();

      const result = await rejectNews({
        newsId: 'news-1',
        reviewerId: 'reviewer-1',
        input: { comment: 'Needs more sources' },
        ipAddress: '127.0.0.1',
        userAgent: 'jest',
      });

      expect(newsBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'rejected',
          scheduled_at: null,
          published_at: null,
        })
      );
      expect(result.news.status).toBe('rejected');
      expect(result.review.action).toBe('reject');
      expect(result.review.comment).toBe('Needs more sources');
      expect(result.news.reviews).toHaveLength(1);
      expect(mockNotifyAuthorRejection).toHaveBeenCalledWith(
        expect.objectContaining({
          newsId: 'news-1',
          authorId: 'author-1',
          comment: 'Needs more sources',
        })
      );
      expect(mockNotifyAuthorApproval).not.toHaveBeenCalled();
      expect(mockNotifyPublished).not.toHaveBeenCalled();
    });

    it('requires comment when rejecting', async () => {
      setupAdminClient();

      await expect(
        rejectNews({
          newsId: 'news-1',
          reviewerId: 'reviewer-1',
          input: { comment: '   ' },
        })
      ).rejects.toThrow('NEWS_REVIEW_COMMENT_REQUIRED');
    });

    it('throws when news is not pending review', async () => {
      setupAdminClient({ status: 'draft' });

      await expect(
        rejectNews({
          newsId: 'news-1',
          reviewerId: 'reviewer-1',
          input: { comment: 'Invalid state' },
        })
      ).rejects.toThrow('NEWS_INVALID_STATE');
    });
  });

  describe('listPublishedNews', () => {
    it('returns published news with pagination', async () => {
      const rangeMock = jest.fn().mockResolvedValue({
        data: [
          {
            id: 'news-1',
            title: 'Published item',
            slug: 'published-item',
            body_md: '# content',
            cover_key: null,
            published_at: '2025-03-01T12:00:00Z',
            created_at: '2025-02-28T00:00:00Z',
          },
        ],
        error: null,
        count: 1,
      });

      const builder: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: rangeMock,
      };
      builder.order.mockReturnValue(builder);

      mockRequireSupabaseAdmin.mockReturnValue({
        from: jest.fn().mockReturnValue(builder),
      });

      const result = await listPublishedNews({ page: 1, limit: 5 });

      expect(builder.eq).toHaveBeenCalledWith('status', 'published');
      expect(rangeMock).toHaveBeenCalledWith(0, 4);
      expect(result.news).toHaveLength(1);
      expect(result.news[0]).toEqual(
        expect.objectContaining({
          id: 'news-1',
          slug: 'published-item',
          publishedAt: '2025-03-01T12:00:00Z',
        })
      );
      expect(result.meta).toEqual(
        expect.objectContaining({
          page: 1,
          limit: 5,
          total: 1,
          pageCount: 1,
          hasNext: false,
        })
      );
    });

    it('throws when query fails', async () => {
      const rangeMock = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'boom' },
        count: null,
      });

      const builder: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: rangeMock,
      };
      builder.order.mockReturnValue(builder);

      mockRequireSupabaseAdmin.mockReturnValue({
        from: jest.fn().mockReturnValue(builder),
      });

      await expect(listPublishedNews({ page: 1, limit: 5 })).rejects.toThrow(
        'Failed to list published news: boom'
      );
    });
  });

  describe('getPublishedNewsById', () => {
    it('returns published news detail', async () => {
      const singleMock = jest.fn().mockResolvedValue({
        data: {
          id: 'news-1',
          title: 'Breaking update',
          slug: 'breaking-update',
          body_md: '# content',
          cover_key: null,
          published_at: '2025-03-01T12:00:00Z',
          created_at: '2025-02-28T00:00:00Z',
          updated_at: '2025-03-01T12:00:00Z',
          status: 'published',
        },
        error: null,
      });

      mockRequireSupabaseAdmin.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnValue({
            single: singleMock,
          }),
        }),
      });

      const result = await getPublishedNewsById('news-1');

      expect(result).toEqual(
        expect.objectContaining({
          id: 'news-1',
          slug: 'breaking-update',
          bodyMd: '# content',
        })
      );
    });

    it('throws when news is missing', async () => {
      const singleMock = jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      });

      mockRequireSupabaseAdmin.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnValue({
            single: singleMock,
          }),
        }),
      });

      await expect(getPublishedNewsById('missing')).rejects.toThrow(
        'NEWS_NOT_FOUND'
      );
    });

    it('throws when news is not published', async () => {
      const singleMock = jest.fn().mockResolvedValue({
        data: {
          id: 'news-1',
          title: 'Draft',
          slug: 'draft',
          body_md: '# content',
          cover_key: null,
          published_at: null,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          status: 'draft',
        },
        error: null,
      });

      mockRequireSupabaseAdmin.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnValue({
            single: singleMock,
          }),
        }),
      });

      await expect(getPublishedNewsById('news-1')).rejects.toThrow(
        'NEWS_NOT_FOUND'
      );
    });
  });
});

